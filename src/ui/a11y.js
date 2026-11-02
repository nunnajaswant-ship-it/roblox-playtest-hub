/**
 * Minimal DOM accessibility bridge for a canvas game.
 *
 * A canvas is opaque to assistive technology, so we expose:
 * - a labelled, focusable canvas element;
 * - permanently available controls text (aria-describedby);
 * - a polite live region for score, timer milestones, pause and game over.
 *
 * Do not announce every frame: announce state changes only.
 */

let liveRegion = null;

/**
 * @param {HTMLCanvasElement} canvas
 */
export function initA11y(canvas) {
  liveRegion = document.getElementById('a11y-status');

  if (!canvas) {
    return;
  }

  canvas.setAttribute('role', 'application');
  canvas.setAttribute(
    'aria-label',
    'Pixel Rush. A placeholder arcade game. Press Enter or Space to start. Move with arrow keys, W A S D, or drag. Press Escape to pause.'
  );
  canvas.setAttribute('aria-describedby', 'game-instructions');

  if (!canvas.hasAttribute('tabindex')) {
    canvas.setAttribute('tabindex', '0');
  }

  canvas.addEventListener('pointerdown', () => {
    canvas.focus({ preventScroll: true });
  });
}

/**
 * Announce a short status message to screen readers.
 * @param {string} message
 */
export function announce(message) {
  if (!liveRegion) {
    liveRegion = document.getElementById('a11y-status');
  }

  if (liveRegion) {
    liveRegion.textContent = message;
  }
}
