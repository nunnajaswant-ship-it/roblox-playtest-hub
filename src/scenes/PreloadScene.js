import Phaser from 'phaser';
import {
  COLORS,
  FONT_MONO,
  FONT_UI,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
} from '../config.js';
import { TEX } from '../textures.js';

const BAR_WIDTH = 360;
const BAR_HEIGHT = 6;
const BAR_X = (GAME_WIDTH - BAR_WIDTH) / 2;
const BAR_Y = GAME_HEIGHT / 2 + 44;

/**
 * Asset loading scene.
 *
 * The scaffold ships zero binary assets, so nothing is queued today. The loader
 * bar and progress wiring are real: add `this.load.image(...)` / `audio(...)`
 * calls below and this scene will show actual progress and wait for the load
 * to finish before starting the menu.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.buildLoaderUi();

    this.load.on('progress', (value) => this.drawProgress(value));
    this.load.on('fileprogress', (file) => {
      this.statusText.setText(`LOADING  ${String(file.key).toUpperCase()}`);
    });

    // Add real assets here, for example:
    // this.load.image('tiles', 'assets/kenney/tiles.png');
    // this.load.audio('hit', 'assets/audio/hit.ogg');
  }

  create() {
    this.drawProgress(1);

    const textureCount = Object.keys(TEX).length;
    this.statusText.setText(`${textureCount} PROCEDURAL TEXTURES READY`);

    // A single short beat so the state change is legible rather than a flash.
    this.time.delayedCall(320, () => {
      this.scene.start(SCENES.MENU);
    });
  }

  buildLoaderUi() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 64, 'PIXEL RUSH', {
        fontFamily: FONT_UI,
        fontSize: '30px',
        fontStyle: 'bold',
        color: COLORS.text,
      })
      .setLetterSpacing(4)
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 26, 'PHASER 4 / VITE SCAFFOLD', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.accentText,
      })
      .setLetterSpacing(3)
      .setOrigin(0.5)
      .setAlpha(0.8);

    this.statusText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 72, 'PREPARING PLACEHOLDER ART', {
        fontFamily: FONT_MONO,
        fontSize: '11px',
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    this.bar = this.add.graphics();
    this.drawProgress(0);
  }

  /**
   * @param {number} value 0..1
   */
  drawProgress(value) {
    if (!this.bar) {
      return;
    }

    const clamped = Phaser.Math.Clamp(value, 0, 1);

    this.bar.clear();
    this.bar
      .fillStyle(COLORS.stroke, 1)
      .fillRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 3);
    this.bar
      .fillStyle(COLORS.accent, 1)
      .fillRoundedRect(BAR_X, BAR_Y, Math.max(6, BAR_WIDTH * clamped), BAR_HEIGHT, 3);
  }
}
