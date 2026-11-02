import { COLORS } from './config.js';

/**
 * Every visual in this scaffold is generated at runtime, so the repo stays free
 * of binary assets and the placeholder is trivially replaceable.
 *
 * To use real art later: drop files in `public/assets/`, load them in
 * `PreloadScene.preload()`, and swap the texture keys below for your own. Keep
 * this module only for genuinely procedural art (bars, debug blocks, FX).
 */

export const TEX = Object.freeze({
  PIXEL: 'px',
  PLAYER: 'player',
  BLOCK_WIDE: 'block-wide',
  BLOCK_MID: 'block-mid',
  BLOCK_SHORT: 'block-short',
  PICKUP: 'pickup',
});

const PLAYER_SIZE = 28;
const BLOCK_HEIGHT = 28;
const PICKUP_SIZE = 18;

/**
 * Create all placeholder textures once per game boot.
 * Safe to call again: existing keys are left untouched.
 * @param {Phaser.Scene} scene
 */
export function createPlaceholderTextures(scene) {
  makeTexture(scene, TEX.PIXEL, 1, 1, (g) => {
    g.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1);
  });

  makeTexture(scene, TEX.PLAYER, PLAYER_SIZE, PLAYER_SIZE, (g) => {
    // Outer halo, bright body, dark core, white centre pip.
    g.fillStyle(COLORS.accent, 0.16).fillRoundedRect(0, 0, 28, 28, 9);
    g.fillStyle(COLORS.accent, 1).fillRoundedRect(2, 2, 24, 24, 8);
    g.fillStyle(COLORS.bg, 1).fillRoundedRect(6, 6, 16, 16, 5);
    g.fillStyle(0xe8f0ff, 1).fillRoundedRect(11, 11, 6, 6, 2);
  });

  makeTexture(scene, TEX.BLOCK_WIDE, 240, BLOCK_HEIGHT, drawBlock(240));
  makeTexture(scene, TEX.BLOCK_MID, 200, BLOCK_HEIGHT, drawBlock(200));
  makeTexture(scene, TEX.BLOCK_SHORT, 160, BLOCK_HEIGHT, drawBlock(160));

  makeTexture(scene, TEX.PICKUP, PICKUP_SIZE, PICKUP_SIZE, (g) => {
    g.fillStyle(COLORS.gold, 0.18).fillCircle(9, 9, 9);
    g.fillStyle(COLORS.gold, 1).fillTriangle(9, 1, 17, 9, 1, 9);
    g.fillStyle(COLORS.gold, 1).fillTriangle(1, 9, 17, 9, 9, 17);
    g.fillStyle(0xfff2c2, 1).fillTriangle(9, 1, 13, 9, 9, 9);
  });
}

/**
 * @param {number} width
 * @returns {(g: Phaser.GameObjects.Graphics) => void}
 */
function drawBlock(width) {
  return (g) => {
    g.fillStyle(COLORS.stroke, 1).fillRoundedRect(0, 0, width, BLOCK_HEIGHT, 7);
    g.fillStyle(0x1c2946, 1).fillRoundedRect(2, 2, width - 4, BLOCK_HEIGHT - 4, 6);
    g.fillStyle(0x101a30, 1).fillRoundedRect(3, 5, width - 6, BLOCK_HEIGHT - 10, 4);
    g.fillStyle(0x3d5a91, 0.9).fillRect(10, 8, width - 20, 2);
    g.fillStyle(COLORS.accent, 0.28).fillRect(10, 19, width - 20, 2);
  };
}

/**
 * Bake a Graphics drawing into a texture.
 * @param {Phaser.Scene} scene
 * @param {string} key
 * @param {number} width
 * @param {number} height
 * @param {(g: Phaser.GameObjects.Graphics) => void} draw
 */
function makeTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}
