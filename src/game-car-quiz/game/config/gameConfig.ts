/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from "phaser";

//configuración principal del juego

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 576,
  pixelArt: true,
  roundPixels: true,
  scale: {
    parent: "game-phaser",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, // center the game
  },
  physics: {
    default: "arcade",
    
  },
  dom: {
    createContainer: true,
  },
  audio: {
    disableWebAudio: false,
    noAudio: false,
    // Opcional: forzar el uso de HTML5 Audio si WebAudio falla
    context: new (window.AudioContext || (window as any).webkitAudioContext)()
  }
};
  