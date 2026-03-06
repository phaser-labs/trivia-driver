/**
 * Configuración de spawn points y rutas de patrulla para NPCs
 * Permite distribuir dinámicamente NPCs según la cantidad de preguntas
 */

export interface NpcSpawnConfig {
  id: string;
  position: { x: number; y: number };
  path: { x: number; y: number }[];
  scale?: number;
}

/**
 * Pool de configuraciones de NPCs disponibles.
 * Se pueden reutilizar cíclicamente si hay más preguntas que configuraciones.
 */
export const NPC_SPAWN_CONFIGS: NpcSpawnConfig[] = [
  {
    id: 'npc-spawn-1',
    position: { x: 350, y: 750 },
    path: [
      { x: 350, y: 456 },
      { x: 350, y: 400 },
      { x: 350, y: 456 },
      { x: 50, y: 456 },
      { x: -80, y: 456 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-2',
    position: { x: 500, y: 650 },
    path: [
      { x: 500, y: 456 },
      { x: 500, y: 780 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-3',
    position: { x: 900, y: 340 },
    path: [
      { x: 754, y: 340 },
      { x: 754, y: 190 },
      { x: 754, y: 340 },
      { x: 500, y: 340 },
      { x: 900, y: 340 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-4',
    position: { x: 74, y: -90 },
    path: [
      { x: 74, y: 180 },
      { x: -100, y: 180 },
      { x: 80, y: 180 },
    ],
    scale: 1.5,
  },
  // Configuraciones adicionales para soportar más de 4 preguntas
  {
    id: 'npc-spawn-5',
    position: { x: 600, y: 100 },
    path: [
      { x: 600, y: 100 },
      { x: 700, y: 100 },
      { x: 600, y: 200 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-6',
    position: { x: 150, y: 600 },
    path: [
      { x: 150, y: 600 },
      { x: 250, y: 600 },
      { x: 150, y: 700 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-7',
    position: { x: 800, y: 600 },
    path: [
      { x: 800, y: 600 },
      { x: 800, y: 500 },
      { x: 700, y: 600 },
    ],
    scale: 1.5,
  },
  {
    id: 'npc-spawn-8',
    position: { x: 400, y: 50 },
    path: [
      { x: 400, y: 50 },
      { x: 300, y: 50 },
      { x: 400, y: 150 },
    ],
    scale: 1.5,
  },
];

/**
 * NPCs decorativos (sin preguntas)
 * Siempre se crean para dar vida al mundo
 */
export const DECORATIVE_NPCS: Omit<NpcSpawnConfig, 'id'>[] = [
  {
    position: { x: 200, y: 200 },
    path: [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
    ],
    scale: 1.5,
  },
  {
    position: { x: 230, y: -100 },
    path: [
      { x: 230, y: 200 },
      { x: 230, y: 170 },
    ],
    scale: 1.5,
  },
];

/**
 * Constantes de configuración del juego
 */
export const GAME_CONFIG = {
  /** Cantidad máxima de preguntas por nivel/mundo */
  QUESTIONS_PER_LEVEL: 4,
  
  /** Velocidad de movimiento de los NPCs */
  NPC_SPEED: 50,
  
  /** Distancia mínima para considerar que el NPC llegó a su destino */
  NPC_TARGET_THRESHOLD: 5,
};
