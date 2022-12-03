import _ from "lodash";
import React, { useEffect } from "react";
import useMediaQuery from "./useMediaQuery";
import { useImmer } from "use-immer";
import { AnimationControls, TargetAndTransition } from "framer-motion";
import { motion } from "framer-motion";
import useElementSize from "./useElementSize";
import { Bird } from "../components/FlappyBird";
import { WritableDraft } from "immer/dist/internal";
import { v4 } from "uuid";

const HEIGHT = 64;
const WIDTH = 92;
const FRAMES = ["0px", "92px", "184px", "0px"];
type Size = {
  width: number;
  height: number;
};
type Coordinates = {
  x: number;
  y: number;
};

export type PipeType = {
  position: Coordinates;
  initial: Coordinates;
  size: Size;
  key?: string;
};
export type PipesType = {
  top: PipeType;
  bottom: PipeType;
};
interface GameContext extends GameState {
  getNextFrame: () => void;
  fly: () => void;
  fall: () => void;
  handleWindowClick: () => void;
  handlePiping: () => void;
  startGame: (window: Size) => void;
}
interface GameState {
  isColliding?: boolean;
  bird: {
    position: Coordinates;
    size: Size;
    animate: TargetAndTransition;
    frame: string;
    frameIndex: number;
    initial: Coordinates;
    isFlying: boolean;
    config: {
      fall: {
        distance: number;
        delay: number;
      };
      fly: {
        distance: number;
      };
      flap: {
        delay: number;
      };
    };
  };
  pipes: PipesType[];
  pipe: {
    width: number;
    height: number;
    extension: number;
    config: {
      delay: number;
      distance: number;
    };
    tolerance: number;
  };
  rounds: {
    score: number;
    datetime: string;
    key: string;
  }[];
  isStarted: boolean;
  isGameOver: boolean;
  isReady: boolean;
  isMobile: boolean;
  window: Size;
}
type StateDraft = WritableDraft<GameState>;
const GameContext = React.createContext<GameContext | null>(null);
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const window = useElementSize();
  const [state, setState] = useImmer<GameState>({
    bird: {
      position: { x: 0, y: 0 },
      size: { width: WIDTH, height: HEIGHT },
      animate: {},
      frame: FRAMES[0],
      frameIndex: 0,
      initial: {
        x: 0,
        y: 0,
      },
      isFlying: true,
      config: {
        fall: {
          distance: 5,
          delay: 30,
        },
        fly: {
          distance: 75,
        },
        flap: {
          delay: 100,
        },
      },
    },
    pipes: Array(4)
      .fill("")
      .map((pipe, index) => ({
        top: {
          key: "top" + index,
          position: { x: 0, y: 0 },
          initial: {
            x: 0,
            y: 0,
          },
          size: { width: 0, height: 0 },
        },
        bottom: {
          key: "bottom" + index,
          position: { x: 0, y: 0 },
          initial: {
            x: 0,
            y: 0,
          },
          size: { width: 0, height: 0 },
        },
      })),
    pipe: {
      width: 0,
      height: 0,
      extension: 0,
      config: {
        distance: 5,
        delay: 50,
      },
      tolerance: 20,
    },
    rounds: [],
    isStarted: false,
    isGameOver: false,
    isReady: false,
    isMobile: false,
    window: {
      width: 0,
      height: 0,
    },
  });
  const isMobile = useMediaQuery("(max-width: 640px)");
  // Main Events
  useEffect(() => {
    setState((draft) => {
      draft.isMobile = isMobile;
      return draft;
    });
  }, [isMobile]);
  // Main Functions
  const startGame = (window: Size) => {
    setState((draft) => {
      draft.window = window;
      draft.isReady = true;
      setBirdCenter(draft);
      setPipes(draft);
      return draft;
    });
  };
  // Pipe Functions
  const generatePipeExtension = (index: number, draft: StateDraft) => {
    const odd = _.random(0, 1) === 1;
    const randomNumber = _.random(odd ? 0.5 : 0, odd ? 1 : 0, true);
    const extension = randomNumber * draft.pipe.extension;
    return {
      height: draft.pipe.height + extension,
      y: draft.window.height - draft.pipe.height + extension,
    };
  };
  const setPipes = (draft: StateDraft) => {
    const window = draft.window;
    draft.pipe.width = window.width / draft.pipes.length;
    draft.pipe.height = (1 / 3) * window.height;
    draft.pipe.extension = (0.5 / 3) * window.height;
    draft.pipes.forEach((pipe, index) => {
      const { height, y } = generatePipeExtension(index, draft);
      var x = (index * 2 + 1) * draft.pipe.width + window.width;
      pipe.top.initial = {
        x,
        y: 0,
      };
      pipe.top.size = {
        height,
        width: draft.pipe.width,
      };
      pipe.bottom.initial = {
        x,
        y,
      };
      pipe.bottom.size = {
        height,
        width: draft.pipe.width,
      };
      pipe.top.position = pipe.top.initial;
      pipe.bottom.position = pipe.bottom.initial;
    });
  };
  const handlePiping = () => {
    setState((draft) => {
      draft.pipes.forEach((pipe, index) => {
        if (pipe.top.position.x + pipe.top.size.width * 2 <= 0) {
          const { height, y } = generatePipeExtension(index, draft);
          pipe.top.position.x = draft.pipe.width * 2 + draft.window.width;
          pipe.bottom.position.x = draft.pipe.width * 2 + draft.window.width;
          pipe.top.size.height = height;
          pipe.bottom.size.height = height;
          pipe.bottom.position.y = y;
          pipe.top.key = v4();
          pipe.bottom.key = v4();
        }
        pipe.top.position.x -= draft.pipe.config.distance;
        pipe.bottom.position.x -= draft.pipe.config.distance;
      });

      return draft;
    });
  };
  // Window Functions
  const handleWindowClick = () => {
    if (state.isStarted) {
      fly();
    } else {
      setState((draft) => {
        draft.isStarted = true;
        draft.isGameOver = false;
        draft.rounds.push({
          score: 0,
          datetime: new Date().toISOString(),
          key: v4(),
        });
        draft.bird.isFlying = true;
        setBirdCenter(draft);
        setPipes(draft);
        return draft;
      });
    }
  };
  // Bird Functions
  const setBirdCenter = (draft: StateDraft) => {
    draft.bird.position.x = draft.window.width / 2 - draft.bird.size.width / 2;
    draft.bird.position.y =
      draft.window.height / 2 - draft.bird.size.height / 2;
    draft.bird.initial.x = draft.bird.position.x;
    draft.bird.initial.y = draft.bird.position.y;
  };
  const getNextFrame = () =>
    setState((draft) => {
      var next = (draft.bird.frameIndex + 1) % FRAMES.length;
      draft.bird.frame = FRAMES[next];
      draft.bird.frameIndex = next;
      return draft;
    });
  const checkImpact = (draft: StateDraft) => {
    const groundImpact =
      draft.bird.position.y + draft.bird.size.height >=
      draft.window.height + draft.pipe.tolerance;
    const impactablePipes = draft.pipes.filter((pipe) => {
      return (
        pipe.top.position.x < draft.bird.position.x - draft.pipe.tolerance + draft.bird.size.width &&
        pipe.top.position.x + pipe.top.size.width > draft.bird.position.x + draft.pipe.tolerance
      );
    });
    const pipeImpact = impactablePipes.some((pipe) => {
      const topPipe = pipe.top.position.y + pipe.top.size.height;
      const bottomPipe = pipe.bottom.position.y;
      const birdTop = draft.bird.position.y + draft.pipe.tolerance;
      const birdBottom =
        draft.bird.position.y + draft.bird.size.height - draft.pipe.tolerance;
      return birdTop < topPipe || birdBottom > bottomPipe;
    });
    if (groundImpact || pipeImpact) {
      draft.bird.isFlying = false;
      draft.isGameOver = true;
      draft.isStarted = false;
    }
  };
  const handleBirdRotation = (draft: StateDraft) => {
    if (draft.bird.isFlying) {
      // if (draft.isStarted) {
      //   // In Game Rotation
      //   if (draft.bird.position.y > draft.window.height / 2) {
      //     draft.bird.animate.rotate = [-15, 15];
      //   } else {
      //     draft.bird.animate.rotate = [15, -15];
      //   }
      // } else {
      //   // Static Rotation
      //   draft.bird.animate.rotate = [5, -5];
      // }
      draft.bird.animate.rotate = [0, 0];
    } else {
      // Impact Rotation
      draft.bird.animate.rotate = [0, 540];
    }
  };
  const fly = () => {
    setState((draft) => {
      draft.bird.isFlying = true;
      draft.bird.position.y -= draft.bird.config.fly.distance;
      checkImpact(draft);
      handleBirdRotation(draft);
      return draft;
    });
  };

  const fall = () => {
    setState((draft) => {
      draft.bird.isFlying = true;
      draft.bird.position.y += draft.bird.config.fall.distance;
      checkImpact(draft);
      handleBirdRotation(draft);
      return draft;
    });
  };

  // const addPositions = (position: PositionType) =>
  //   setPositions((prev) => {
  //     return { ...prev, ...position };
  //   });
  // const removePositions = (keys: string[]) =>
  //   setPositions((positions) => {
  //     keys.forEach((key) => delete positions[key]);
  //     return { ...positions };
  //   });
  // const [round, setRound] = useImmer(0);
  // const getPosition = (key: string) => positions[key];
  // const detectCollision = () => {
  //   var bird = getPosition("bird");
  //   var pipes = _.filter(positions, (value, key) => key !== "bird");
  //   var birdX = bird.x + 30;
  //   return pipes.some((pipe) => {
  //     if (
  //       (pipe.x <= birdX && pipe.y <= 0 && bird.y <= 0 && bird.y <= pipe.y) ||
  //       (pipe.x <= birdX &&
  //         pipe.y >= 0 &&
  //         bird.y + 250 >= 0 &&
  //         bird.y + 250 >= pipe.y)
  //     ) {
  //       return true;
  //     }
  //   });
  // };
  // const isColliding = detectCollision();
  // const [ref, size] = useElementSize();
  // const [isStarted, setStart] = useImmer(false);
  // const startGame = () => {
  //   setStart(true);
  // };
  // const stopGame = () => setStart(false);
  // // useEffect(() => {
  // //   if (isColliding) {
  // //     stopGame();
  // //   }
  // // }, [isColliding]);
  // const moveUp = () => {
  //   setPositions((positions) => ({
  //     ...positions,
  //     bird: { ...positions.bird, y: positions.bird.y - 75 },
  //   }));
  // };
  // const moveDown = () => {
  //   setPositions((positions) => ({
  //     ...positions,
  //     bird: { ...positions.bird, y: positions.bird.y + 5 },
  //   }));
  // };
  // const handleTap = () => (isStarted ? moveUp() : startGame());

  return (
    <GameContext.Provider
      value={{
        ...state,
        getNextFrame,
        fall,
        fly,
        handleWindowClick,
        handlePiping,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default function useGame() {
  const context = React.useContext(GameContext);
  if (context === null) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
