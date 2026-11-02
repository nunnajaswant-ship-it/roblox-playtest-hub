import Phaser from 'phaser';
import './style.css';
import { createGameConfig, IS_DEBUG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { initA11y } from './ui/a11y.js';

/*
 * Scene order is render order. Only the first scene auto-starts.
 * Pause sits above Game so its overlay can receive the resume input while Game
 * is genuinely paused. GameOver sits last.
 */
const game = new Phaser.Game(
  createGameConfig([
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    PauseScene,
    GameOverScene,
  ])
);

game.events.once(Phaser.Core.Events.READY, () => {
  initA11y(game.canvas);
});

// Debug-only handle for playtests and automated QA. Absent in normal loads.
if (IS_DEBUG) {
  window.__PIXEL_RUSH__ = game;
}

// Vite HMR: replace the Phaser instance instead of stacking canvases.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}

export default game;
