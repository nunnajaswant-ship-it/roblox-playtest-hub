import { COLORS, FONT_UI } from '../config.js';

/**
 * Shared canvas button.
 *
 * Canvas buttons are not DOM controls, so every screen in this scaffold also
 * binds the same action to a keyboard shortcut. Keep that contract when adding
 * new UI: pointer users get a target, keyboard users get a key, and the two
 * call the same handler.
 *
 * @param {Phaser.Scene} scene
 * @param {{
 *   x: number,
 *   y: number,
 *   width?: number,
 *   height?: number,
 *   label: string,
 *   onClick: () => void,
 *   primary?: boolean,
 *   fontSize?: number,
 *   depth?: number,
 * }} options
 */
export function createButton(scene, options) {
  const {
    x,
    y,
    width = 260,
    height = 52,
    label,
    onClick,
    primary = false,
    fontSize = 15,
    depth = 30,
  } = options;

  const container = scene.add.container(x, y).setDepth(depth);
  const background = scene.add.graphics();
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT_UI,
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color: primary ? COLORS.ink : COLORS.text,
    })
    .setOrigin(0.5);
  text.setLetterSpacing(1);

  const hitArea = scene.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });

  container.add([background, text, hitArea]);

  let hovered = false;
  let pressed = false;

  const draw = () => {
    const left = -width / 2;
    const top = -height / 2;

    background.clear();

    if (primary) {
      const fillAlpha = pressed ? 1 : hovered ? 1 : 0.92;
      background.fillStyle(COLORS.accent, fillAlpha).fillRoundedRect(left, top, width, height, 10);
      background.lineStyle(1, 0xffffff, hovered ? 0.65 : 0.3);
      background.strokeRoundedRect(left, top, width, height, 10);
      text.setColor(COLORS.ink);
    } else {
      background.fillStyle(COLORS.panel, hovered ? 0.98 : 0.72).fillRoundedRect(left, top, width, height, 10);
      background.lineStyle(1.5, hovered ? COLORS.accent : COLORS.stroke, 1);
      background.strokeRoundedRect(left, top, width, height, 10);
      text.setColor(COLORS.text);
    }
  };

  hitArea.on('pointerover', () => {
    hovered = true;
    draw();
  });

  hitArea.on('pointerout', () => {
    hovered = false;
    pressed = false;
    draw();
  });

  hitArea.on('pointerdown', () => {
    pressed = true;
    draw();
  });

  hitArea.on('pointerup', () => {
    if (!pressed) {
      return;
    }
    pressed = false;
    draw();
    onClick();
  });

  draw();

  return {
    container,
    setLabel(nextLabel) {
      text.setText(nextLabel);
    },
    destroy() {
      container.destroy(true);
    },
  };
}
