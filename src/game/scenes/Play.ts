import Phaser from 'phaser';
import { STAGE_1, type PropSpawn, type RectSpan } from '../data/stage1';
import { Enemy, tileToWorld } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { sfx } from '../sfx';
import { GAME_HEIGHT, GAME_WIDTH, TILE, TUNING } from '../tuning';
import { Hud } from '../ui/Hud';

export class Play extends Phaser.Scene {
  private player!: Player;
  private hud!: Hud;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.GameObjects.Group;
  private pickups!: Phaser.GameObjects.Group;
  private slashes!: Phaser.Physics.Arcade.Group;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private enemyShots!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private shrine?: Phaser.GameObjects.Image;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    jumpAlt: Phaser.Input.Keyboard.Key;
    slash: Phaser.Input.Keyboard.Key;
    slashAlt: Phaser.Input.Keyboard.Key;
    fire: Phaser.Input.Keyboard.Key;
    pause: Phaser.Input.Keyboard.Key;
    restart: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key;
  };
  private paused = false;
  private overlay?: Phaser.GameObjects.Container;
  private ended = false;
  private worldWidth = 0;
  private worldHeight = 0;

  constructor() {
    super('Play');
  }

  create(): void {
    this.buildStage();
  }

  private buildStage(): void {
    this.ended = false;
    this.paused = false;
    this.worldWidth = STAGE_1.cols * TILE;
    this.worldHeight = STAGE_1.rows * TILE;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBackgroundColor('#1b120c');

    this.add
      .tileSprite(0, 0, this.worldWidth, this.worldHeight, 'bg-far')
      .setOrigin(0, 0)
      .setScrollFactor(0.15, 0)
      .setTint(0xffd0a8)
      .setDepth(0);

    this.ground = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.enemies = this.add.group();
    this.pickups = this.add.group();
    this.slashes = this.physics.add.group();
    this.fireballs = this.physics.add.group();
    this.enemyShots = this.physics.add.group();

    this.paintGround(STAGE_1.ground, false);
    this.paintGround(STAGE_1.fill, true);
    this.paintPlatforms(STAGE_1.platforms);
    this.paintSpikes(STAGE_1.spikes);
    STAGE_1.props.forEach((prop) => this.paintProp(prop));

    const spawn = tileToWorld(STAGE_1.spawn.x, STAGE_1.spawn.y);
    this.player = new Player(this, spawn.x, spawn.y);

    STAGE_1.enemies.forEach((spawnData) => {
      const pos = tileToWorld(spawnData.x, spawnData.y);
      const enemy = new Enemy(this, pos.x, pos.y, spawnData.type, spawnData.patrol);
      this.enemies.add(enemy);
    });
    const bossPos = tileToWorld(STAGE_1.boss.x, STAGE_1.boss.y);
    const boss = new Enemy(this, bossPos.x, bossPos.y, 'boss', STAGE_1.boss.patrol);
    boss.onSpecial = (enemy) => this.bossVolley(enemy);
    this.enemies.add(boss);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.pickups, this.ground);
    this.physics.add.collider(this.fireballs, this.ground, (ball) => {
      (ball as Phaser.Physics.Arcade.Sprite).destroy();
    });

    this.physics.add.overlap(this.player, this.hazards, () => {
      this.hurtPlayer(this.player.x, 1);
    });
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (!enemy.dead) {
        this.hurtPlayer(enemy.x, enemy.damage);
      }
    });
    this.physics.add.overlap(this.slashes, this.enemies, (_slash, enemyObj) => {
      this.damageEnemy(enemyObj as Enemy, TUNING.slashDamage);
    });
    this.physics.add.overlap(this.fireballs, this.enemies, (ball, enemyObj) => {
      (ball as Phaser.Physics.Arcade.Sprite).destroy();
      this.damageEnemy(enemyObj as Enemy, TUNING.fireballDamage);
    });
    this.physics.add.overlap(this.player, this.pickups, (_player, itemObj) => {
      this.collect(itemObj as Pickup);
    });
    this.physics.add.overlap(this.player, this.enemyShots, (_player, shot) => {
      (shot as Phaser.Physics.Arcade.Sprite).destroy();
      this.hurtPlayer(this.player.x, 1);
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 80);
    this.cameras.main.fadeIn(350, 20, 10, 6);

    this.hud = new Hud(this, this.player, STAGE_1.title);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      jumpAlt: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      slash: kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      slashAlt: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      fire: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      pause: kb.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      restart: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      confirm: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    };
  }

  update(time: number): void {
    if (this.ended) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
        this.scene.restart();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.confirm)) {
        this.scene.start('Title');
      }
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }
    if (this.paused) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
        this.scene.start('Title');
      }
      return;
    }

    const left = this.keys.left.isDown || this.cursors.left.isDown;
    const right = this.keys.right.isDown || this.cursors.right.isDown;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;

    this.player.control(left, right, grounded);

    if (this.keys.jump.isDown || this.keys.jumpAlt.isDown) {
      this.player.tryJump();
    } else {
      this.player.releaseJump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.slash) || Phaser.Input.Keyboard.JustDown(this.keys.slashAlt)) {
      this.doSlash(time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.fire)) {
      this.doFireball();
    }

    this.player.refreshPose(grounded, left || right);
    this.hud.sync(this.player);

    this.enemies.getChildren().forEach((child) => {
      (child as Enemy).march(time);
    });

    if (this.shrine && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.shrine.x, this.shrine.y) < 70) {
      if (this.player.hp < this.player.maxHp) {
        this.player.heal(this.player.maxHp);
        this.hud.sync(this.player);
      }
    }

    if (this.player.y > this.worldHeight + 80) {
      this.fail();
    }
  }

  private paintGround(spans: RectSpan[], fill: boolean): void {
    spans.forEach((span) => {
      for (let i = 0; i < span.w; i += 1) {
        const tx = span.x + i;
        const { x, y } = tileToWorld(tx, span.y);
        const key = fill
          ? 'tile-brick'
          : i === 0
            ? 'tile-stone-left'
            : i === span.w - 1
              ? 'tile-stone-right'
              : 'tile-stone-mid';
        const tile = this.ground.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(TILE, TILE).refreshBody();
        tile.setDepth(5);
      }
    });
  }

  private paintPlatforms(spans: RectSpan[]): void {
    spans.forEach((span) => {
      for (let i = 0; i < span.w; i += 1) {
        const { x, y } = tileToWorld(span.x + i, span.y);
        const key =
          span.w === 1
            ? 'tile-stone-half'
            : i === 0
              ? 'tile-stone-half-left'
              : i === span.w - 1
                ? 'tile-stone-half-right'
                : 'tile-stone-half-mid';
        const tile = this.ground.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(TILE, TILE).refreshBody();
        tile.setDepth(5);
      }
    });
  }

  private paintSpikes(spans: RectSpan[]): void {
    spans.forEach((span) => {
      for (let i = 0; i < span.w; i += 1) {
        const { x, y } = tileToWorld(span.x + i, span.y);
        const spike = this.hazards.create(x, y + 10, 'hazard-spikes') as Phaser.Physics.Arcade.Sprite;
        spike.setDisplaySize(TILE * 0.9, TILE * 0.55).refreshBody();
        spike.setDepth(6);
      }
    });
  }

  private paintProp(prop: PropSpawn): void {
    const { x, y } = tileToWorld(prop.x, prop.y);
    if (prop.type === 'door') {
      this.add.image(x, y - TILE * 0.7, 'prop-door-top').setDisplaySize(TILE, TILE).setDepth(4);
      this.add.image(x, y + 8, 'prop-door-mid').setDisplaySize(TILE * 0.7, TILE).setDepth(4);
      return;
    }
    if (prop.type === 'torch') {
      const torch = this.add.image(x, y, 'prop-torch1').setDisplaySize(28, 56).setDepth(7);
      this.time.addEvent({
        delay: 180,
        loop: true,
        callback: () => torch.setTexture(torch.texture.key === 'prop-torch1' ? 'prop-torch2' : 'prop-torch1')
      });
      return;
    }
    if (prop.type === 'shrine') {
      this.shrine = this.add.image(x, y, 'prop-shrine').setDisplaySize(52, 64).setDepth(7);
      this.add
        .text(x, y - 48, '心', {
          fontFamily: 'Georgia, "Songti SC", serif',
          fontSize: '16px',
          color: '#ffe7a8'
        })
        .setOrigin(0.5)
        .setDepth(8);
      return;
    }
    const map: Record<string, { key: string; w: number; h: number }> = {
      crate: { key: 'prop-crate', w: 48, h: 48 },
      bush: { key: 'prop-bush', w: 64, h: 48 },
      rock: { key: 'prop-rock', w: 56, h: 40 },
      window: { key: 'prop-window', w: 48, h: 48 },
      flag: { key: 'prop-flag', w: 40, h: 64 },
      fence: { key: 'prop-fence', w: 64, h: 40 },
      sign: { key: 'prop-sign-exit', w: 56, h: 56 }
    };
    const spec = map[prop.type];
    if (spec) {
      this.add.image(x, y, spec.key).setDisplaySize(spec.w, spec.h).setDepth(7);
    }
  }

  private doSlash(now: number): void {
    if (!this.player.slashReady(now)) {
      return;
    }
    this.player.consumeSlash(now);
    const origin = this.player.slashOrigin();
    const slash = this.slashes.create(origin.x, origin.y, 'vfx-slash') as Phaser.Physics.Arcade.Sprite;
    slash.setFlipX(this.player.facing < 0);
    slash.setDepth(22);
    const body = slash.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(this.player.facing * 40);
    this.time.delayedCall(TUNING.slashMs, () => slash.destroy());
  }

  private doFireball(): void {
    if (!this.player.canAct || !this.player.spendMp(TUNING.fireballCost)) {
      return;
    }
    sfx.fire();
    this.hud.sync(this.player);
    const origin = this.player.slashOrigin();
    const ball = this.fireballs.create(origin.x, origin.y, 'vfx-fireball') as Phaser.Physics.Arcade.Sprite;
    ball.setDepth(21);
    const body = ball.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(this.player.facing * TUNING.fireballSpeed, 0);
    ball.setFlipX(this.player.facing < 0);
    this.time.delayedCall(1400, () => {
      if (ball.active) {
        ball.destroy();
      }
    });
  }

  private bossVolley(enemy: Enemy): void {
    if (enemy.dead || this.ended) {
      return;
    }
    const dir = this.player.x < enemy.x ? -1 : 1;
    const ball = this.enemyShots.create(enemy.x, enemy.y - 20, 'fx-star') as Phaser.Physics.Arcade.Sprite;
    ball.setTint(0xffaa33);
    ball.setDisplaySize(36, 36);
    ball.setDepth(21);
    const body = ball.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(dir * 280, -40);
    this.time.delayedCall(1800, () => {
      if (ball.active) {
        ball.destroy();
      }
    });
  }

  private damageEnemy(enemy: Enemy, amount: number): void {
    if (enemy.dead) {
      return;
    }
    const wasBoss = enemy.kind === 'boss';
    const killed = enemy.hit(amount);
    if (killed) {
      const drop = enemy.drop;
      if (drop) {
        this.pickups.add(new Pickup(this, enemy.x, enemy.y - 10, drop));
      }
      if (wasBoss) {
        this.win();
      }
    }
  }

  private collect(item: Pickup): void {
    if (!item.active) {
      return;
    }
    if (item.kind === 'hp') {
      this.player.heal(2);
    } else {
      this.player.restoreMp(1);
    }
    sfx.pickup();
    this.hud.sync(this.player);
    item.destroy();
  }

  private hurtPlayer(fromX: number, damage: number): void {
    if (this.ended) {
      return;
    }
    const dead = this.player.takeHit(fromX, damage);
    this.hud.sync(this.player);
    if (dead) {
      this.fail();
    }
  }

  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.world.pause();
      this.showOverlay('暂停', 'P 继续    R 回标题');
    } else {
      this.physics.world.resume();
      this.overlay?.destroy();
      this.overlay = undefined;
    }
  }

  private fail(): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    this.physics.world.pause();
    this.showOverlay('败北', 'R 重开    Enter 回标题');
  }

  private win(): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    sfx.win();
    this.time.delayedCall(500, () => {
      this.physics.world.pause();
      this.showOverlay('城破  ·  一关通关', 'Enter 回标题');
    });
  }

  private showOverlay(title: string, hint: string): void {
    this.overlay?.destroy();
    const box = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setScrollFactor(0).setDepth(200);
    const bg = this.add.rectangle(0, 0, 520, 220, 0x140c08, 0.86).setStrokeStyle(3, 0xffcf7a);
    const headline = this.add
      .text(0, -40, title, {
        fontFamily: 'Georgia, "Songti SC", serif',
        fontSize: '40px',
        color: '#fff4d8'
      })
      .setOrigin(0.5);
    const sub = this.add
      .text(0, 36, hint, {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '18px',
        color: '#ffe7c2'
      })
      .setOrigin(0.5);
    box.add([bg, headline, sub]);
    this.overlay = box;
  }
}
