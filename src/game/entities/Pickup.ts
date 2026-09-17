import Phaser from 'phaser';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  kind: 'hp' | 'mp';

  constructor(scene: Phaser.Scene, x: number, y: number, kind: 'hp' | 'mp') {
    super(scene, x, y, kind === 'hp' ? 'pickup-hp' : 'pickup-mp');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.kind = kind;
    this.setDepth(18);
    this.setDisplaySize(36, 36);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }
}
