import type { NextPage } from "next";
import Head from "next/head";
import { GameProvider } from "../hooks/useGame";
import Game from "../components/Game";
import Footer from "../components/Footer";
import Background from "../components/Background";
import { Bird } from "../components/FlappyBird";
import { motion } from "framer-motion";

const Home: NextPage = () => {
  return (
    <div className="fixed h-screen w-full flex bg-zinc-800 p-5">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
};

export default Home;
