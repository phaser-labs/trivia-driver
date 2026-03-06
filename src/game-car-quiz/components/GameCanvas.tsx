import { useEffect, useRef } from "react";

import PhaserGame from "../game/main";
import { Question } from "../game/utils/types/type";
import { GameResult } from "../game-car-quiz";

interface GameCanvasProps {
  questions: Question[];
  onResult?: (result: GameResult) => void;
}

export const GameCanvas = ({ questions, onResult }: GameCanvasProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainer.current) return;
    const game = new PhaserGame(gameContainer.current, questions, onResult);
    return () => {
      game.destroy(true);
    };
  }, [questions, onResult]);

  return <div ref={gameContainer} id="game-phaser" />;
};

