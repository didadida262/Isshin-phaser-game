import Phaser from 'phaser';
import { TILE } from '../tuning';
import type { EnemyKind } from '../data/stage1';
import { sfx } from '../sfx';

const STATS: Record<EnemyKind, { hp: number; damage: number; speed: number; display: number }> = {
  walker: { hp: 2, damage: 1, speed: 55, display: 52 },
  flyer: { hp: 1, damage: 1, speed: 0, display: 48 },
  shell: { hp: 4, damage: 1, speed: 32, display: 56 },
  boss: { hp: 12, damage: 2, speed: 70, display: 140 }
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  kind: EnemyKind;
  hp: number;
  damage: number;
  dead = false;
  private dir = -1;
  private homeX: number;
  private patrol: number;
  private baseY: number;
  private nextSpecial = 0;
  onSpecial?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: EnemyKind, patrol = 120) {
    super(scene, x, y, textureFor(kind, false));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.kind = kind;
    this.hp = STATS[kind].hp;
    this.damage = STATS[kind].damage;
    this.homeX = x;
    this.patrol = patrol;
    this.baseY = y;
    this.setDepth(15);
    this.setDisplaySize(STATS[kind].display, STATS[kind].display * (kind === 'boss' ? 0.9 : 0.85));
    if (kind === 'boss') {
      this.setTint(0xff8866);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (kind === 'flyer') {
      body.setAllowGravity(false);
      body.setSize(80, 60);
    } else if (kind === 'boss') {
      body.setSize(90, 80);
      body.setOffset(20, 40);
    } else {
      body.setSize(80, 70);
      body.setOffset(24, 50);
    }
    body.setCollideWorldBounds(true);
  }

  get drop(): 'hp' | 'mp' | null {
    if (this.kind === 'boss') {
      return null;
    }
    const roll = Math.random();
    if (this.kind === 'flyer') {
      return roll < 0.65 ? 'mp' : roll < 0.85 ? 'hp' : null;
    }
    if (this.kind === 'shell') {
      return roll < 0.7 ? 'hp' : 'mp';
    }
    return roll < 0.45 ? 'hp' : roll < 0.8 ? 'mp' : null;
  }

  hit(amount: number): boolean {
    if (this.dead) {
      return false;
    }
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      this.clearTint();
      if (this.kind === 'boss' && !this.dead) {
        this.setTint(0xff8866);
      }
    });
    sfx.hit();
    if (this.hp <= 0) {
      this.kill();
      return true;
    }
    if (this.kind === 'walker') {
      this.setTexture('enemy-walker-hit');
      this.scene.time.delayedCall(120, () => {
        if (!this.dead) {
          this.setTexture('enemy-walker');
        }
      });
    }
    return false;
  }

  kill(): void {
    this.dead = true;
    const deadKey =
      this.kind === 'walker'
        ? 'enemy-walker-dead'
        : this.kind === 'flyer'
          ? 'enemy-flyer-dead'
          : this.kind === 'boss'
            ? 'enemy-boss-dead'
            : 'enemy-shell';
    this.setTexture(deadKey);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, this.kind === 'flyer' ? 80 : -160);
    body.checkCollision.none = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 420,
      onComplete: () => this.destroy()
    });
  }

  march(now: number): void {
    if (this.dead) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    const moving = Math.floor(now / 180) % 2 === 0;
    if (this.kind === 'flyer') {
      const x = this.homeX + Math.sin(now / 420) * this.patrol;
      const y = this.baseY + Math.sin(now / 280) * 28;
      body.reset(x, y);
      this.setTexture(moving ? 'enemy-flyer-move' : 'enemy-flyer');
      this.setFlipX(Math.cos(now / 420) < 0);
      return;
    }

    if (this.kind === 'walker') {
      this.setTexture(moving ? 'enemy-walker-move' : 'enemy-walker');
    } else if (this.kind === 'shell') {
      this.setTexture(moving ? 'enemy-shell-move' : 'enemy-shell');
    } else {
      this.setTexture(moving ? 'enemy-boss-move' : 'enemy-boss');
    }

    if (Math.abs(this.x - this.homeX) > this.patrol) {
      this.dir *= -1;
      this.x = this.homeX + this.dir * this.patrol;
    }
    body.setVelocityX(this.dir * STATS[this.kind].speed);
    this.setFlipX(this.dir > 0);

    if (this.kind === 'boss' && now > this.nextSpecial) {
      this.nextSpecial = now + 2200;
      this.onSpecial?.(this);
      body.setVelocityY(-420);
    }
  }
}

function textureFor(kind: EnemyKind, moving: boolean): string {
  if (kind === 'walker') {
    return moving ? 'enemy-walker-move' : 'enemy-walker';
  }
  if (kind === 'flyer') {
    return moving ? 'enemy-flyer-move' : 'enemy-flyer';
  }
  if (kind === 'shell') {
    return moving ? 'enemy-shell-move' : 'enemy-shell';
  }
  return moving ? 'enemy-boss-move' : 'enemy-boss';
}

export function tileToWorld(tx: number, ty: number): { x: number; y: number } {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}
