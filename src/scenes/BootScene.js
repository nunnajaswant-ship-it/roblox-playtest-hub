import Phaser from 'phaser';
import { SCENES, STORAGE_KEY } from '../config.js';
import { createPlaceholderTextures } from '../textures.js';

/**
 * First scene. No loading happens here: it only bakes procedural textures and
 * restores persisted state, then hands over to Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    createPlaceholderTextures(this);
    this.registry.set('best', readBestScore());
    this.scene.start(SCENES.PRELOAD);
  }
}

/**
 * @returns {number}
 */
function readBestScore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = Number.parseInt(raw ?? '0', 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    // Private browsing or blocked storage: a session-only best score is fine.
    return 0;
  }
}
