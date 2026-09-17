import Phaser from 'phaser';
import { GAME_WIDTH } from '../tuning';
import type { Player } from '../entities/Player';

export class Hud {
  private hearts: Phaser.GameObjects.Image[] = [];
  private gems: Phaser.GameObjects.Image[] = [];
  private hint: Phaser.GameObjects.Text;
  private banner: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player, stageTitle: string) {
    const root = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    for (let i = 0; i < player.maxHp; i += 1) {
      const heart = scene.add.image(22 + i * 26, 24, 'hud-heart-full').setDisplaySize(22, 22).setScrollFactor(0);
      this.hearts.push(heart);
      root.add(heart);
    }
    for (let i = 0; i < player.maxMp; i += 1) {
      const gem = scene.add.image(22 + i * 26, 50, 'hud-mp-full').setDisplaySize(20, 20).setScrollFactor(0);
      this.gems.push(gem);
      root.add(gem);
    }

    this.banner = scene.add
      .text(GAME_WIDTH / 2, 24, stageTitle, {
        fontFamily: 'Georgia, "Songti SC", serif',
        fontSize: '22px',
        color: '#fff4d8',
        stroke: '#3a1d0c',
        strokeThickness: 6
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    root.add(this.banner);

    this.hint = scene.add
      .text(GAME_WIDTH - 24, 20, 'A/D 移动  W 跳  L 斩击  K 火弹  P 暂停', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffe7c2'
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setAlpha(0.9);
    root.add(this.hint);
  }

  sync(player: Player): void {
    this.hearts.forEach((heart, i) => {
      heart.setTexture(i < player.hp ? 'hud-heart-full' : 'hud-heart-empty');
    });
    this.gems.forEach((gem, i) => {
      gem.setTexture(i < player.mp ? 'hud-mp-full' : 'hud-mp-empty');
    });
  }
}
