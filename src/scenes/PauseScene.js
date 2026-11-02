import Phaser from 'phaser';
import {
  COLORS,
  FONT_MONO,
  FONT_UI,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
} from '../config.js';
import { announce } from '../ui/a11y.js';
import { createButton } from '../ui/button.js';

/**
 * Pause overlay as its own scene.
 *
 * Why a separate scene: `GameScene` is genuinely paused with
 * `this.scene.pause()`, which stops its update loop, physics and input. A
 * paused scene cannot handle the key press that would resume it, so the resume
 * UI must live in an active scene on top. Scene order in `main.js` puts this
 * scene above Game.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PAUSE);
  }

  init(data = {}) {
    this.runScore = data.score ?? 0;
    this.remainingMs = data.remainingMs ?? 0;
    this.closing = false;
  }

  create() {
    // Blocks pointer input from reaching the paused scene.
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03050c, 0.84)
      .setOrigin(0)
      .setInteractive();

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.35).fillRoundedRect(254, 109, 460, 330, 18);
    panel.fillStyle(COLORS.panelSoft, 0.98).fillRoundedRect(250, 105, 460, 330, 18);
    panel.lineStyle(1, COLORS.stroke, 1).strokeRoundedRect(250, 105, 460, 330, 18);
    panel.fillStyle(COLORS.accent, 0.9).fillRoundedRect(250, 105, 460, 3, 2);

    this.add
      .text(GAME_WIDTH / 2, 140, 'PAUSED', {
        fontFamily: FONT_UI,
        fontSize: '38px',
        fontStyle: 'bold',
        color: COLORS.text,
      })
      .setLetterSpacing(5)
      .setOrigin(0.5, 0)
      .setShadow(0, 0, '#38e8ff', 18, true, true);

    this.add
      .text(GAME_WIDTH / 2, 186, 'RUN CLOCK STOPPED', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.accentText,
      })
      .setLetterSpacing(2)
      .setOrigin(0.5, 0)
      .setAlpha(0.8);

    this.add
      .text(
        GAME_WIDTH / 2,
        214,
        `SCORE  ${String(this.runScore).padStart(4, '0')}        TIME  ${formatTime(this.remainingMs)}`,
        {
          fontFamily: FONT_MONO,
          fontSize: '13px',
          color: COLORS.muted,
        }
      )
      .setOrigin(0.5, 0);

    createButton(this, {
      x: GAME_WIDTH / 2,
      y: 274,
      width: 320,
      height: 46,
      label: 'RESUME',
      onClick: () => this.resumeRun(),
      primary: true,
      fontSize: 15,
    });

    createButton(this, {
      x: GAME_WIDTH / 2,
      y: 332,
      width: 320,
      height: 40,
      label: 'RESTART RUN',
      onClick: () => this.restartRun(),
      fontSize: 12,
    });

    createButton(this, {
      x: GAME_WIDTH / 2,
      y: 382,
      width: 320,
      height: 40,
      label: 'QUIT TO MENU',
      onClick: () => this.quitToMenu(),
      fontSize: 12,
    });

    this.add
      .text(GAME_WIDTH / 2, 412, 'ESC  RESUME        R  RESTART        M  MENU', {
        fontFamily: FONT_MONO,
        fontSize: '9px',
        color: COLORS.muted,
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.85);

    this.input.keyboard.on('keydown-ESC', this.resumeRun, this);
    this.input.keyboard.on('keydown-SPACE', this.resumeRun, this);
    this.input.keyboard.on('keydown-ENTER', this.resumeRun, this);
    this.input.keyboard.on('keydown-R', this.restartRun, this);
    this.input.keyboard.on('keydown-M', this.quitToMenu, this);

    announce(`Paused. Score ${this.runScore}. Press Escape to resume.`);
  }

  resumeRun() {
    if (this.closing) {
      return;
    }

    this.closing = true;
    announce('Resumed.');
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }

  restartRun() {
    if (this.closing) {
      return;
    }

    this.closing = true;
    announce('Run restarted.');
    this.scene.start(SCENES.GAME);
  }

  quitToMenu() {
    if (this.closing) {
      return;
    }

    this.closing = true;
    announce('Main menu.');
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MENU);
  }
}

/**
 * @param {number} remainingMs
 * @returns {string}
 */
function formatTime(remainingMs) {
  const seconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
