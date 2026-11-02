import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config.js';

/**
 * Shared backdrop for menu, game and game-over screens.
 * Generated with Graphics so there are no image dependencies.
 *
 * @param {Phaser.Scene} scene
 * @param {{ grid?: boolean, frame?: boolean }} [options]
 * @returns {Phaser.GameObjects.Graphics}
 */
export function drawBackdrop(scene, options = {}) {
  const { grid = true, frame = true } = options;
  const graphics = scene.add.graphics().setDepth(-100);

  graphics.fillStyle(COLORS.bg, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Soft colour pools keep a flat background from reading as a dead canvas.
  graphics.fillStyle(COLORS.accent, 0.05).fillCircle(GAME_WIDTH * 0.8, GAME_HEIGHT * 0.16, 300);
  graphics.fillStyle(COLORS.accent2, 0.05).fillCircle(GAME_WIDTH * 0.12, GAME_HEIGHT * 0.9, 280);

  if (grid) {
    graphics.lineStyle(1, 0x26375c, 0.22);
    for (let x = 0; x <= GAME_WIDTH; x += 48) {
      graphics.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 48) {
      graphics.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  if (frame) {
    graphics.lineStyle(2, COLORS.accent, 0.22);
    graphics.strokeRoundedRect(12, 12, GAME_WIDTH - 24, GAME_HEIGHT - 24, 18);
  }

  return graphics;
}
