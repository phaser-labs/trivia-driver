import Phaser from "phaser";

import { globalState } from "../utils/GlobalState";

//pantalla donde termina el juego, puede ser de victoria o derrota
export class EndGame extends Phaser.Scene {
  private musicStarted!: Phaser.Sound.BaseSound;
  constructor() {
    super("endGameScene");
  }
  preload() {
    this.load.image("endGame", "assets/game-car-question/img/Scenes/Downtown 3 Day.png");

    this.load.audio("music-end", "assets/game-car-question/sounds/congratulations.ogg");
  }
  create() {
    this.cameras.main.setBackgroundColor("#000");
    this.add.image(400, 300, "endGame").setScale(0.8);

    if (globalState.music) {
      this.musicStarted = this.sound.add("music-end");
      this.musicStarted.play({
        volume: 0.05,
        loop: true,
      });
    }

    //cordones 
    const div = this.add.dom(260, -10, "div",  null, "");
    const cordeon = div.node as HTMLDivElement;
    cordeon.classList.add("game-carquiz-cordeonend");

    const div2 = this.add.dom(260, 300, "div",  null, "");
    const cordeon2 = div2.node as HTMLDivElement;
    cordeon2.classList.add("game-carquiz-cordeonend2");

     // titulo final  del juego
     const titleElement = this.add.dom(180, 190, "p", null, "Fin del juego").setOrigin(0, 0);
     const title = titleElement.node as HTMLHeadingElement;
     title.classList.add("game-carquiz-title");

      // título del juego
      const paragrahElement = this.add.dom(208, 350, "p", null, "¡Gracias por jugar! Puedes volver al menu principal dando clic en cualquier parte de la pantalla.").setOrigin(0, 0);
      const titleparagrah = paragrahElement.node as HTMLHeadingElement;

      titleparagrah.classList.add("game-carquiz-paragrah2");

    
    const backOption = this.add.zone(0, 0, 768, 672);
    backOption.setOrigin(0, 0);
    backOption.setInteractive();
    backOption.once("pointerdown", () => {
      this.musicStarted?.stop();
      titleparagrah.remove();
      this.scene.restart();
      this.scene.start("menuScene");
    });

    this.events.on("shutdown", () => {
      titleparagrah.remove()
      this.musicStarted?.stop();
    });
  }
  update() {}
}
