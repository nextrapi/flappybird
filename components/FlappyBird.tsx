import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useGame from "../hooks/useGame";
import useInterval from "../hooks/useInterval";
export function Bird() {
  const {
    bird: {
      size: { height, width },
      frame,
      isFlying,
      config: {
        flap: { delay },
      },
    },
    getNextFrame,
  } = useGame();
  useInterval(() => getNextFrame(), isFlying ? delay : null);
  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      whileTap={{
        scale: 0.9,
      }}
      style={{
        backgroundImage: "url(/bird.png)",
        height,
        width,
        backgroundPosition: frame,
        backgroundSize: "auto 100%",
        zIndex: 100,
      }}
    />
  );
}
export default function FlappyBird() {
  const {
    isStarted,
    isGameOver,
    bird: { config, position, animate },
    fall,
  } = useGame();
  useInterval(
    () => fall(),
    isStarted && !isGameOver ? config.fall.delay : null
  );

  // const { y, x } = getPosition("bird");
  // useEffect(() => {
  //   // If game has started, start moving the bird down
  //   if (isStarted) {
  //     // If the bird's y position + it's size is not greater than the height of the screen
  //     // it means the bird is still flying
  //     if (y + BIRD_HEIGHT < size.height) {
  //       // if there was already a timer that was going to bring the bird down (with old y value), clear it
  //       if (timer) {
  //         clearInterval(timer);
  //         setTimer(null);
  //       }
  //       // set a new timer to bring the bird down with the new y value
  //       setTimer(
  //         setTimeout(() => {
  //           // if the bird is passed the middle of the screen, rotate him down
  //           if (y > size.height / 2) {
  //             setRotate([-15, 15]);
  //           } else {
  //             setRotate([15, -15]);
  //           }
  //           moveDown();
  //         }, 30)
  //       );
  //     } else {
  //       // if the bird hits the ground,stop any other tap, rotate him down and stop the game
  //       timer && clearInterval(timer);
  //       stopGame();
  //       setRotate([0, 540]);
  //     }
  //   } else {
  //     timer && clearInterval(timer);
  //   }
  // }, [y, isStarted]);
  // useEffect(() => {
  //   // on mount and every new round, set the bird's position to the initial position
  //   addPositions({
  //     bird: initialPosition,
  //   });
  // }, [round]);

  // useEffect(() => {
  //   // if the bird has collided with any of the pipes, rotate and scale him
  //   if (isStarted && isColliding) {
  //     setRotate([0, 450]);
  //     setScale([1, 1.05, 0.95, 1.1, 0.9, 1]);
  //   }
  // }, [isColliding]);
  return (
    <motion.div
      className={`m-auto absolute z-40 ${
        !isStarted && "animate-pulse"
      } w-20 h-10`}
      style={{
        ...position,
      }}
      animate={animate}
    >
      <Bird />
    </motion.div>
  );
}
