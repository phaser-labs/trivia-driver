import Phaser from 'phaser';

import { DECORATIVE_NPCS, NPC_SPAWN_CONFIGS } from '../config/npcConfig';
import { StarTransition } from '../effects/StarTransition';
import { eventBus } from '../eventBus';

import { globalState } from './../utils/GlobalState';

import '../utils/global.css';

export class Main extends Phaser.Scene {
  private pavement!: Phaser.Tilemaps.TilemapLayer;
  private isColliding = false; // Estado de colisión

  // Objeto para almacenar el estado de cada tecla
  private controls: { [key: string]: boolean } = {
    arrow_up: false,
    arrow_down: false,
    arrow_left: false,
    arrow_right: false
  };
  private starTransition!: StarTransition;
  private musicStarted: boolean = true; // variable para saber si la musica ambiente se ha iniciado
  // almacena y controla la música y sonidos
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private voice!: Phaser.Sound.BaseSound;
  private getStar!: Phaser.Sound.BaseSound;
  private badAnswer!: Phaser.Sound.BaseSound;

  // Modal de preguntas
  private modalOverlay?: Phaser.GameObjects.DOMElement;
  private modalContent?: Phaser.GameObjects.DOMElement;
  currentQuestionIndex: number = -1;
  constructor() {
    super('gameScene');
  }

