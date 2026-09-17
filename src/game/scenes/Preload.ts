import Phaser from 'phaser';
import { IMAGES } from '../catalog';

export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 420, 18, 0x3a1d0c, 0.9);
    const bar = this.add.rectangle(width / 2 - 200, height / 2, 4, 12, 0xffc45c).setOrigin(0, 0.5);
    this.add
      .text(width / 2, height / 2 - 40, '一心  ISSHIN', {
        fontFamily: 'Georgia, "Songti SC", serif',
        fontSize: '36px',
        color: '#fff1d0'
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 400 * value;
    });
    barBg.setDepth(1);

    Object.entries(IMAGES).forEach(([key, file]) => {
      this.load.image(key, file);
    });
  }

  create(): void {
    this.makeVfxTextures();
    this.scene.start('Title');
  }

  private makeVfxTextures(): void {
    if (!this.textures.exists('vfx-slash')) {
      const slash = this.add.graphics().setVisible(false);
      slash.fillStyle(0xffe27a, 1);
      slash.fillRoundedRect(0, 8, 92, 14, 7);
      slash.fillStyle(0xfff6c8, 0.9);
      slash.fillRoundedRect(12, 4, 70, 8, 4);
      slash.generateTexture('vfx-slash', 96, 28);
      slash.destroy();
    }

    if (!this.textures.exists('vfx-fireball')) {
      const ball = this.add.graphics().setVisible(false);
      ball.fillStyle(0xff7a1a, 1);
      ball.fillCircle(16, 16, 14);
      ball.fillStyle(0xffe066, 1);
      ball.fillCircle(16, 16, 8);
      ball.fillStyle(0xfff4c2, 1);
      ball.fillCircle(13, 13, 4);
      ball.generateTexture('vfx-fireball', 32, 32);
      ball.destroy();
    }
  }
}
