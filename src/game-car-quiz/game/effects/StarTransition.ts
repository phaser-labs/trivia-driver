import Phaser from "phaser";

import { globalState } from "../utils/GlobalState";

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
    // Crear 6 estrellas distribuidas alrededor de la pantalla para efecto de victoria
    const positions = [
      { x: 100, y: 100 }, 
      { x: 400, y: 80 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 550 }
    ];

    positions.forEach((pos) => {
      const star = this.scene.add.sprite(pos.x, pos.y, 'full-star')
        .setOrigin(0.5)
        .setScale(1.8)
        .setDepth(10)
        .setVisible(false)
        .setAlpha(0);
      this.stars.push(star);
    });
  }

  startTransition(onComplete: () => void) {
    if (globalState.music) {
      this.scene.sound.play(this.soundKey, { volume: 0.1, loop: false}); // Reproduce el sonido
    }
    
    // Reproducir sonido de victoria
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
    
    // Animación de aparición y convergencia de todas las estrellas
    this.stars.forEach((star, index) => {
      // Primero hacerlas visibles con fade in
      star.setVisible(true);
      
      this.scene.tweens.add({
        targets: star,
        alpha: 1,
        scale: 2,
        duration: 300,
        delay: index * 150,
        ease: 'Back.easeOut'
      });

      // Luego converger al centro
      this.scene.tweens.add({
        targets: star,
        x: this.centerX,
        y: this.centerY,
        angle: 720,
        scale: 0.3,
        duration: 2500,
        delay: index * 150 + 400,
        ease: 'Elastic.out',
        onComplete: index === this.stars.length - 1 ? () => {
          // Limpiar todas las estrellas antes de completar
          this.stars.forEach(s => s.destroy());
          this.stars = [];
          onComplete(); 
        } : undefined
      });
    });
  }
}