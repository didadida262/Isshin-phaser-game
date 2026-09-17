import Phaser from 'phaser';
import { TILE, TUNING } from '../tuning';
import { sfx } from '../sfx';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = TUNING.maxHp;
  mp: number = TUNING.maxMp;
  readonly maxHp: number = TUNING.maxHp;
  readonly maxMp: number = TUNING.maxMp;
  facing = 1;
  attacking = false;
  invulnerableUntil = 0;
  private jumpLocked = false;
  private slashUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.5);
    this.setTint(0xffc4a8);
    this.setDepth(20);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(46, 96);
    body.setOffset(41, 150);
    body.setCollideWorldBounds(true);
    this.invulnerableUntil = scene.time.now + 1200;
  }

  get canAct(): boolean {
    return this.active && this.hp > 0 && !this.attacking;
  }

  slashReady(now: number): boolean {
    return this.canAct && now >= this.slashUntil;
  }

  consumeSlash(now: number): void {
    this.attacking = true;
    this.slashUntil = now + TUNING.slashMs + 80;
    this.setTexture('player-duck');
    sfx.slash();
    this.scene.time.delayedCall(TUNING.slashMs, () => {
      this.attacking = false;
    });
  }

  tryJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!this.canAct || !body.blocked.down || this.jumpLocked) {
      return;
    }
    body.setVelocityY(TUNING.jumpSpeed);
    this.jumpLocked = true;
    sfx.jump();
  }

  releaseJump(): void {
    this.jumpLocked = false;
  }

  takeHit(fromX: number, damage: number): boolean {
    const now = this.scene.time.now;
    if (now < this.invulnerableUntil || this.hp <= 0) {
      return false;
    }
    this.hp = Math.max(0, this.hp - damage);
    this.invulnerableUntil = now + TUNING.invulnMs;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir = this.x < fromX ? -1 : 1;
    body.setVelocity(dir * TUNING.knockback, -220);
    this.setTexture('player-hurt');
    sfx.hurt();
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
      repeat: 8,
      onComplete: () => this.setAlpha(1)
    });
    return this.hp <= 0;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  restoreMp(amount: number): void {
    this.mp = Math.min(this.maxMp, this.mp + amount);
  }

  spendMp(amount: number): boolean {
    if (this.mp < amount) {
      return false;
    }
    this.mp -= amount;
    return true;
  }

  control(left: boolean, right: boolean, grounded: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const air = grounded ? 1 : TUNING.airControl;
    if (this.attacking && grounded) {
      body.setVelocityX(0);
      return;
    }
    if (left === right) {
      body.setVelocityX(grounded ? 0 : body.velocity.x * 0.92);
    } else {
      this.facing = right ? 1 : -1;
      this.setFlipX(this.facing < 0);
      body.setVelocityX(this.facing * TUNING.moveSpeed * air);
    }
  }

  refreshPose(grounded: boolean, moving: boolean): void {
    if (this.hp <= 0) {
      this.setTexture('player-hurt');
      return;
    }
    if (this.scene.time.now < this.invulnerableUntil && this.attacking === false && !grounded) {
      this.setTexture('player-hurt');
      return;
    }
    if (this.attacking) {
      this.setTexture('player-duck');
      return;
    }
    if (!grounded) {
      this.setTexture('player-jump');
      return;
    }
    if (moving) {
      const frame = Math.floor(this.scene.time.now / 140) % 2 === 0 ? 'player-walk1' : 'player-walk2';
      this.setTexture(frame);
      return;
    }
    this.setTexture('player-idle');
  }

  slashOrigin(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x + this.facing * TILE * 0.85, this.y + 8);
  }
}