  preload() {
    // background
    this.load.image('bgTiles', 'assets/game-car-question/img/Tiles/tilemapPack.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/game-car-question/img/Tiles/mapa-car.json');
    // carrito
    this.load.spritesheet('hotwheels', 'assets/game-car-question/img/Cars/Blue_JEEP_CLEAN_All_000-sheet.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    // npcs
    this.load.spritesheet('npc1', 'assets/game-car-question/img/Characters/01-generic.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    // Burbuja de dialogo
    this.load.spritesheet('burbleDialog', 'assets/game-car-question/img/Characters/burble.png', {
      frameWidth: 20,
      frameHeight: 14
    });

    // Agregando recompensa estrellas
    this.load.image('empty-star', 'assets/game-car-question/img/Collects/Empty-star.png');
    this.load.image('full-star', 'assets/game-car-question/img/Collects/Star.png');

    // Sonidos
    this.load.audio('music-ambience', 'assets/game-car-question/sounds/06Ambience.ogg');
    this.load.audio('get-star', 'assets/game-car-question/sounds/Get-Points.ogg');
    this.load.audio('bad-answer', 'assets/game-car-question/sounds/wrong-answer.ogg');
    this.load.audio('voice', 'assets/game-car-question/sounds/voice.ogg');
    this.load.audio('finishColletion', 'assets/game-car-question/sounds/music-winner.wav');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('tilemap_packed', 'bgTiles');

    if (tileset) {
      map.createLayer('road', tileset);
      this.pavement = map.createLayer('pavement', tileset)!;
      this.pavement.setCollisionByProperty({ collides: true });
      map.createLayer('building', tileset);
      map.createLayer('park', tileset);
      map.createLayer('decoration', tileset);
      map.createLayer('decoration2', tileset);
    }

    if (this.musicStarted && globalState.music) {
      this.musicStarted = false;
      this.backgroundMusic = this.sound.add('music-ambience');
      this.backgroundMusic.play({
        volume: 0.15,
        loop: true
      });
    }
    // btn para los controles
    const btnControls = this.add.dom(730, 30, 'button', null, '');

    // Obtener el elemento HTML del botón
    const buttonElement = btnControls.node as HTMLButtonElement;

    // Asignar clases y estilos opcionales
    buttonElement.classList.add('game-carquiz-btn-controls');

    // Agregar el evento de clic correctamente
    buttonElement.addEventListener('click', () => {
      this.tweens.add({
        targets: btnControls,
        scale: 1.2, // Aumenta un 20%
        duration: 300,
        yoyo: true, // Vuelve a su tamaño original
        ease: 'Sine.easeInOut'
      });

      eventBus.emit('toggleControls');
    });

    // Cuando la escena cambie, eliminar el botón del DOM
    this.events.on('shutdown', () => {
      buttonElement.remove(); // Elimina el botón cuando la escena cambia
      this.tweens.add({
        targets: btnControls,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: 'Linear'
      });
      eventBus.emit('closeControls'); // Asegurar que el modal en React se cierre
    });

    // btn para ir al menu
    const btnMenu = this.add.dom(660, 30, 'button', null, '');

    // Obtener el elemento HTML del botón
    const buttonElementMenu = btnMenu.node as HTMLButtonElement;

    // Asignar clases y estilos opcionales
    buttonElementMenu.classList.add('game-carquiz-btn-menu');

    // Agregar el evento de clic correctamente
    buttonElementMenu.addEventListener('click', () => {
      this.tweens.add({
        targets: btnMenu,
        scale: 1.2, // Aumenta un 20%
        duration: 300,
        yoyo: true, // Vuelve a su tamaño original
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: btnMenu,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: 'Linear'
      });
      this.tweens.add({
        targets: btnControls,
        alpha: 0, // Opacidad 0 (invisible)
        duration: 1000,
        ease: 'Linear'
      });
      // Hacer un fade-out de 1 segundo
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      // Esperar a que termine el fade-out antes de cambiar de escena
      this.time.delayedCall(1200, () => {
        this.backgroundMusic?.destroy();
        // Resetear el estado global antes de volver al menú
        globalState.reset();
        this.scene.start('menuScene');
      });
    });

    // Limpiar estrellas antiguas si existen (importante para reinicios)
    if (globalState.stars) {
      globalState.stars.empty.forEach((star) => star.destroy());
      globalState.stars.full.forEach((star) => star.destroy());
    }

    // Inicializar preguntas del nivel actual
    const currentQuestions = globalState.getCurrentLevelQuestions();
    const questionsCount = currentQuestions.length;

    // estrella de recompensa (dinámico según preguntas del nivel)
    globalState.stars = {
      full: [],
      empty: [],
      earned: 0,
      total: questionsCount
    };

    // Crear estrellas vacías y llenas (dinámicamente según cantidad)
    const starSpacing = 100;
    const startX = 400 - (questionsCount * starSpacing) / 2 + starSpacing / 2;

    for (let i = 0; i < questionsCount; i++) {
      if (!globalState.stars) return;
      const x = startX + i * starSpacing;

      // Estrella vacía (visible)
      globalState.stars.empty[i] = this.add.sprite(x, 50, 'empty-star').setScale(0.6).setDepth(1).setScrollFactor(0); // Fijo en pantalla

      // Estrella llena (invisible inicialmente)
      globalState.stars.full[i] = this.add
        .sprite(x, 50, 'full-star')
        .setScale(0.6)
        .setVisible(false)
        .setDepth(2)
        .setScrollFactor(0); // Fijo en pantalla
    }

    //animacion de la burbuja de dialogo
    this.anims.create({
      key: 'burbleDialog',
      frames: this.anims.generateFrameNumbers('burbleDialog', {
        start: 0,
        end: 2
      }),
      frameRate: 1,
      repeat: -1
    });

    // agregamos a nuestro carrito
    globalState.car = this.physics.add.sprite(300, 300, 'hotwheels', 0).setScale(0.6);

     // Ajustar el body de colisión para que sea más pequeño y ajustado al sprite
    if (globalState.car.body) {
      const body = globalState.car.body as Phaser.Physics.Arcade.Body;
      // Reducir el tamaño del body (aproximadamente 50% del tamaño original)
      body.setSize(40, 50);
      // Centrar el body respecto al sprite
      body.setOffset(30, 25);
    }

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
      key: 'car-up',
      frames: this.anims.generateFrameNumbers('hotwheels', {
        start: 36,
        end: 37
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'car-down',
      frames: this.anims.generateFrameNumbers('hotwheels', {
        start: 11,
        end: 12
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'car-left',
      frames: this.anims.generateFrameNumbers('hotwheels', {
        start: 24,
        end: 25
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'car-right',
      frames: this.anims.generateFrameNumbers('hotwheels', {
        start: 0,
        end: 1
      }),
      frameRate: 10,
      repeat: -1
    });

    // Animaciones para NPCs (caminar en 4 direcciones) npc-walk-...
    this.anims.create({
      key: 'npc-walk-down',
      frames: this.anims.generateFrameNumbers('npc1', { start: 3, end: 5 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'npc-walk-up',
      frames: this.anims.generateFrameNumbers('npc1', { start: 48, end: 50 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'npc-walk-left',
      frames: this.anims.generateFrameNumbers('npc1', { start: 18, end: 20 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'npc-walk-right',
      frames: this.anims.generateFrameNumbers('npc1', { start: 33, end: 35 }),
      frameRate: 5,
      repeat: -1
    });

    // Limpiar NPCs antiguos si existen (importante para reinicios)
    if (globalState.npcs && globalState.npcs.length > 0) {
      globalState.npcs.forEach((npc) => {
        npc.sprite.destroy();
        npc.dialog?.destroy();
      });
    }

    // Crear arreglo de NPCs en globalState
    globalState.npcs = [];
    this.createNpcs();

    // Configurar colisiones de NPCs y el avatar
    this.setupNpcCollisions();

    // Escuchar la respuesta de React
    eventBus.on('answerSubmitted', this.handleAnswer.bind(this));

    // Escuchar el evento de los controles por fuera del juego
    eventBus.on('key-pressed', (data: { key: string; pressed: boolean }) => {
      // Actualiza la key para la tecla recibida
      this.controls[data.key] = data.pressed;
    });

    // Inicializa el efecto final
    this.starTransition = new StarTransition(this, 'finishColletion');
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

        // Efecto de animación al ganar la última estrella
        if (i === globalState.stars.earned - 1) {
          this.tweens.add({
            targets: globalState.stars.full[i],
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            yoyo: true,
            repeat: 2
          });
        }
      }
    }

    // Verificar si se completaron todas las estrellas del nivel
    if (globalState.stars.earned === globalState.stars.empty.length) {
      // Verificar si hay más niveles disponibles
      const hasMoreLevels = globalState.currentLevel + 1 < globalState.getTotalLevels();

      if (hasMoreLevels) {
        // Hay más niveles: transicionar al siguiente nivel
        this.time.delayedCall(2000, () => {
          this.starTransition.startTransition(() => {
            this.transitionToNextLevel();
          });
        });
      } else {
        // No hay más niveles: terminar el juego
        this.time.delayedCall(2000, () => {
          this.starTransition.startTransition(() => {
            this.musicStarted = false;
            this.backgroundMusic?.stop();
            this.scene.start('endGameScene');
          });
        });
      }
    }
  }
  // Metodo para manejar la respuesta de React
  private handleAnswer(isCorrect: boolean) {
    if (!globalState.activeNpc || !globalState.stars) return;

    const npcData = globalState.npcs.find((n) => n.sprite === globalState.activeNpc); // Buscar el NPC activo
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
        }
      });
      if (isCorrect && globalState.stars) {
        //Agrega 1 estrella por cada respuesta correcta que recibe desde React
        globalState.stars.earned += 1;
        this.updateStars();

        this.getStar = this.sound.add('get-star');
        if (globalState.music) {
          this.getStar.play({
            volume: 0.05,
            loop: false
          });
          this.voice?.stop();
        }
      }
    } else {
      this.badAnswer = this.sound.add('bad-answer');
      if (globalState.music) {
        this.badAnswer.play({
          volume: 0.3,
          loop: false
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
  /**
   * Crea NPCs dinámicamente basándose en las preguntas del nivel actual
   */
  // Mostrar modal de pregunta
  private showQuestionModal(questionIndex: number) {
    this.currentQuestionIndex = questionIndex;
    // Obtener la pregunta usando el índice GLOBAL de todas las preguntas
    const question = globalState.questions[questionIndex];

    if (!question) return;

    // Crear overlay (fondo oscuro)
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'game_carquiz_modal_overlay';
    overlayDiv.style.cssText = `
      position: absolute;
      top: -70px;
      left: 2px;
      width: 70%;
      height: 70%;
      z-index: 10;
      background-color: rgba(26, 26, 26, 0.72);
    `;

    this.modalOverlay = this.add.dom(400, 336, overlayDiv).setOrigin(0.5).setScrollFactor(0);

    // Crear contenido del modal
    const contentDiv = document.createElement('div');
    contentDiv.className = 'game_carquiz_modal_content';
    contentDiv.style.cssText = `
      background-image: url('${question.backgroundImage || ''}');
      background-size: cover;
      background-position: center;
      display: flex !important;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      border-radius: 4px;
      text-align: center;
      width: 65%;
      height: auto;
      position: relative;
      z-index: 11 !important;
    `;

    // Crear pregunta
    const questionText = document.createElement('p');
    questionText.textContent = question.question;
    questionText.style.cssText = `
      font-size: 1.2rem;
      color: #eee;
      margin: 0;
      background: linear-gradient(to bottom, #ae7e79, #6d446c);
      text-shadow: 2px 2px 1px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      padding: 2px 10px;
      box-shadow: 0 4px 6px rgb(0 0 0 / 46%);
      border-bottom: 1px solid #d6d6d6;
      border-left: 1px solid #d6d6d6;
      border-right: 1px solid #d6d6d6;
      border-radius: 4px;
      text-align: center;
      color: #eee;
      filter: drop-shadow(2px 4px 6px black);
      font-family: 'MyCustomFont', sans-serif;

      overflow-y: auto;
    max-height: 48px;
    `;
    contentDiv.appendChild(questionText);

    // Crear contenedor de opciones
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'game_carquiz_options_container';
    
    // Calcular número de opciones y configurar grid dinámicamente
    const optionsCount = Object.keys(question.options).length;
    let gridColumns = '1fr 1fr'; // Por defecto 2 columnas
    
    if (optionsCount === 2) {
      gridColumns = '1fr 1fr'; // 2 columnas
    } else if (optionsCount === 3) {
      gridColumns = '1fr 1fr 1fr'; // 3 columnas
    } else if (optionsCount === 4) {
      gridColumns = '1fr 1fr'; // 2x2 grid
    } else if (optionsCount >= 5) {
      gridColumns = '1fr 1fr 1fr'; // 3 columnas para 5-6 opciones
    }
    
    optionsContainer.style.cssText = `
    display: grid;
    justify-content: space-evenly;
    gap: 8px;
    min-height: 300px;
    grid-template-columns: ${gridColumns};
    justify-items: center;
    align-items: center;
    margin-top: 4px;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    `;

    // Crear botones de opciones
    Object.entries(question.options).forEach(([key, value]) => {
      const optionDiv = document.createElement('div');
      optionDiv.style.cssText = `
        display: flex;
        gap: 10px;
        background: linear-gradient(to bottom, #ae7e79, #6d446c);
        text-shadow: 2px 2px 1px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        padding: 0px 10px;
        box-shadow: 0 4px 6px rgb(0 0 0 / 46%);
        border-bottom: 1px solid #d6d6d6;
        border-left: 1px solid #d6d6d6;
        border-right: 1px solid #d6d6d6;
        border-radius: 10px;
        align-items: center;
        justify-content: flex-start;
        color: #eee;
      filter: drop-shadow(2px 4px 6px black);
      font-size: 1rem;
      font-family: 'MyCustomFont', sans-serif;
        overflow-wrap: anywhere;
        cursor: pointer;
        
      `;

      const button = document.createElement('button');
      button.className = 'game_carquiz_option_button';
      button.setAttribute('aria-label', `${key}. ${value}`);
      button.type = 'button';
      button.style.cssText = `
        width: 30px;
        height: 30px;
        cursor: pointer;
        border: none;
        background-image: url('assets/game-car-question/img/Collects/Star.png');
        background-color: transparent;
        background-position: center;
        background-size: cover;
        min-width: 30px;
        min-height: 30px;
      `;

      const optionText = document.createElement('p');
      optionText.textContent = `${key}. ${value}`;
      optionText.style.cssText = `
        text-align: left;
        margin: 6px;
        overflow-wrap: anywhere;
      max-height: 60px;
        overflow-y: auto;
}
      `;

      optionDiv.appendChild(button);
      optionDiv.appendChild(optionText);

      // Evento de hover
      optionDiv.addEventListener('mouseenter', () => {
        optionDiv.style.transform = 'scale(1.05)';
        optionDiv.style.filter = 'saturate(1.5)';
      });
      optionDiv.addEventListener('mouseleave', () => {
        optionDiv.style.transform = 'scale(1)';
        optionDiv.style.filter = 'none';
      });

      // Evento de clic
      optionDiv.addEventListener('click', () => {
        this.handleModalAnswer(key as 'a' | 'b' | 'c' | 'd' | 'e' | 'f', question.correctAnswer);
      });

      optionsContainer.appendChild(optionDiv);
    });

    contentDiv.appendChild(optionsContainer);

    this.modalContent = this.add.dom(400, 290, contentDiv).setOrigin(0.5).setScrollFactor(0);
  }

  // Cerrar modal
  private closeQuestionModal() {
    this.modalOverlay?.destroy();
    this.modalContent?.destroy();
    this.modalOverlay = undefined;
    this.modalContent = undefined;
    this.currentQuestionIndex = -1;
  }

  // Manejar respuesta del modal
  private handleModalAnswer(selectedOption: 'a' | 'b' | 'c' | 'd' | 'e' | 'f', correctAnswer: string) {
    const isCorrect = selectedOption === correctAnswer;
    // Obtener la pregunta usando el índice GLOBAL
    const question = globalState.questions[this.currentQuestionIndex];

    // Emitir resultado al callback si existe
    const onResultCallback = this.registry.get('onResultCallback');
    if (onResultCallback && question) {
      const result = {
        isCorrect,
        questionIndex: this.currentQuestionIndex, // Índice global absoluto
        selectedAnswer: selectedOption,
        correctAnswer,
        question
      };
      onResultCallback(result);
    }

    if (isCorrect) {
      // Respuesta correcta: cerrar modal y terminar colisión
      this.closeQuestionModal();
      this.handleAnswer(true);
      this.handleCollisionEnd();
    } else {
      // Respuesta incorrecta: solo hacer efecto visual, mantener modal abierto
      this.badAnswer = this.sound.add('bad-answer');
      if (globalState.music) {
        this.badAnswer.play({
          volume: 0.3,
          loop: false
        });
        this.voice?.stop();
      }
      // Efecto visual de error
      this.cameras.main.shake(300, 0.02);
      // El modal permanece abierto para que pueda reintentar
    }
  }

  // Función auxiliar para barajar un array (algoritmo Fisher-Yates)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // Crear copia para no mutar el original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createNpcs() {
    const currentQuestions = globalState.getCurrentLevelQuestions();

    // Calcular el offset del índice global basado en el nivel actual
    const globalIndexOffset = globalState.currentLevel * globalState.questionsPerLevel;

    // Crear array con índices globales (absolutos)
    const questionsWithIndex = currentQuestions.map((q, idx) => ({ 
      question: q, 
      globalIndex: globalIndexOffset + idx // Índice global absoluto
    }));

    // Barajar preguntas aleatoriamente (manteniendo el índice global)
    const shuffledQuestions = this.shuffleArray(questionsWithIndex);

    // Limpiar NPCs existentes si los hay
    globalState.npcs = [];

    // Crear NPCs con preguntas (dinámico y aleatorio)
    shuffledQuestions.forEach((item, index) => {
      const { question, globalIndex } = item;
      // Usar configuración cíclica si hay más preguntas que configs
      const config = NPC_SPAWN_CONFIGS[index % NPC_SPAWN_CONFIGS.length];

      console.log(question);

      // Crear sprite del NPC
      const npcSprite = this.physics.add
        .sprite(config.position.x, config.position.y, 'npc1')
        .setScale(config.scale || 1.5);

      // Crear burbuja de diálogo
      const dialogBubble = this.add.sprite(config.position.x, config.position.y - 30, 'burbleDialog');
      dialogBubble.play('burbleDialog', true);
      npcSprite.setData('dialogBubble', dialogBubble);

      // Agregar al estado global
      globalState.npcs.push({
        sprite: npcSprite,
        id: config.id,
        questionIndex: globalIndex, // Asociar índice GLOBAL de la pregunta al NPC
        hasDialog: true,
        isInteractable: true,
        isMoving: true,
        dialog: dialogBubble,
        path: config.path,
        currentTarget: 0
      });
    });

    // Crear NPCs decorativos (siempre presentes)
    DECORATIVE_NPCS.forEach((decorativeConfig, index) => {
      const npcSprite = this.physics.add
        .sprite(decorativeConfig.position.x, decorativeConfig.position.y, 'npc1')
        .setScale(decorativeConfig.scale || 1.5);

      globalState.npcs.push({
        sprite: npcSprite,
        id: `npc-decorative-${index}`,
        hasDialog: false,
        isInteractable: false,
        isMoving: true,
        path: decorativeConfig.path,
        currentTarget: 0
      });
    });

    // Configurar colisiones después de crear todos los NPCs
    this.setupNpcCollisions();
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
  private handleNpcInteraction: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_, npcobj) => {
    const npcSprite = npcobj as Phaser.Physics.Arcade.Sprite;
    if (this.isColliding) return;

    const npcData = globalState.npcs.find((n) => n.sprite === npcSprite); // Encontrar el NPC correspondiente
    if (!npcData || !npcData.isInteractable) return; // Verificar si el NPC es interactuable

    // iniciar audio npc voice
    this.voice = this.sound.add('voice');
    if (globalState.music) {
      this.voice.play({
        volume: 0.2,
        loop: false
      });
    }
    // Pausar NPC
    npcData.isMoving = false;
    npcSprite.setVelocity(0, 0);
    npcSprite.anims.stop();

    // Mostrar modal con la pregunta
    this.showQuestionModal(npcData.questionIndex ?? 0);

    // Configurar estado
    this.isColliding = true;
    globalState.activeNpc = npcSprite;
    this.cameras.main.zoomTo(1.5, 300);
  };
  // Método que se ejecuta cuando termina la colisión
  private handleCollisionEnd() {
    if (!this.isColliding) return;

    const npcData = globalState.npcs.find((n) => n.sprite === globalState.activeNpc);
    if (npcData && npcData.isInteractable) {
      npcData.isMoving = true; // Reactivar movimiento
      this.voice.stop();
    }

    this.isColliding = false;
    globalState.activeNpc = undefined;
    this.cameras.main.zoomTo(1, 300);
    this.closeQuestionModal();
  }
  // Método para obtener la dirección del carro
  private getDirection(): { x: number; y: number } {
    const cursors = this.input.keyboard?.createCursorKeys();
    const keyObjUp = this.input.keyboard?.addKey('W');
    const keyObjDown = this.input.keyboard?.addKey('S');
    const keyObjLeft = this.input.keyboard?.addKey('A');
    const keyObjRight = this.input.keyboard?.addKey('D');

    const direction = { x: 0, y: 0 };

    if (cursors) {
      if (cursors.left.isDown || keyObjLeft?.isDown || this.controls.arrow_left) {
        direction.x = -1;
      } else if (cursors.right.isDown || keyObjRight?.isDown || this.controls.arrow_right) {
        direction.x = 1;
      } else if (cursors.up.isDown || keyObjUp?.isDown || this.controls.arrow_up) {
        direction.y = -1;
      } else if (cursors.down.isDown || keyObjDown?.isDown || this.controls.arrow_down) {
        direction.y = 1;
      }
    }
    return direction;
  }
  update() {
    if (!globalState.car) return;

    // Verificar fin de colisión
    if (this.isColliding && globalState.activeNpc && !this.physics.overlap(globalState.car!, globalState.activeNpc)) {
      this.handleCollisionEnd();
    }

    // Mover NPCs
    globalState.npcs.forEach((npc) => {
      if (npc.isMoving && npc.path) {
        this.moveWalkingNpc(npc);
      }
      // Update dialog bubble position
      const dialogBubble = npc.sprite.getData('dialogBubble');
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
          globalState.car.anims.play('car-right', true);
        } else if (direction.x === -1) {
          globalState.car.anims.play('car-left', true);
        } else if (direction.y === -1) {
          globalState.car.anims.play('car-up', true);
        } else if (direction.y === 1) {
          globalState.car.anims.play('car-down', true);
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
      sprite.anims.play(dx > 0 ? 'npc-walk-right' : 'npc-walk-left', true);
    } else {
      sprite.anims.play(dy > 0 ? 'npc-walk-down' : 'npc-walk-up', true);
    }

    // Mover hacia el target
    this.physics.moveTo(sprite, target.x, target.y, 50);

    // Cambiar target al llegar
    if (Phaser.Math.Distance.Between(sprite.x, sprite.y, target.x, target.y) < 5) {
      npc.currentTarget = (npc.currentTarget + 1) % npc.path!.length;
    }
  }

  /**
   * Transiciona al siguiente nivel del juego
   */
  private transitionToNextLevel() {
    // Avanzar al siguiente nivel
    const hasNextLevel = globalState.nextLevel();

    if (!hasNextLevel) {
      console.error('No hay siguiente nivel disponible');
      return;
    }

    console.log(`🎮 Avanzando al Nivel ${globalState.currentLevel + 1} de ${globalState.getTotalLevels()}`);

    // Limpiar NPCs actuales del mundo
    globalState.npcs.forEach((npc) => {
      npc.sprite.destroy();
      npc.dialog?.destroy();
    });
    globalState.npcs = [];

    // Limpiar estrellas actuales
    if (globalState.stars) {
      globalState.stars.empty.forEach((star) => star.destroy());
      globalState.stars.full.forEach((star) => star.destroy());
    }

    // Recrear sistema de estrellas para el nuevo nivel
    const questionsCount = globalState.currentLevelQuestions.length;
    globalState.stars = {
      full: [],
      empty: [],
      earned: 0,
      total: questionsCount
    };

    // Crear nuevas estrellas
    const starSpacing = 100;
    const startX = 400 - (questionsCount * starSpacing) / 2 + starSpacing / 2;

    for (let i = 0; i < questionsCount; i++) {
      if (!globalState.stars) return;
      const x = startX + i * starSpacing;

      globalState.stars.empty[i] = this.add.sprite(x, 50, 'empty-star').setScale(0.6).setDepth(1).setScrollFactor(0);

      globalState.stars.full[i] = this.add
        .sprite(x, 50, 'full-star')
        .setScale(0.6)
        .setVisible(false)
        .setDepth(2)
        .setScrollFactor(0);
    }

    // Crear nuevos NPCs para el nuevo nivel
    this.createNpcs();

    // Recrear las estrellas del efecto de victoria para el próximo nivel
    this.starTransition = new StarTransition(this, 'finishColletion');
    this.starTransition.createStars();

    // Resetear posición del carro
    if (globalState.car) {
      globalState.car.setPosition(300, 300);
      globalState.car.setVelocity(0, 0);
    }

    // Mensaje de nivel (opcional)
    const levelText = this.add
      .text(400, 300, `Nivel ${globalState.currentLevel + 1}`, {
        fontFamily: 'PressStart2P',
        fontSize: '38px',
        color: '#ffd840',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setScrollFactor(0);

    // Fade out del texto después de 2 segundos
    this.tweens.add({
      targets: levelText,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => levelText.destroy()
    });
  }
}
