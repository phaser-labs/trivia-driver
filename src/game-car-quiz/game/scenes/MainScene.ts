import Phaser from "phaser";

import { StarTransition } from "../effects/StarTransition";
import { eventBus } from "../eventBus";

import { globalState } from "./../utils/GlobalState";

import "../utils/global.css";

export class Main extends Phaser.Scene {
  private pavement!: Phaser.Tilemaps.TilemapLayer;
  private isColliding = false; // Estado de colisión

  // Objeto para almacenar el estado de cada tecla
  private controls: { [key: string]: boolean } = {
    arrow_up: false,
    arrow_down: false,
    arrow_left: false,
    arrow_right: false,
  };
  private starTransition!: StarTransition;
  private musicStarted: boolean = true; // variable para saber si la musica ambiente se ha iniciado
  // almacena y controla la música y sonidos
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private voice!: Phaser.Sound.BaseSound;
  private getStar!: Phaser.Sound.BaseSound;
  private badAnswer!: Phaser.Sound.BaseSound;
  constructor() {
    super("gameScene");
  }

  preload() {
    // background
    this.load.image("bgTiles", "assets/game-car-question/img/Tiles/tilemapPack.png");
    this.load.tilemapTiledJSON("tilemap", "assets/game-car-question/img/Tiles/mapa-car.json");
    // carrito
    this.load.spritesheet(
      "hotwheels",
      "assets/game-car-question/img/Cars/Blue_JEEP_CLEAN_All_000-sheet.png",
      {
        frameWidth: 100,
        frameHeight: 100,
      }
    );
    // npcs
    this.load.spritesheet("npc1", "assets/game-car-question/img/Characters/01-generic.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    // Burbuja de dialogo
    this.load.spritesheet("burbleDialog", "assets/game-car-question/img/Characters/burble.png", {
      frameWidth: 20,
      frameHeight: 14,
    });

    // Agregando recompensa estrellas
    this.load.image("empty-star", "assets/game-car-question/img/Collects/Empty-star.png");
    this.load.image("full-star", "assets/game-car-question/img/Collects/Star.png");

    // Sonidos
    this.load.audio("music-ambience", "assets/game-car-question/sounds/06Ambience.ogg");
    this.load.audio("get-star", "assets/game-car-question/sounds/Get-Points.ogg");
    this.load.audio("bad-answer", "assets/game-car-question/sounds/wrong-answer.ogg");
    this.load.audio("voice", "assets/game-car-question/sounds/voice.ogg");
    this.load.audio("finishColletion", "assets/game-car-question/sounds/music-winner.wav");
  }

  create() {
    const map = this.make.tilemap({ key: "tilemap" });
    const tileset = map.addTilesetImage("tilemap_packed", "bgTiles");

    if (tileset) {
      map.createLayer("road", tileset);
      this.pavement = map.createLayer("pavement", tileset)!;
      this.pavement.setCollisionByProperty({ collides: true });
      map.createLayer("building", tileset);
      map.createLayer("park", tileset);
      map.createLayer("decoration", tileset);
      map.createLayer("decoration2", tileset);
    }

    if (this.musicStarted && globalState.music) {
      this.musicStarted = false;
      this.backgroundMusic = this.sound.add("music-ambience");
      this.backgroundMusic.play({
        volume: 0.15,
        loop: true,
      });
    }
    // btn para los controles
    const btnControls = this.add.dom(730, 30, "button", null, "");

    // Obtener el elemento HTML del botón
    const buttonElement = btnControls.node as HTMLButtonElement;

    // Asignar clases y estilos opcionales
    buttonElement.classList.add("game-carquiz-btn-controls");

    // Agregar el evento de clic correctamente
    buttonElement.addEventListener("click", () => {
      this.tweens.add({
        targets: btnControls,
        scale: 1.2, // Aumenta un 20%
        duration: 300,
        yoyo: true, // Vuelve a su tamaño original
        ease: "Sine.easeInOut",
      });
    
      eventBus.emit("toggleControls");
    });

    // Cuando la escena cambie, eliminar el botón del DOM
    this.events.on("shutdown", () => {
      buttonElement.remove(); // Elimina el botón cuando la escena cambia
      this.tweens.add({
        targets: btnControls,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: "Linear",
      });
      eventBus.emit("closeControls"); // Asegurar que el modal en React se cierre
    });

    // btn para ir al menu
    const btnMenu = this.add.dom(660, 30, "button", null, "");

    // Obtener el elemento HTML del botón
    const buttonElementMenu = btnMenu.node as HTMLButtonElement;

    // Asignar clases y estilos opcionales
    buttonElementMenu.classList.add("game-carquiz-btn-menu");

    // Agregar el evento de clic correctamente
    buttonElementMenu.addEventListener("click", () => {
      this.tweens.add({
        targets: btnMenu,
        scale: 1.2, // Aumenta un 20%
        duration: 300,
        yoyo: true, // Vuelve a su tamaño original
        ease: "Sine.easeInOut",
      });
      this.tweens.add({
        targets: btnMenu,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: "Linear",
      });
      this.tweens.add({
        targets: btnControls,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: "Linear",
      });
      // Hacer un fade-out de 1 segundo
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      // Esperar a que termine el fade-out antes de cambiar de escena
      this.time.delayedCall(1200, () => {
        this.backgroundMusic?.destroy();
        this.scene.start("menuScene");
      });
    });

    // estrella de recompensa
    globalState.stars = {
      full: [],
      empty: [],
      earned: 0,
      total: 4,
    };

    // Crear estrellas vacías y llenas (invisibles inicialmente)
    const starPositions = [250, 350, 450, 550]; // Posiciones X
    starPositions.forEach((x, index) => {
      if (!globalState.stars) return;
      // Estrella vacía (visible)
      globalState.stars.empty[index] = this.add
        .sprite(x, 50, "empty-star")
        .setScale(0.6)
        .setDepth(1);

      // Estrella llena (invisible inicialmente)
      globalState.stars.full[index] = this.add
        .sprite(x, 50, "full-star")
        .setScale(0.6)
        .setVisible(false)
        .setDepth(2);
    });

    //animacion de la burbuja de dialogo
    this.anims.create({
      key: "burbleDialog",
      frames: this.anims.generateFrameNumbers("burbleDialog", {
        start: 0,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });

    // agregamos a nuestro carrito
    globalState.car = this.physics.add
      .sprite(300, 300, "hotwheels", 0)
      .setScale(0.6);

    if (this.pavement) {
      this.physics.add.collider(globalState.car, this.pavement);
    }

    // Seguir al carro con la cámara
    this.cameras.main.startFollow(globalState.car);
    const mapWidth = this.physics.world.bounds.width;
    const mapHeight = this.physics.world.bounds.height;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    //animaciones del carro
    this.anims.create({
      key: "car-up",
      frames: this.anims.generateFrameNumbers("hotwheels", {
        start: 36,
        end: 37,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "car-down",
      frames: this.anims.generateFrameNumbers("hotwheels", {
        start: 11,
        end: 12,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "car-left",
      frames: this.anims.generateFrameNumbers("hotwheels", {
        start: 24,
        end: 25,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "car-right",
      frames: this.anims.generateFrameNumbers("hotwheels", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Animaciones para NPCs (caminar en 4 direcciones) npc-walk-...
    this.anims.create({
      key: "npc-walk-down",
      frames: this.anims.generateFrameNumbers("npc1", { start: 3, end: 5 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "npc-walk-up",
      frames: this.anims.generateFrameNumbers("npc1", { start: 48, end: 50 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "npc-walk-left",
      frames: this.anims.generateFrameNumbers("npc1", { start: 18, end: 20 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "npc-walk-right",
      frames: this.anims.generateFrameNumbers("npc1", { start: 33, end: 35 }),
      frameRate: 5,
      repeat: -1,
    });

    // Crear arreglo de NPCs en globalState
    globalState.npcs = [];
    this.createNpcs();

    // Configurar colisiones de NPCs y el avatar
    this.setupNpcCollisions();

    // Escuchar la respuesta de React
    eventBus.on("answerSubmitted", this.handleAnswer.bind(this));

    // Escuchar el evento de los controles por fuera del juego
    eventBus.on("key-pressed", (data: { key: string; pressed: boolean }) => {
      
      // Actualiza la key para la tecla recibida
      this.controls[data.key] = data.pressed;
    });

    // Inicializa el efecto final
    this.starTransition = new StarTransition(this, "finishColletion");
    this.starTransition.createStars();
  }
  // Metodo para actualizar las estrellas obtenidas
  private updateStars() {
    if (!globalState.stars) return;
    // Ocultar todas las estrellas llenas primero
    globalState.stars.full.forEach((star) => star.setVisible(false));

    // Mostrar solo las ganadas
    for (let i = 0; i < globalState.stars.earned; i++) {
      if (globalState.stars.full[i]) {
        globalState.stars.full[i].setVisible(true);

        // Efecto de animación al ganar
        if (i === globalState.stars.earned - 1) {
          this.tweens.add({
            targets: globalState.stars.full[i],
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            yoyo: true,
            repeat: 2,
          });
        }

        if (globalState.stars.earned === globalState.stars.empty.length) {
          // Si se han ganado todas las estrellas termina el juego
          this.time.delayedCall(2000, () => {
            this.starTransition.startTransition(() => {
              this.musicStarted = false;
              this.backgroundMusic?.stop();
              this.scene.start("endGameScene");

            });
          });
        }
      }
    }
  }
  // Metodo para manejar la respuesta de React
  private handleAnswer(isCorrect: boolean) {
    if (!globalState.activeNpc || !globalState.stars) return;

    const npcData = globalState.npcs.find(
      (n) => n.sprite === globalState.activeNpc
    ); // Buscar el NPC activo
    if (!npcData) return;

    if (isCorrect) {
      // Respuesta correcta
      npcData.isInteractable = false;
      npcData.isMoving = false;

      // Animación de salto
      this.tweens.add({
        targets: npcData.sprite,
        y: npcData.sprite.y - 30,
        duration: 400,
        yoyo: true,
        onComplete: () => {
          // Eliminar burbuja y desactivar colisiones
          npcData.dialog?.destroy();
          this.physics.world.disable(npcData.sprite);
          this.voice.stop();
        },
      });
      if (isCorrect && globalState.stars) {
        //Agrega 1 estrella por cada respuesta correcta que recibe desde React
        globalState.stars.earned += 1;
        this.updateStars();

        this.getStar = this.sound.add("get-star");
        if (globalState.music) {
          this.getStar.play({
            volume: 0.05,
            loop: false,
          });
          this.voice?.stop();
        }
      }
    } else {
      this.badAnswer = this.sound.add("bad-answer");
      if (globalState.music) {
        this.badAnswer.play({
          volume: 0.3,
          loop: false,
        });
        this.voice?.stop();
      }

      // Respuesta incorrecta
      npcData.isMoving = false; // Reactivar movimiento
      this.cameras.main.shake(300, 0.02);
    }

    // Resetear estado
    this.isColliding = false;
    globalState.activeNpc = undefined;
    this.cameras.main.zoomTo(1, 300); // Restaurar zoom
  }
  // Método para crear NPCs
  private createNpcs() {
    // NPC 1 - Con diálogo y patrulla
    const npcWithDialog = this.physics.add
      .sprite(350, 750, "npc1")
      .setScale(1.5);
    const dialogBubble = this.add.sprite(300, 300, "burbleDialog"); // Posición absoluta
    dialogBubble.play("burbleDialog", true);
    npcWithDialog.setData("dialogBubble", dialogBubble);

    globalState.npcs.push({
      sprite: npcWithDialog,
      id: "npc-1",
      hasDialog: true,
      isInteractable: true,
      isMoving: true,
      dialog: dialogBubble,
      path: [
        { x: 350, y: 456 },
        { x: 350, y: 400 },
        { x: 350, y: 456 },
        { x: 50, y: 456 },
        { x: -80, y: 456 },
      ],
      currentTarget: 0,
    });

    // NPC 2 - Con diálogo y patrulla
    const npcWithDialog2 = this.physics.add
      .sprite(500, 650, "npc1")
      .setScale(1.5);
    const dialogBubble2 = this.add.sprite(750, 740, "burbleDialog"); // Posición absoluta
    dialogBubble2.play("burbleDialog", true);
    npcWithDialog2.setData("dialogBubble", dialogBubble2);

    globalState.npcs.push({
      sprite: npcWithDialog2,
      id: "npc-2",
      hasDialog: true,
      isInteractable: true,
      isMoving: true,
      dialog: dialogBubble2,
      path: [
        { x: 500, y: 456 },
        { x: 500, y: 780 },
      ],
      currentTarget: 0,
    });

    // NPC 3 - Con diálogo y patrulla
    const npcWithDialog3 = this.physics.add
      .sprite(900, 340, "npc1")
      .setScale(1.5);
    const dialogBubble3 = this.add.sprite(750, 740, "burbleDialog"); // Posición absoluta
    dialogBubble3.play("burbleDialog", true);
    npcWithDialog3.setData("dialogBubble", dialogBubble3);

    globalState.npcs.push({
      sprite: npcWithDialog3,
      id: "npc-3",
      hasDialog: true,
      isInteractable: true,
      isMoving: true,
      dialog: dialogBubble3,
      path: [
        { x: 754, y: 340 },
        { x: 754, y: 190 },
        { x: 754, y: 340 },
        { x: 500, y: 340 },
        { x: 900, y: 340 },
      ],
      currentTarget: 0,
    });

    // NPC 4 - Con diálogo y patrulla
    const npcWithDialog4 = this.physics.add
      .sprite(74, -90, "npc1")
      .setScale(1.5);
    const dialogBubble4 = this.add.sprite(750, 740, "burbleDialog"); // Posición absoluta
    dialogBubble4.play("burbleDialog", true);
    npcWithDialog4.setData("dialogBubble", dialogBubble4);

    globalState.npcs.push({
      sprite: npcWithDialog4,
      id: "npc-4",
      hasDialog: true,
      isInteractable: true,
      isMoving: true,
      dialog: dialogBubble4,
      path: [
        { x: 74, y: 180 },
        { x: -100, y: 180 },
        { x: 80, y: 180 },
      ],
      currentTarget: 0,
    });

    // NPC 1 npcSimple - Solo patrulla
    const npcSimple = this.physics.add.sprite(200, 200, "npc1").setScale(1.5);
    globalState.npcs.push({
      sprite: npcSimple,
      id: "npc-simple",
      hasDialog: false,
      isInteractable: false,
      isMoving: true,
      path: [
        { x: 200, y: 200 },
        { x: 600, y: 200 },
      ],
      currentTarget: 0,
    });
    // NPC 1 npcSimple - Solo patrulla
    const npcSimple2 = this.physics.add.sprite(230, -100, "npc1").setScale(1.5);
    globalState.npcs.push({
      sprite: npcSimple2,
      id: "npc-simple2",
      hasDialog: false,
      isInteractable: false,
      isMoving: true,
      path: [
        { x: 230, y: 200 },
        { x: 230, y: 170 },
        { x: 60, y: 170 },
        { x: 230, y: 170 },
        { x: 230, y: -10 },
      ],
      currentTarget: 0,
    });
  }
  // Método para configurar colisiones con NPCs
  private setupNpcCollisions() {
    this.physics.add.overlap(
      globalState.car!,
      globalState.npcs.filter((npc) => npc.hasDialog).map((npc) => npc.sprite),
      this.handleNpcInteraction.bind(this)
    );
  }
  // Método que se ejecuta al colisionar con un NPC
  private handleNpcInteraction: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback =
    (_, npcobj) => {
      const npcSprite = npcobj as Phaser.Physics.Arcade.Sprite;
      if (this.isColliding) return;

      const npcData = globalState.npcs.find((n) => n.sprite === npcSprite); // Encontrar el NPC correspondiente
      if (!npcData || !npcData.isInteractable) return; // Verificar si el NPC es interactuable

      // iniciar audio npc voice
      this.voice = this.sound.add("voice");
      if (globalState.music) {
        this.voice.play({
          volume: 0.2,
          loop: false,
        });
      }
      // Pausar NPC
      npcData.isMoving = false;
      npcSprite.setVelocity(0, 0);
      npcSprite.anims.stop();

      // Notificar a React
      eventBus.emit("npcInteracted", npcData.id);

      // Configurar estado
      this.isColliding = true;
      globalState.activeNpc = npcSprite;
      this.cameras.main.zoomTo(1.5, 300);
    };
  // Método que se ejecuta cuando termina la colisión
  private handleCollisionEnd() {
    if (!this.isColliding) return;

    const npcData = globalState.npcs.find(
      (n) => n.sprite === globalState.activeNpc
    );
    if (npcData && npcData.isInteractable) {
      npcData.isMoving = true; // Reactivar movimiento
      this.voice.stop();
    }

    this.isColliding = false;
    globalState.activeNpc = undefined;
    this.cameras.main.zoomTo(1, 300);
    eventBus.emit("closeModal", true);
  }
  // Método para obtener la dirección del carro
  private getDirection(): { x: number; y: number } {
    const cursors = this.input.keyboard?.createCursorKeys();
    const keyObjUp = this.input.keyboard?.addKey("W");
    const keyObjDown = this.input.keyboard?.addKey("S");
    const keyObjLeft = this.input.keyboard?.addKey("A");
    const keyObjRight = this.input.keyboard?.addKey("D");

    const direction = { x: 0, y: 0 };

    if (cursors) {
      if (
        cursors.left.isDown ||
        keyObjLeft?.isDown ||
        this.controls.arrow_left
      ) {
        direction.x = -1;
      } else if (
        cursors.right.isDown ||
        keyObjRight?.isDown ||
        this.controls.arrow_right
      ) {
        direction.x = 1;
      } else if (
        cursors.up.isDown ||
        keyObjUp?.isDown ||
        this.controls.arrow_up
      ) {
        direction.y = -1;
      } else if (
        cursors.down.isDown ||
        keyObjDown?.isDown ||
        this.controls.arrow_down
      ) {
        direction.y = 1;
      }
    }
    return direction;
  }
  update() {
    if (!globalState.car) return;

    // Verificar fin de colisión
    if (
      this.isColliding &&
      globalState.activeNpc &&
      !this.physics.overlap(globalState.car!, globalState.activeNpc)
    ) {
      this.handleCollisionEnd();
    }

    // Mover NPCs
    globalState.npcs.forEach((npc) => {
      if (npc.isMoving && npc.path) {
        this.moveWalkingNpc(npc);
      }
      // Update dialog bubble position
      const dialogBubble = npc.sprite.getData("dialogBubble");
      if (dialogBubble) {
        dialogBubble.setPosition(npc.sprite.x, npc.sprite.y - 30);
      }
    });

    // Movimiento del carro
    const direction = this.getDirection();

    if (globalState.car) {
      if (direction.x === 0 && direction.y === 0) {
        globalState.car.anims.stop();
        globalState.car.setVelocity(0, 0);
      } else {
        if (direction.x === 1) {
          globalState.car.anims.play("car-right", true);
        } else if (direction.x === -1) {
          globalState.car.anims.play("car-left", true);
        } else if (direction.y === -1) {
          globalState.car.anims.play("car-up", true);
        } else if (direction.y === 1) {
          globalState.car.anims.play("car-down", true);
        }
        globalState.car.setVelocity(direction.x * 100, direction.y * 100);
      }

      // Funcionalidad de Spawn (reposiciona el carro si sale del área)
      const { x, y } = globalState.car;
      const worldHeight = this.physics.world.bounds.height;
      const spawnLeft = { x: 900 - globalState.car.width / 2, y: 300 };
      const spawnRight = { x: 10 / 2, y: 300 };
      const spawnTop = { x: 465, y: 600 };
      const spawnBottom = { x: 110, y: -10 };

      if (x < 10 - globalState.car.width / 2) {
        globalState.car.setPosition(spawnLeft.x, spawnLeft.y);
      } else if (x > 800 + globalState.car.width / 2) {
        globalState.car.setPosition(spawnRight.x, spawnRight.y);
      } else if (y < -globalState.car.height / 2) {
        globalState.car.setPosition(spawnTop.x, spawnTop.y);
      } else if (y > worldHeight + globalState.car.height / 2) {
        globalState.car.setPosition(spawnBottom.x, spawnBottom.y);
      }
    }
  }
  private moveWalkingNpc(npc: (typeof globalState.npcs)[0]) {
    const target = npc.path![npc.currentTarget];
    const sprite = npc.sprite;

    // Animación según dirección
    const dx = target.x - sprite.x;
    const dy = target.y - sprite.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      sprite.anims.play(dx > 0 ? "npc-walk-right" : "npc-walk-left", true);
    } else {
      sprite.anims.play(dy > 0 ? "npc-walk-down" : "npc-walk-up", true);
    }

    // Mover hacia el target
    this.physics.moveTo(sprite, target.x, target.y, 50);

    // Cambiar target al llegar
    if (
      Phaser.Math.Distance.Between(sprite.x, sprite.y, target.x, target.y) < 5
    ) {
      npc.currentTarget = (npc.currentTarget + 1) % npc.path!.length;
    }
  }
}
