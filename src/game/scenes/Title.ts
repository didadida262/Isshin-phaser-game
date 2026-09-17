import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../tuning';
import { sfx } from '../sfx';

export class Title extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-title').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x140c08, 0.42);

    this.add
      .text(GAME_WIDTH / 2, 168, '一  心', {
        fontFamily: 'Georgia, "Songti SC", "Hiragino Mincho ProN", serif',
        fontSize: '92px',
        color: '#fff4d8',
        stroke: '#4a220c',
        strokeThickness: 10
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 248, 'I S S H I N', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#ffcf7a'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 320, '灯笼庭 · 第一关', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '22px',
        color: '#ffe7c2'
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(GAME_WIDTH / 2, 430, '点击画面，或按 Enter / 空格 开始', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '24px',
        color: '#fffaf0'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.25,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.add
      .text(
        GAME_WIDTH / 2,
        560,
        'A / D 移动    W 跳跃    L 斩击    K 火弹（耗蓝）    P 暂停\n占位美术：Kenney.nl（CC0）· 玩法向 Gloomyvania / 城主闯关致敬',
        {
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: '16px',
          color: '#e8d2b0',
          align: 'center',
          lineSpacing: 8
        }
      )
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => this.begin());
    this.input.keyboard?.once('keydown-SPACE', () => this.begin());
    this.input.once('pointerdown', () => this.begin());
  }

  private begin(): void {
    sfx.pickup();
    this.cameras.main.fadeOut(250, 20, 10, 6);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Play');
    });
  }
}
