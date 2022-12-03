import type { NextPage } from "next";
import Head from "next/head";
import { GameProvider } from "../hooks/useGame";
import Game from "../components/Game";

const Home: NextPage = () => {
  return (
    <div className="fixed h-screen w-full flex bg-zinc-800 p-5">
      <Head>
        <title>Flappy Bird</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
};

export default Home;
