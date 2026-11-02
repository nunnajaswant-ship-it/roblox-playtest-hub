# Assets drop zone

This directory is intentionally empty of binaries. The scaffold generates all
placeholder art at runtime, so the repository stays cloneable with zero asset
setup.

## Where packs go

Create one directory per pack, keeping the pack's own folder structure:

```text
public/assets/
  kenney/
    platformer-art/
      Player/player.png
      Tiles/grass.png
    ui-pack/
      blue_button.png
  audio/
    hit.ogg
```

Everything under `public/` is copied verbatim to `dist/` by `npm run build`.

## Recommended CC0 packs

- Kenney - https://kenney.nl/assets - all packs are CC0. Good starting points:
  Platformer Art, UI Pack, Particle Pack, Impact Sounds.
- OpenGameArt CC0 collections - check the licence on every individual file.

CC0 does not require attribution, but a short credit line in the game menu or
README is good practice.

## Loading example

Add loads to `src/scenes/PreloadScene.js` (`preload()` already wires loader
progress to the bar):

```js
const base = import.meta.env.BASE_URL;

this.load.image('tiles', `${base}assets/kenney/platformer-art/Tiles/grass.png`);
this.load.spritesheet('player', `${base}assets/kenney/platformer-art/Player/player.png`, {
  frameWidth: 24,
  frameHeight: 24,
});
this.load.audio('hit', `${base}assets/audio/hit.ogg`);
```

Then swap the placeholder texture keys in `src/textures.js` / `GameScene.js` for
the loaded keys. Keep `src/textures.js` for genuinely procedural art only.

The scaffold disables the sound manager (`audio: { noAudio: true }` in
`src/config.js`) while no audio assets exist. Delete that block before loading
audio, or `this.sound.play()` will be a no-op.

## Rules

- No binaries committed until the concept is chosen and the licence is recorded.
- Prefer a single atlas or spritesheet over many loose images.
- Keep audio short (one-shots under 1 second) for a 60 second run.
- Do not add a build step that requires a paid tool or a global install.
