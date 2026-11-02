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
import { drawBackdrop } from '../ui/backdrop.js';
import { createButton } from '../ui/button.js';
import { attachFpsCounter } from '../ui/fps.js';

/**
 * Results screen. Shows the run score, the persisted best and one obvious
 * next action. Same actions on keyboard and pointer.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME_OVER);
  }

  init(data = {}) {
    this.finalScore = data.score ?? 0;
    this.best = data.best ?? (Number(this.registry.get('best')) || 0);
    this.isNewBest = Boolean(data.isNewBest);
    this.reason = data.reason ?? 'RUN COMPLETE';
    this.leaving = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    drawBackdrop(this);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panelSoft, 0.94).fillRoundedRect(200, 84, 560, 376, 16);
    panel.lineStyle(1, COLORS.stroke, 1).strokeRoundedRect(200, 84, 560, 376, 16);
    panel.fillStyle(COLORS.accent, 0.9).fillRoundedRect(200, 84, 560, 3, 2);

    this.add
      .text(GAME_WIDTH / 2, 116, 'RUN OVER', {
        fontFamily: FONT_UI,
        fontSize: '38px',
        fontStyle: 'bold',
        color: COLORS.text,
      })
      .setLetterSpacing(4)
      .setOrigin(0.5, 0)
      .setShadow(0, 0, '#38e8ff', 18, true, true);

    this.add
      .text(GAME_WIDTH / 2, 164, this.reason, {
        fontFamily: FONT_MONO,
        fontSize: '11px',
        fontStyle: 'bold',
        color: COLORS.accentText,
      })
      .setLetterSpacing(3)
      .setOrigin(0.5, 0)
      .setAlpha(0.85);

    this.add
      .text(GAME_WIDTH / 2, 198, 'FINAL SCORE', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.muted,
      })
      .setLetterSpacing(3)
      .setOrigin(0.5, 0);

    this.add
      .text(GAME_WIDTH / 2, 210, String(this.finalScore).padStart(4, '0'), {
        fontFamily: FONT_MONO,
        fontSize: '64px',
        fontStyle: 'bold',
        color: COLORS.text,
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 0, '#38e8ff', 22, true, true);

    const bestLabel = `BEST  ${String(this.best).padStart(4, '0')}`;

    this.add
      .text(this.isNewBest ? GAME_WIDTH / 2 - 56 : GAME_WIDTH / 2, 300, bestLabel, {
        fontFamily: FONT_MONO,
        fontSize: '13px',
        color: COLORS.muted,
      })
      .setOrigin(this.isNewBest ? 1 : 0.5, 0);

    if (this.isNewBest) {
      const badge = this.add.graphics();
      badge.fillStyle(COLORS.gold, 0.16).fillRoundedRect(GAME_WIDTH / 2 - 40, 294, 104, 24, 6);
      badge.lineStyle(1, COLORS.gold, 0.8).strokeRoundedRect(GAME_WIDTH / 2 - 40, 294, 104, 24, 6);

      this.add
        .text(GAME_WIDTH / 2 + 12, 299, 'NEW BEST', {
          fontFamily: FONT_UI,
          fontSize: '10px',
          fontStyle: 'bold',
          color: COLORS.goldText,
        })
        .setLetterSpacing(2)
        .setOrigin(0.5, 0);
    }

    createButton(this, {
      x: 372,
      y: 378,
      width: 230,
      height: 50,
      label: 'PLAY AGAIN',
      onClick: () => this.restartRun(),
      primary: true,
      fontSize: 15,
    });

    createButton(this, {
      x: 618,
      y: 378,
      width: 150,
      height: 50,
      label: 'MENU',
      onClick: () => this.goToMenu(),
      fontSize: 14,
    });

    this.add
      .text(GAME_WIDTH / 2, 420, 'ENTER / SPACE / R  PLAY AGAIN        ESC  MENU', {
        fontFamily: FONT_MONO,
        fontSize: '10px',
        color: COLORS.muted,
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.75);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 30,
        'PLACEHOLDER RESULT SCREEN - WIRE YOUR OWN WIN / LOSE CONDITIONS',
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

    this.input.keyboard.on('keydown-ENTER', this.restartRun, this);
    this.input.keyboard.on('keydown-SPACE', this.restartRun, this);
    this.input.keyboard.on('keydown-R', this.restartRun, this);
    this.input.keyboard.on('keydown-ESC', this.goToMenu, this);
    this.input.keyboard.on('keydown-M', this.goToMenu, this);

    this.cameras.main.fadeIn(200, 5, 7, 15);

    announce(
      `Run over. Final score ${this.finalScore}. Best ${this.best}. Press Enter to play again, or Escape for the menu.`
    );
  }

  restartRun() {
    if (this.leaving) {
      return;
    }

    this.leaving = true;
    announce('Starting a new run.');
    this.scene.start(SCENES.GAME);
  }

  goToMenu() {
    if (this.leaving) {
      return;
    }

    this.leaving = true;
    announce('Main menu.');
    this.scene.start(SCENES.MENU);
  }
}
