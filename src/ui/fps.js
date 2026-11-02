import { FONT_MONO, GAME_HEIGHT, IS_DEBUG, COLORS } from '../config.js';

/**
 * Dev-only FPS readout. Enabled by loading the page with `?debug`.
 * It is attached per scene so it survives scene transitions without a
 * separate always-on UI scene.
 *
 * @param {Phaser.Scene} scene
 */
export function attachFpsCounter(scene) {
  if (!IS_DEBUG) {
    return;
  }

  const label = scene.add
    .text(24, GAME_HEIGHT - 14, 'FPS --', {
      fontFamily: FONT_MONO,
      fontSize: '11px',
      color: COLORS.accentText,
    })
    .setOrigin(0, 1)
    .setDepth(1000)
    .setAlpha(0.8);

  const refresh = () => {
    label.setText(`FPS ${Math.round(scene.game.loop.actualFps)}`);
  };

  scene.events.on('update', refresh);
  scene.events.once('shutdown', () => {
    scene.events.off('update', refresh);
  });
}
