// globalState.ts
class GlobalState {
  gameCompleted: boolean = false;
  car?: Phaser.Physics.Arcade.Sprite;
  activeNpc?: Phaser.Physics.Arcade.Sprite;
  npcs: {
    sprite: Phaser.Physics.Arcade.Sprite;
    id: string;
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
}

export const globalState = new GlobalState();
