import Phaser from 'phaser';

/**
 * Static game configuration.
 *
 * Rule of thumb for this scaffold: anything that a designer might tune during
 * the 1-day build window lives here, not buried inside a scene.
 */

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** Length of one placeholder run, in milliseconds. */
export const RUN_DURATION_MS = 60_000;

/** Score awarded by the placeholder pickup objects in GameScene. */
export const SCORE_PER_PICKUP = 10;

/** Placeholder movement speed, in pixels per second. */
export const PLAYER_SPEED = 250;

/** How many placeholder pickups are active at once. */
export const PICKUP_COUNT = 5;

/** Delay before a collected placeholder pickup respawns, in milliseconds. */
export const PICKUP_RESPAWN_MS = 900;

export const SCENES = Object.freeze({
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  MENU: 'Menu',
  GAME: 'Game',
  PAUSE: 'Pause',
  GAME_OVER: 'GameOver',
});

export const COLORS = Object.freeze({
  bg: 0x05070f,
  bgAlt: 0x0b1224,
  panel: 0x111b33,
  panelSoft: 0x0c1528,
  stroke: 0x26375c,
  accent: 0x38e8ff,
  accent2: 0xff4d9d,
  gold: 0xffd166,
  danger: 0xff5c7a,
  text: '#e8f0ff',
  muted: '#8fa3c8',
  accentText: '#38e8ff',
  goldText: '#ffd166',
  dangerText: '#ff5c7a',
  ink: '#050912',
});

export const FONT_UI = '"Segoe UI", system-ui, -apple-system, sans-serif';
export const FONT_MONO = '"Consolas", "SFMono-Regular", ui-monospace, monospace';

/** Local-storage key for the best score. */
export const STORAGE_KEY = 'pixel-rush.best';

/** `?debug` turns on the dev FPS counter. Never read at gameplay runtime otherwise. */
export const IS_DEBUG = new URLSearchParams(window.location.search).has('debug');

/** Respect the OS motion preference for purely decorative animation. */
export const PREFERS_REDUCED_MOTION =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Build the Phaser 4 game config.
 * @param {Array<typeof Phaser.Scene>} scenes ordered front-to-back; the first one auto-starts.
 */
export function createGameConfig(scenes) {
  return {
    type: Phaser.AUTO,
    title: 'Pixel Rush',
    version: '0.1.0',
    backgroundColor: COLORS.bg,
    banner: true,
    disableContextMenu: true,
    scale: {
      parent: 'game-container',
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    render: {
      antialias: true,
      roundPixels: false,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    // No audio ships with the scaffold yet. Disabling the sound manager keeps
    // the console clean (no autoplay/AudioContext warnings) and avoids unused
    // work at boot. When you add sound: delete this block, add audio loads in
    // PreloadScene, and play via this.sound. See public/assets/README.md.
    audio: {
      noAudio: true,
    },
    input: {
      keyboard: true,
      mouse: true,
      touch: true,
      gamepad: false,
    },
    scene: scenes,
  };
}
