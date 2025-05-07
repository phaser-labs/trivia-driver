import { useEffect, useRef } from "react";

import PhaserGame from "../game/main";


export const GameCanvas = () => {

  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainer.current) return;
    const game = new PhaserGame(gameContainer.current);
    return () => {
      game.destroy(true);
    };
  }, []);


  return <div ref={gameContainer} id="game-phaser" />;
};

