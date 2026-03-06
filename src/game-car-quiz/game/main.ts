import Phaser from "phaser";

import { GameResult } from "../game-car-quiz";

import { config } from "./config/gameConfig";
import { globalState } from "./utils/GlobalState";
import { Question } from "./utils/types/type";
import { EndGame, InstructionsScene, Main,Menu } from "./scenes";

export default class PhaserGame extends Phaser.Game {
  constructor(
    parentElement: HTMLDivElement, 
    questions: Question[], 
    onResult?: (result: GameResult) => void
  ) {
    super({
      ...config,
      parent: parentElement,
      scene: [Menu, InstructionsScene, Main, EndGame],
    });
    
    // Inicializar el estado global con las preguntas
    globalState.initialize(questions);
    
    // Guardar callback en el registry para acceso desde escenas
    if (onResult) {
      this.registry.set('onResultCallback', onResult);
    }
  }
}