import Phaser from "phaser";

import { globalState } from "../utils/GlobalState";

import "../utils/global.css";

export class Menu extends Phaser.Scene {
  private musicStarted!: Phaser.Sound.BaseSound;

  constructor() {
    super("menuScene");
  }

  preload() {
    this.load.image("menu-bg", "assets/game-car-question/img/Scenes/Menu.jpg");
    this.load.audio("music-menu", "assets/game-car-question/sounds/011-menu.ogg");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000");
    this.add.image(400, 300, "menu-bg").setScale(1.3);

    if (globalState.music) {
      this.musicStarted = this.sound.add("music-menu");
      this.musicStarted.play({
        volume: 0.2,
        loop: true,
      });
    }

    //cordones
    const div = this.add.dom(264, -10, "div",  null, "");
    const cordeon = div.node as HTMLDivElement;
    cordeon.classList.add("game-carquiz-cordeon");

    const divBtn = this.add.dom(308, 130, "div",  null, "");
    const cordeonBtn = divBtn.node as HTMLDivElement;
    cordeonBtn.classList.add("game-carquiz-cordeonBtn");

    // título del juego
    const textElement = this.add.dom(260, 50, "h1", null, "CAR QUIZ").setOrigin(0, 0);
    const titleText = textElement.node as HTMLHeadingElement;
    titleText.classList.add("game-carquiz-title");

    
    // Crear botón
    const btn = this.add.dom(340, 250, "button", null, "Iniciar Juego").setOrigin(0.5, 0.5);
    const btnStartGame = btn.node as HTMLButtonElement;
    btnStartGame.classList.add("game-carquiz-btn-startgame");

    this.time.delayedCall(1000, () => {
      btnStartGame.style.transform = 'translate(145%, 420%) !important';
    });

    // Evento click con transición
    btnStartGame.addEventListener("click", () => {
      this.musicStarted?.destroy();
      this.transitionToScene("InstructionsScene");
    });

    this.events.on("shutdown", () => {
      btnStartGame.remove();
      titleText.remove();
    });
  }

  private transitionToScene(sceneKey: string) {
    // Desactivamos interacciones durante la transición
    this.input.enabled = false;

    // Efecto de fade out
    this.cameras.main.fadeOut(400, 0, 0, 0);

    // Cuando el fade out se complete, iniciar la nueva escena
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(sceneKey);
        
        // Opcional: Fade in en la nueva escena
        const nextScene = this.scene.get(sceneKey);
        nextScene.cameras.main?.fadeIn(500, 0, 0, 0);
    });
}

  update() {}
}