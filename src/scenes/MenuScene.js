import Phaser from 'phaser';
import {
  COLORS,
  FONT_MONO,
  FONT_UI,
  GAME_HEIGHT,
  GAME_WIDTH,
  PREFERS_REDUCED_MOTION,
  SCENES,
} from '../config.js';
import { TEX } from '../textures.js';
import { announce } from '../ui/a11y.js';
import { drawBackdrop } from '../ui/backdrop.js';
import { createButton } from '../ui/button.js';
import { attachFpsCounter } from '../ui/fps.js';

/**
 * Title screen. Deliberately concept-agnostic: it presents the shell, the
 * controls contract and one primary action (start a run).
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    this.starting = false;

    this.cameras.main.setBackgroundColor(COLORS.bg);
    drawBackdrop(this);
    this.addDecorations();

    this.add
      .text(GAME_WIDTH / 2, 108, 'PHASER 4 / VITE 8 / ZERO ASSET SHELL', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: COLORS.accentText,
      })
      .setLetterSpacing(3)
      .setOrigin(0.5, 0)
      .setAlpha(0.85);

    this.add
      .text(GAME_WIDTH / 2, 136, 'PIXEL RUSH', {
        fontFamily: FONT_UI,
        fontSize: '76px',
        fontStyle: 'bold',
        color: COLORS.text,
      })
      .setLetterSpacing(6)
      .setOrigin(0.5, 0)
      .setShadow(0, 0, '#38e8ff', 26, true, true);

    this.add
      .text(
        GAME_WIDTH / 2,
        244,
        'A mechanic-neutral placeholder run. Move, collide, score, beat the clock.\nReplace the Game scene with your core loop - the shell stays.',
        {
          fontFamily: FONT_UI,
          fontSize: '14px',
          color: COLORS.muted,
          align: 'center',
          lineSpacing: 6,
          wordWrap: { width: 640 },
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .rectangle(GAME_WIDTH / 2, 314, 120, 2, COLORS.accent, 0.7)
      .setOrigin(0.5);

    createButton(this, {
      x: GAME_WIDTH / 2,
      y: 358,
      width: 280,
      height: 56,
      label: 'START RUN',
      onClick: () => this.startRun(),
      primary: true,
      fontSize: 17,
    });

    this.add
      .text(GAME_WIDTH / 2, 396, 'OR PRESS ENTER / SPACE', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.muted,
      })
      .setLetterSpacing(2)
      .setOrigin(0.5, 0)
      .setAlpha(0.8);

    this.add
      .text(
        GAME_WIDTH / 2,
        454,
        'MOVE  WASD / ARROWS / DRAG        PAUSE  ESC        RESTART  R',
        {
          fontFamily: FONT_MONO,
          fontSize: '11px',
          color: COLORS.muted,
        }
      )
      .setOrigin(0.5, 0)
      .setAlpha(0.75);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 30,
        'PLACEHOLDER BUILD - NOT A FINISHED CONCEPT',
        {
          fontFamily: FONT_UI,
          fontSize: '9px',
          fontStyle: 'bold',
          color: COLORS.muted,
        }
      )
      .setLetterSpacing(2)
      .setOrigin(0.5)
      .setAlpha(0.5);

    attachFpsCounter(this);

    this.input.keyboard.on('keydown-ENTER', this.startRun, this);
    this.input.keyboard.on('keydown-SPACE', this.startRun, this);
    this.input.on('pointerdown', this.startRun, this);

    this.cameras.main.fadeIn(220, 5, 7, 15);

    announce('Main menu. Press Enter or Space to start a sixty second run.');
  }

  addDecorations() {
    const spots = [
      { x: 104, y: 210 },
      { x: 858, y: 178 },
      { x: 156, y: 432 },
      { x: 812, y: 420 },
      { x: 72, y: 320 },
      { x: 890, y: 312 },
    ];

    spots.forEach((spot, index) => {
      const diamond = this.add
        .image(spot.x, spot.y, TEX.PICKUP)
        .setScale(1.2 + (index % 3) * 0.25)
        .setAlpha(0.16 + (index % 2) * 0.08);

      if (!PREFERS_REDUCED_MOTION) {
        this.tweens.add({
          targets: diamond,
          y: spot.y - 10,
          alpha: diamond.alpha + 0.08,
          duration: 2200 + index * 260,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: index * 120,
        });
      }
    });
  }

  startRun() {
    if (this.starting) {
      return;
    }

    this.starting = true;
    announce('Starting run.');
    this.cameras.main.fadeOut(180, 5, 7, 15);
    this.time.delayedCall(180, () => this.scene.start(SCENES.GAME));
  }
}
