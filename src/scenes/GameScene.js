import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PICKUP_COUNT,
  PICKUP_RESPAWN_MS,
  PLAYER_SPEED,
  RUN_DURATION_MS,
  SCENES,
  SCORE_PER_PICKUP,
  STORAGE_KEY,
} from '../config.js';
import { TEX } from '../textures.js';
import { announce } from '../ui/a11y.js';
import { drawBackdrop } from '../ui/backdrop.js';
import { attachFpsCounter } from '../ui/fps.js';
import { Hud } from '../ui/hud.js';

/**
 * PLACEHOLDER MECHANIC - not the game concept.
 *
 * This scene exists to prove the shell works end to end: input, physics,
 * collision, score events, a run clock, pause and transition to GameOver.
 * It is intentionally generic (move + touch pickups) so it can be deleted and
 * replaced without touching Boot, Preload, Menu, Pause or GameOver.
 *
 * Replace `createPlaceholderArena`, `updateMovement` and `collectPickup` with
 * your core loop. Keep the run clock, HUD and scene transitions.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  init() {
    this.score = 0;
    this.remainingMs = RUN_DURATION_MS;
    this.ended = false;
    this.isPaused = false;
    this.lastAnnouncedSecond = 60;

    this.pickupPoints = [
      { x: 480, y: 120 },
      { x: 480, y: 228 },
      { x: 240, y: 336 },
      { x: 720, y: 336 },
      { x: 152, y: 156 },
      { x: 808, y: 156 },
    ];
    this.usedPoints = new Set();
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.physics.world.setBounds(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);

    drawBackdrop(this);

    this.createPlayer();
    this.createArena();
    this.createPickups();

    this.hud = new Hud(this, { onPause: () => this.openPause() });

    this.bindInput();
    this.bindPauseLifecycle();

    attachFpsCounter(this);

    this.cameras.main.fadeIn(180, 5, 7, 15);
    announce('Run started. Sixty seconds. Move with arrow keys, W A S D, or drag.');
  }

  createPlayer() {
    this.player = this.physics.add
      .image(GAME_WIDTH / 2, 452, TEX.PLAYER)
      .setDepth(5)
      .setCollideWorldBounds(true);

    this.player.body.setSize(24, 24, true);
  }

  createArena() {
    this.blocks = this.physics.add.staticGroup();

    const layout = [
      { texture: TEX.BLOCK_WIDE, x: 480, y: 286 },
      { texture: TEX.BLOCK_MID, x: 240, y: 392 },
      { texture: TEX.BLOCK_MID, x: 720, y: 392 },
      { texture: TEX.BLOCK_SHORT, x: 152, y: 212 },
      { texture: TEX.BLOCK_SHORT, x: 808, y: 212 },
    ];

    for (const block of layout) {
      this.blocks.create(block.x, block.y, block.texture).setDepth(3);
    }

    this.physics.add.collider(this.player, this.blocks);
  }

  createPickups() {
    this.pickups = this.physics.add.staticGroup();

    for (let i = 0; i < PICKUP_COUNT; i += 1) {
      this.spawnPickup();
    }

    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);
  }

  spawnPickup() {
    const free = this.pickupPoints
      .map((_, index) => index)
      .filter((index) => !this.usedPoints.has(index));

    if (free.length === 0) {
      return;
    }

    const index = free[Math.floor(Math.random() * free.length)];
    const point = this.pickupPoints[index];
    this.usedPoints.add(index);

    const pickup = this.pickups
      .create(point.x, point.y, TEX.PICKUP)
      .setDepth(2)
      .setData('pointIndex', index)
      .setAlpha(0);

    this.tweens.add({
      targets: pickup,
      alpha: 1,
      duration: 180,
      ease: 'Quad.easeOut',
    });

    this.tweens.add({
      targets: pickup,
      angle: 360,
      duration: 3600,
      repeat: -1,
      ease: 'Linear',
    });
  }

  bindInput() {
    this.keys = this.input.keyboard.addKeys(
      {
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        esc: Phaser.Input.Keyboard.KeyCodes.ESC,
        r: Phaser.Input.Keyboard.KeyCodes.R,
      },
      true
    );
  }

  bindPauseLifecycle() {
    this.handleResume = () => {
      this.isPaused = false;
      announce('Resumed.');
    };

    this.events.on(Phaser.Scenes.Events.RESUME, this.handleResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.handleResume, this);
    });
  }

  update(time, delta) {
    if (this.ended || this.isPaused) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.openPause();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.r)) {
      announce('Run restarted.');
      this.scene.restart();
      return;
    }

    this.updateMovement();
    this.updateClock(delta);
  }

  updateMovement() {
    let x = 0;
    let y = 0;

    if (this.keys.left.isDown || this.keys.a.isDown) {
      x -= 1;
    }
    if (this.keys.right.isDown || this.keys.d.isDown) {
      x += 1;
    }
    if (this.keys.up.isDown || this.keys.w.isDown) {
      y -= 1;
    }
    if (this.keys.down.isDown || this.keys.s.isDown) {
      y += 1;
    }

    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    // Pointer/touch fallback: hold and drag to steer toward the pointer.
    const pointer = this.input.activePointer;

    if (x === 0 && y === 0 && pointer.isDown && !this.hud.isPointerOverUi(pointer)) {
      const dx = pointer.worldX - this.player.x;
      const dy = pointer.worldY - this.player.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 8) {
        x = dx / distance;
        y = dy / distance;
      }
    }

    this.player.setVelocity(x * PLAYER_SPEED, y * PLAYER_SPEED);
  }

  updateClock(delta) {
    this.remainingMs = Math.max(0, this.remainingMs - delta);
    this.hud.setTime(this.remainingMs, RUN_DURATION_MS);

    const secondsLeft = Math.ceil(this.remainingMs / 1000);

    // One announcement at each 10 second boundary, not every frame.
    if (secondsLeft !== this.lastAnnouncedSecond && secondsLeft % 10 === 0 && secondsLeft > 0) {
      this.lastAnnouncedSecond = secondsLeft;
      announce(`${secondsLeft} seconds left.`);
    }

    if (this.remainingMs <= 0) {
      this.endRun('TIME UP');
    }
  }

  /**
   * Placeholder scoring hook. Replace with your own scoring events.
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody} _player
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody} pickup
   */
  collectPickup(_player, pickup) {
    if (this.ended) {
      return;
    }

    const index = pickup.getData('pointIndex');

    if (typeof index === 'number') {
      this.usedPoints.delete(index);
    }

    this.score += SCORE_PER_PICKUP;
    this.hud.setScore(this.score);
    announce(`Score ${this.score}.`);
    this.spawnBurst(pickup.x, pickup.y);

    this.tweens.killTweensOf(pickup);
    pickup.destroy();

    this.time.delayedCall(PICKUP_RESPAWN_MS, () => {
      if (!this.ended) {
        this.spawnPickup();
      }
    });
  }

  spawnBurst(x, y) {
    const ring = this.add
      .circle(x, y, 9, 0xffffff, 0)
      .setStrokeStyle(2, COLORS.gold, 1)
      .setDepth(4);

    this.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  openPause() {
    if (this.ended || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.player.setVelocity(0, 0);
    announce('Paused. Press Escape to resume.');

    this.scene.launch(SCENES.PAUSE, {
      score: this.score,
      remainingMs: this.remainingMs,
    });
    this.scene.pause();
  }

  /**
   * @param {string} reason
   */
  endRun(reason) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();
    this.tweens.killTweensOf(this.hud.timeValue);

    const previousBest = Number(this.registry.get('best')) || 0;
    const best = Math.max(previousBest, this.score);
    const isNewBest = this.score > previousBest;

    this.registry.set('best', best);
    persistBestScore(best);

    announce(`Run over. Final score ${this.score}.`);
    this.cameras.main.fadeOut(220, 5, 7, 15);

    this.time.delayedCall(220, () => {
      this.scene.start(SCENES.GAME_OVER, {
        score: this.score,
        best,
        isNewBest,
        reason,
      });
    });
  }
}

/**
 * @param {number} score
 */
function persistBestScore(score) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // Storage can be unavailable; the run still completes.
  }
}
