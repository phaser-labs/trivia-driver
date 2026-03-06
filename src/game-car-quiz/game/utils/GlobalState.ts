import { Question } from './types/type';

// globalState.ts
class GlobalState {
  gameCompleted: boolean = false;
  car?: Phaser.Physics.Arcade.Sprite;
  activeNpc?: Phaser.Physics.Arcade.Sprite;
  npcs: {
    sprite: Phaser.Physics.Arcade.Sprite;
    id: string;
    questionIndex?: number; // Índice de la pregunta asociada (si tiene)
    hasDialog: boolean;
    isInteractable: boolean;
    isMoving: boolean;
    dialog?: Phaser.GameObjects.Sprite;
    path?: { x: number; y: number }[];
    currentTarget: number;
  }[] = [];
  stars?: {
    empty: Phaser.GameObjects.Sprite[];
    full: Phaser.GameObjects.Sprite[];
    earned: number;
    total: number;
  };
  music?: boolean = true;
  
  // Nuevas propiedades para sistema multinivel
  questions: Question[] = []; // Todas las preguntas cargadas
  currentLevel: number = 0; // Nivel/mundo actual (empieza en 0)
  questionsPerLevel: number = 4; // Preguntas por nivel
  currentLevelQuestions: Question[] = []; // Preguntas del nivel actual
  completedQuestions: string[] = []; // IDs de preguntas completadas

  /**
   * Obtiene las preguntas del nivel actual
   */
  getCurrentLevelQuestions(): Question[] {
    const start = this.currentLevel * this.questionsPerLevel;
    const end = start + this.questionsPerLevel;
    return this.questions.slice(start, end);
  }

  /**
   * Calcula el número total de niveles
   */
  getTotalLevels(): number {
    return Math.ceil(this.questions.length / this.questionsPerLevel);
  }

  /**
   * Verifica si el nivel actual está completo
   */
  isCurrentLevelComplete(): boolean {
    return this.stars ? this.stars.earned >= this.currentLevelQuestions.length : false;
  }

  /**
   * Avanza al siguiente nivel
   */
  nextLevel(): boolean {
    if (this.currentLevel + 1 < this.getTotalLevels()) {
      this.currentLevel++;
      this.currentLevelQuestions = this.getCurrentLevelQuestions();
      this.completedQuestions = [];
      if (this.stars) {
        this.stars.earned = 0;
      }
      return true;
    }
    return false; // No hay más niveles
  }

  /**
   * Reinicia el estado del juego
   */
  reset(): void {
    this.currentLevel = 0;
    this.completedQuestions = [];
    this.gameCompleted = false;
    this.currentLevelQuestions = this.getCurrentLevelQuestions();
    if (this.stars) {
      this.stars.earned = 0;
    }
  }

  /**
   * Inicializa el estado global con las preguntas
   */
  initialize(questions: Question[]): void {
    this.questions = questions;
    this.currentLevel = 0;
    this.completedQuestions = [];
    this.currentLevelQuestions = this.getCurrentLevelQuestions();
  }
}

export const globalState = new GlobalState();
