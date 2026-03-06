import Phaser from "phaser";

import { globalState } from "../utils/GlobalState";

import "../utils/global.css";

export class InstructionsScene extends Phaser.Scene {
  private musicStarted!: Phaser.Sound.BaseSound;
  configModal!: Phaser.GameObjects.Container;
  private isConfigOpen: boolean = false;
  private originalCameraY!: number;
  private modalCameraY!: number;

  private swichBtn: boolean = false;
  constructor() {
    super("InstructionsScene");
  }

  preload() {
    this.load.image("menu-bg", "assets/game-car-question/img/Scenes/Menu.jpg");
    this.load.audio("music-menu", "assets/game-car-question/sounds/011-menu.ogg");

    this.load.image("keyboard", "assets/game-car-question/img/Controls/keyboard.png");
    this.load.image("mouse", "assets/game-car-question/img/Controls/mouse.png");
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

    // cordones
    const div = this.add.dom(284, -10, "div", null, "");
    const cordeon = div.node as HTMLDivElement;
    cordeon.classList.add("game-carquiz-cordeon");

    const divBtn = this.add.dom(284, 130, "div", null, "");
    const cordeonBtn = divBtn.node as HTMLDivElement;
    cordeonBtn.classList.add("game-carquiz-cordeonInfo");

    const divBtn2 = this.add.dom(340, 248, "div", null, "");
    const cordeonBtn2 = divBtn2.node as HTMLDivElement;
    cordeonBtn2.classList.add("game-carquiz-cordeonInfo2");

    const divConfig = this.add.dom(655, 248, "div", null, "");
    const cordeonConfig = divConfig.node as HTMLDivElement;
    cordeonConfig.classList.add("game-carquiz-cordeonconfig");

    // título del juego
    const textElement = this.add.dom(250, 30, "h1", null, "INSTRUCCIONES");
    const titleText = textElement.node as HTMLHeadingElement;
    titleText.classList.add("game-carquiz-title");

    // instrucciones del juego
    const paragrahElement = this.add.dom(
      500,
      210,
      "p",
      null,
      "En este juego, pondrás a prueba tus conocimientos, tu misión será ganar todas las estrellas respondiendo preguntas mientras avanzas por el camino. Demuestra cuánto sabes. ¡Diviértete y aprende en esta aventura sobre ruedas!"
    );
    const titleparagrah = paragrahElement.node as HTMLHeadingElement;
    titleparagrah.classList.add("game-carquiz-paragrah");

    // Crear botón
    const btn = this.add.dom(360, 310, "button", null, "Jugar");
    const btnStartGame = btn.node as HTMLButtonElement;
    btnStartGame.classList.add("game-carquiz-btn-initgame");

    // Evento click con transición
    btnStartGame.addEventListener("click", () => {
      this.musicStarted?.destroy();
      this.transitionToScene("gameScene");
    });

    // Crear botón
    const btnConfig = this.add.dom(650, 315, "button", null, "");
    const btnOpenConfig = btnConfig.node as HTMLButtonElement;
    btnOpenConfig.classList.add("game-carquiz-btn-config");

    // Configurar posiciones de la cámara
    this.originalCameraY = this.cameras.main.scrollY;
    this.modalCameraY = this.cameras.main.height; // Posición inicial fuera de vista

    // Crear el modal como un Container de Phaser (no DOM)
    this.createConfigModal();

    // Evento click con transición
    btnOpenConfig.addEventListener("click", () => {
      if (this.isConfigOpen) {
        this.hideConfigModal();
      } else {
        this.showConfigModal();
      }
    });

    this.events.on("shutdown", () => {
      btnStartGame.remove();
      titleText.remove();
    });
  }
  private createConfigModal() {
    // Crear un fondo semitransparente
    const bg = this.add
      .rectangle(400, 300, 800, 600, 0x000000, 1)
      .setInteractive();

    // Crear el contenido del modal
    const modalBg = this.add
      .dom(100, 100, "div", null, "")
      .setDepth(0)
      .setOrigin(0.5);
    const modalBackground = modalBg.node as HTMLDivElement;
    modalBackground.classList.add("game-carquiz-modal-bg");

    const title = this.add
      .dom(400, 100, "h2", null, "CONFIGURACIÓN")
      .setOrigin(0.5)
      .setDepth(1);
    const titleText = title.node as HTMLHeadingElement;
    titleText.classList.add("game-carquiz-title-modal");

    const textElement = this.add.dom(
      300,
      195,
      "p",
      null,
      "Música general del juego:"
    );
    const audioText = textElement.node as HTMLHeadingElement;
    audioText.classList.add("game-carquiz-audio-text");

    const btnAudio = this.add
      .dom(550, 200, "button", null, "")
      .setOrigin(0.5)
      .setDepth(1);
    const btnAudioBool = btnAudio.node as HTMLButtonElement;
    btnAudioBool.classList.add("game-carquiz-btn-config-audio");

    const title2 = this.add
    .dom(400, 260, "h2", null, "CONTROLES")
    .setOrigin(0.5);
  const titleText2 = title2.node as HTMLHeadingElement;
  titleText2.classList.add("game-carquiz-title-modal");
   

  const keybord = this.add.dom(150, 350, "img", null, "").setScale(0.4);
  const imgKeybord = keybord.node as HTMLImageElement;
  imgKeybord.src = "assets/game-car-question/img/Controls/keyboard.png";
  imgKeybord.alt = "Control del teclado";

  const mouse = this.add.dom(530, 350, "img", null, "").setScale(0.3);
  const imgMouse = mouse.node as HTMLImageElement;
  imgMouse.src = "assets/game-car-question/img/Controls/mouse.png";
  imgMouse.alt = "Control con mouse";


    const closeBtn = this.add.dom(690, 80, "button", null, "").setDepth(1);
    const closeButton = closeBtn.node as HTMLButtonElement;
    closeButton.classList.add("game-carquiz-btn-close-modal");


    // Agrupar todos los elementos en un Container
    this.configModal = this.add.container(0, this.modalCameraY, [
      bg,
      modalBg,
      title,
      textElement,
      title2,
      keybord,
      mouse,
      btnAudio,
      closeBtn,
    ]);

    // Evento para cerrar el modal
    closeButton.addEventListener("click", () => this.hideConfigModal());
    btnAudioBool.addEventListener("click", () => {
      this.toggleMusic();
      if (this.swichBtn) {
        btnAudioBool.style.filter = "brightness(0.5)"; 
      } else {
        btnAudioBool.style.filter = "brightness(1)";
      }
    });
  }
  private toggleMusic() {
    // Invertir el estado actual
    if (globalState.music) {
      globalState.music = false;
      this.swichBtn = true;
      this.musicStarted?.pause(); // Pausar la música
    } else {
      globalState.music = true;
      this.swichBtn = false;
      this.musicStarted?.resume(); // Reanudar la música
    }
  }
  // Métodos para manejar el modal
  private showConfigModal() {
    this.isConfigOpen = true;

    // Animación para mover la cámara hacia abajo
    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.modalCameraY,
      duration: 500,
      ease: "Power2",
    });
  }

  private hideConfigModal() {
    this.isConfigOpen = false;

    // Animación para regresar la cámara a su posición original
    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.originalCameraY,
      duration: 500,
      ease: "Power2",
    });
  }
  private transitionToScene(sceneKey: string) {
    // Desactivamos interacciones durante la transición
    this.input.enabled = false;

    // Efecto de fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    // Cuando el fade out se complete, iniciar la nueva escena
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(sceneKey);

        // Opcional: Fade in en la nueva escena
        const nextScene = this.scene.get(sceneKey);
        nextScene.cameras.main?.fadeIn(600, 0, 0, 0);
      }
    );
  }

  update() {}
}
