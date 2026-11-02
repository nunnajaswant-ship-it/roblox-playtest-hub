import Phaser from 'phaser';
import { COLORS, FONT_MONO, FONT_UI, GAME_HEIGHT, GAME_WIDTH } from '../config.js';
import { createButton } from './button.js';

const PAD = 24;
const PANEL_W = 220;
const PANEL_H = 64;
const BAR_X = GAME_WIDTH - PAD - PANEL_W + 16;
const BAR_Y = 80;
const BAR_W = PANEL_W - 32;
const BAR_H = 3;

/**
 * In-game HUD: score, run timer, a touch-friendly pause button and a controls
 * hint. Lives inside GameScene so it is rendered (but not updated) while the
 * scene is paused, which keeps the pause overlay grounded in the run.
 */
export class Hud {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ onPause: () => void }} options
   */
  constructor(scene, { onPause }) {
    this.scene = scene;
    this.lastSecond = null;
    this.lastBarPct = -1;
    this.danger = false;

    const panels = scene.add.graphics().setDepth(10);
    this.drawPanels(panels);

    this.labelStyle = {
      fontFamily: FONT_UI,
      fontSize: '10px',
      fontStyle: 'bold',
      color: COLORS.muted,
    };

    this.valueStyle = {
      fontFamily: FONT_MONO,
      fontSize: '26px',
      fontStyle: 'bold',
      color: COLORS.text,
    };

    scene.add
      .text(PAD + 16, 30, 'SCORE', this.labelStyle)
      .setLetterSpacing(2)
      .setDepth(12);

    this.scoreValue = scene.add
      .text(PAD + 16, 44, '0000', this.valueStyle)
      .setDepth(12);

    scene.add
      .text(GAME_WIDTH - PAD - 16, 30, 'TIME', this.labelStyle)
      .setLetterSpacing(2)
      .setOrigin(1, 0)
      .setDepth(12);

    this.timeValue = scene.add
      .text(GAME_WIDTH - PAD - 16, 44, '1:00', this.valueStyle)
      .setOrigin(1, 0)
      .setDepth(12);

    scene.add
      .text(GAME_WIDTH / 2, 30, 'PLACEHOLDER RUN / 60 SECONDS', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.muted,
      })
      .setLetterSpacing(2)
      .setOrigin(0.5, 0)
      .setAlpha(0.75)
      .setDepth(12);

    this.bar = scene.add.graphics().setDepth(11);

    this.pauseButton = createButton(scene, {
      x: GAME_WIDTH - PAD - 52,
      y: GAME_HEIGHT - 40,
      width: 104,
      height: 30,
      label: 'PAUSE',
      onClick: onPause,
      fontSize: 10,
      depth: 25,
    });

    scene.add
      .text(PAD, GAME_HEIGHT - 46, 'MOVE  WASD / ARROWS / DRAG', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.muted,
      })
      .setLetterSpacing(1)
      .setAlpha(0.7)
      .setDepth(12);

    this.pauseRect = new Phaser.Geom.Rectangle(
      GAME_WIDTH - PAD - 104,
      GAME_HEIGHT - 55,
      104,
      30
    );

    this.setScore(0, false);
    this.setTime(60_000, 60_000);
  }

  /** @param {Phaser.GameObjects.Graphics} graphics */
  drawPanels(graphics) {
    const panels = [
      { x: PAD, y: 20 },
      { x: GAME_WIDTH - PAD - PANEL_W, y: 20 },
    ];

    for (const panel of panels) {
      graphics
        .fillStyle(COLORS.panelSoft, 0.88)
        .fillRoundedRect(panel.x, panel.y, PANEL_W, PANEL_H, 10);
      graphics
        .lineStyle(1, COLORS.stroke, 0.9)
        .strokeRoundedRect(panel.x, panel.y, PANEL_W, PANEL_H, 10);
      graphics.fillStyle(COLORS.accent, 0.9).fillRect(panel.x + 12, panel.y + 12, 2, PANEL_H - 24);
    }
  }

  /**
   * @param {number} value
   * @param {boolean} [animate]
   */
  setScore(value, animate = true) {
    this.scoreValue.setText(String(value).padStart(4, '0'));

    if (animate && !this.scene.scene.isPaused()) {
      this.scene.tweens.add({
        targets: this.scoreValue,
        scale: { from: 1.14, to: 1 },
        duration: 180,
        ease: 'Quad.easeOut',
      });
    }
  }

  /**
   * @param {number} remainingMs
   * @param {number} totalMs
   */
  setTime(remainingMs, totalMs) {
    const secondsLeft = Math.ceil(remainingMs / 1000);

    if (secondsLeft !== this.lastSecond) {
      this.lastSecond = secondsLeft;
      this.timeValue.setText(formatTime(secondsLeft));
    }

    const pct = Phaser.Math.Clamp(remainingMs / totalMs, 0, 1);

    if (Math.abs(pct - this.lastBarPct) > 0.004) {
      this.lastBarPct = pct;
      const color = pct <= 1 / 6 ? COLORS.danger : pct <= 1 / 3 ? COLORS.gold : COLORS.accent;

      this.bar.clear();
      this.bar.fillStyle(COLORS.stroke, 1).fillRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, 2);
      this.bar
        .fillStyle(color, 1)
        .fillRoundedRect(BAR_X, BAR_Y, Math.max(3, BAR_W * pct), BAR_H, 2);
    }

    const danger = remainingMs <= 10_000;

    if (danger !== this.danger) {
      this.danger = danger;
      this.timeValue.setColor(danger ? COLORS.dangerText : COLORS.text);

      if (danger) {
        this.scene.tweens.add({
          targets: this.timeValue,
          alpha: { from: 0.55, to: 1 },
          duration: 480,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      } else {
        this.scene.tweens.killTweensOf(this.timeValue);
        this.timeValue.setAlpha(1);
      }
    }
  }

  /**
   * True when a pointer is over the HUD. GameScene uses this to stop drag-to-move
   * from fighting with HUD buttons.
   * @param {Phaser.Input.Pointer} pointer
   */
  isPointerOverUi(pointer) {
    return pointer.y <= 96 || this.pauseRect.contains(pointer.x, pointer.y);
  }
}

/**
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
