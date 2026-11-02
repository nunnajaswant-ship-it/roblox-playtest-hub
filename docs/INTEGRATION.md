# Integration Contract

Read this before you write code. It is the interface between your folder and the
game. If your module matches this contract, integration is mechanical and takes
minutes. If it does not, your work cannot ship.

Run `npm run check:team` at any time. It validates both modules against this
document without needing the game to run.

## Rules that apply to both teammates

- Your module is plain ES modules. No build step, no bundler config, no TypeScript.
- No new npm dependencies. If you think you need one, ask first.
- No binary files. No `.png`, `.mp3`, `.wav`, `.ogg`. Everything is code.
- Never edit `src/`, `docs/`, `.opencode/`, `package.json`, or the other person's folder.
- Export functions and data only. Do not start timers, open an AudioContext, or
  touch the DOM at import time. The validator imports your module and the game
  imports it before the player clicks anything.
- Plain ASCII.

## Abhiram - `team/abhiram/levels/index.js`

```js
export const LEVEL_SCHEMA_VERSION = 1;
export const LEVELS = [ /* one or more level objects */ ];
```

A level object:

```js
{
  id: 'survey-01',        // kebab-case, unique
  name: 'Breaking Ground',
  timeLimitMs: 90000,     // 60000..180000
  world: { width: 1920, height: 540 },
  spawn: { x: 80, y: 270 },
  anchors: [{ id: 'a1', x: 320, y: 180, range: 260 }],
  beacons: [{ id: 'b1', x: 640, y: 270, order: 1 }],
  hazards: [{ id: 'h1', type: 'spike', x: 900, y: 470, w: 60, h: 70 }]
}
```

Field rules, all enforced by the validator:

| Rule | Value |
| --- | --- |
| `world.width` | 960 to 4000 |
| `world.height` | 540 (fixed) |
| `timeLimitMs` | 60000 to 180000 |
| `anchors` | at least 6, each `range` between 120 and 600 |
| `beacons` | exactly 5, `order` 1..5 with no gaps or duplicates |
| beacon spacing | at least 180px apart |
| first beacon | within 420px of `spawn` so one hook reaches it |
| `hazards` | `type` is `spike`, `saw`, or `drone` only |
| hazard placement | never within 40px of any anchor |
| all coordinates | inside `world`, with 20px margin |

Hazard types:

- `spike` - static rectangle, uses `w` and `h`.
- `saw` - moves horizontally, uses `w`, `h`, `speed`, `amplitude`. It travels from
  `x` to `x + amplitude` and back. `speed` is px per second, 40 to 300.
- `drone` - moves vertically, uses `w`, `h`, `speed`, `amplitude`. `speed` 30 to 200.

Design rules from `level-design` still apply and are checked by a human, not the
validator: teach before test, one new element per section, no two new hazards in
the same wave.

## Abhitej - `team/abhitej/audio/index.js` and `team/abhitej/fx/index.js`

### Audio

```js
export function createAudioKit(options = {}) {
  return {
    unlock(),              // call from a user gesture, safe to call repeatedly
    hookFire(),            // the hook leaves the hand
    hookAttach(),          // the line bites
    beacon(),              // a beacon is planted
    hurt(),                // a hazard hit lands
    collapseTick(level01), // level 0..1, called at most once per 250ms
    win(),
    lose(),
    uiConfirm(),
    uiCancel(),
    startMusic(),
    stopMusic(),
    setMuted(next),
    isMuted(),
    dispose()
  };
}
```

`options` may contain `volume` (0..1). Every method must be safe to call before
`unlock()`; it becomes a no-op rather than throwing.

Hard rules:

- Do not create an `AudioContext` until `unlock()` runs. Browsers block autoplay,
  and a context created at import time leaves the game silent forever.
- Peak output at or below -3 dBFS. Nothing may clip.
- Vary pitch by about 5 percent on repeated sounds so rapid hooks do not buzz.
- One-shot effects are 400ms or shorter, except `win` and `lose` which may run to
  2 seconds.
- Music is a short loop, generated with oscillators. No audio files.

### Effects

```js
export function createFx(scene, options = {}) {
  return {
    impact(x, y, { strength = 1 } = {}),
    shake(intensity = 1),      // 2..8px, 80..200ms, min 100ms between shakes
    hitStop(ms = 60),          // clamped to 40..80
    beaconBurst(x, y),
    collapsePulse(),
    dispose()
  };
}
```

Hard rules from `game-juice`:

- Shake the gameplay camera only. Never the HUD.
- Never shake more than once per 100ms.
- Cap simultaneous particles at 20 per call and 300 on screen.
- If `options.reducedMotion` is true, disable shake and halve particle counts, but
  keep a static flash so the player still sees the hit.
- Every effect must destroy its own game objects. No leaks during a 3 minute soak.

## How Athena integrates

1. Read your PR, run `npm run check:team`.
2. Import your module into the relevant scene behind a thin adapter in `src/`.
3. Run `playtest-review` in a real browser and record pass/fail with screenshots.
4. Merge to `main` only when the playtest gate is green.

Your module never imports from `src/`. That is deliberate: it means the game can
load, and the validator can run, even while the other side is half finished.
