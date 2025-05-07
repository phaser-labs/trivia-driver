import { globalState } from "../utils/GlobalState";
import Phaser from "phaser";

export class StarTransition {
  private scene: Phaser.Scene;
  private stars: Phaser.GameObjects.Sprite[] = [];
  private centerX: number;
  private centerY: number;
  private soundStars?: Phaser.Sound.BaseSound; // Referencia al sonido
  private soundKey: string; // Guarda la clave del sonido

  constructor(scene: Phaser.Scene, soundKey: string) {
    this.scene = scene;
    this.centerX = this.scene.cameras.main.centerX;
    this.centerY = this.scene.cameras.main.centerY;
    this.soundKey = soundKey;
  }

  createStars() {
    const positions = [
      { x: 100, y: 100 }, 
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 }
    ];

    positions.forEach((pos, i) => {
      console.log(i);
      const star = this.scene.add.sprite(pos.x, pos.y, 'full-star')
        .setOrigin(0.5)
        .setScale(1.5)
        .setDepth(1000)
        .setVisible(false);
      this.stars.push(star);
    });
  }

  startTransition(onComplete: () => void) {
    if (globalState.music) {
      this.scene.sound.play(this.soundKey, { volume: 0.1, loop: false}); // Reproduce el sonido
    }
    // Mostrar estrellas
    this.stars.forEach(star => star.setVisible(true));

    // Animación principal
    this.stars.forEach((star, index) => {
      this.scene.tweens.add({
        targets: star,
        x: this.centerX,
        y: this.centerY,
        angle: 720,
        scale: 0.2,
        duration: 2800,
        delay: index * 400,
        ease: 'Elastic.out',
        onComplete: index === 3 ? () => {
          onComplete(); 
        } : undefined
      });
    });

    // Reproducir sonido (con verificación)
    if (this.scene.sound.get('finishColletion')) {
      this.soundStars = this.scene.sound.add('finishColletion');
      this.soundStars.play({
        volume: 1,
        loop: false,
      });
    } else {
      console.warn("Audio 'finishColletion' not found in cache");
    }

    // Efectos adicionales
    this.scene.cameras.main.flash(300, 255, 255, 255);
  }
}