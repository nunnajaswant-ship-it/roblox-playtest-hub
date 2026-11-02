---
name: game-juice
description: Game feel and polish contract for a 1-day Phaser 4 web game. Use when adding hit feedback, screen shake, hit-stop, particles, camera punch, sound effects, menu transitions, or a game-over screen, and when deciding whether polish is done. Supplies a priority order for time pressure, numeric budgets that can be tested, accessibility rules, and an anti-juice list.
---

# Game Juice

Juice is not decoration. It is the evidence that the player's input did something.
Every effect below exists to answer one question: "did that register, and how hard?"

Judges score graphics and audio separately. Silence is a lost point, not neutral.

## 1. Priority order under time pressure

Build in this order. Stop when the clock stops; a finished lower tier beats a broken higher tier.

| Rank | Layer | Why it is here | If skipped |
| --- | --- | --- | --- |
| 1 | Input response | The game must feel alive before it feels pretty | Game reads as broken, not plain |
| 2 | Hit feedback | Confirms contact, sells weight | Player cannot tell if they hit |
| 3 | Audio | Cheapest large gain in perceived quality | Demo feels like a prototype |
| 4 | Particles | Reinforces impact at low cost | Impacts feel thin |
| 5 | Screen effects | Shake, zoom punch, flash. Global, high risk | Impacts feel small but still correct |
| 6 | Menus and transitions | Framing and seams | Rough edges, no lost function |

Do not touch tier 5 until tiers 1 to 4 pass. Screen effects are the most common cause of
nausea, motion sickness and "this looks buggy" feedback.

## 2. Numeric budgets

Adjectives are not acceptance criteria. These numbers are.

| Property | Budget | Hard cap |
| --- | --- | --- |
| Input to first visual response | 1 frame (16.7 ms at 60 fps) | 2 frames (33 ms) |
| Input buffer before the action is legal | 100 to 150 ms | 200 ms |
| Hit-stop (freeze on impact) | 40 to 80 ms | 120 ms |
| Hit-stop on a kill or boss hit | 90 ms | 150 ms |
| Screen shake amplitude | 2 to 8 px | 8 px |
| Screen shake duration | 80 to 200 ms | 200 ms |
| Shake retrigger guard | 100 ms minimum between shakes | none |
| Camera zoom punch | 4 to 7 percent | 8 percent |
| Zoom return duration | 80 to 150 ms, back to 1.0 | 200 ms |
| Hit flash alpha | 0.15 to 0.35 | 0.5 |
| Flash duration | 50 to 120 ms | 150 ms |
| Flash rate | 3 per second maximum | 3 per second |
| Squash and stretch on impact | 0.85 to 1.15 scale | 0.8 to 1.2 |
| Pop tween duration (UI, spawn) | 90 to 180 ms | 250 ms |
| Particle burst size | 8 to 24 per hit | 40 |
| Simultaneous particles on screen | 300 | 300 |
| Particle lifetime | 300 to 600 ms | 800 ms |
| State transition duration | 150 to 400 ms | 400 ms |
| Frame time during a busy scene | 16.7 ms | 20 ms |

Rules of thumb:

- Hit-stop is a pause, not a speed change. Scale `scene.time.timeScale` or freeze the
  physics step for the duration, then restore exactly. Never leave it below 1.0.
- Camera punch means zoom to about 1.05 and ease back to 1.0. Never zoom out below 1.0
  on impact; it reads as the camera being knocked away.
- Screen shake applies to the gameplay camera only. Never shake a UI or overlay camera;
  text that wobbles reads as a rendering bug.
- Shake and zoom never fire on the same frame from the same event unless the event is
  the single most important one in the game (death, final boss kill).

## 3. Audio rule

**Every player action gets a sound. Every state change gets a sound. If it changes, it
makes a noise.**

Minimum viable build, three sounds, ship these before anything else:

1. **Action** - the player's primary verb (shoot, jump, slice, dash). One short sample,
   attack under 20 ms, no tail longer than 150 ms.
2. **Hit** - contact confirmed. Distinct from action: brighter, shorter, higher pitch.
3. **Fail** - damage taken, life lost, run over. Lower pitch, longer decay, no comedy.

Then, in this order: pickup or reward, UI confirm, UI cancel, level or wave start,
score milestone.

Audio mechanics:

- Resume the audio context on the first pointer or key event. Browsers block autoplay;
  a silent first 3 seconds in the demo is a lost graphics-and-audio point.
- Randomise pitch by plus or minus 5 percent per shot and cap concurrent copies of the
  same sample at 4. Ten identical shots stacked is clipping, not juice.
- Master chain: per-sound gain, then a limiter, then master. Peak ceiling -3 dBFS.
  Nothing should ever hit 0 dBFS.
- Provide a mute toggle that persists and does not pause the game.
- The game must be fully playable and legible with sound off.

## 4. Accessibility

Not optional, and cheap if designed in.

- Honour `prefers-reduced-motion: reduce` at startup and on change. When set:
  screen shake off, camera zoom punch off, hit-stop reduced to 0 to 40 ms, particles
  capped at 20 simultaneous, no full-screen flashes above alpha 0.15.
- Reduced motion must not remove feedback. Substitute a static flash, a scale pop, or a
  hit marker so the player still knows the hit landed.
- Never encode state in colour alone. Pair every colour with shape, icon, position,
  outline, or text. Test in greyscale: if two states look identical, it fails.
- Text contrast at least 4.5:1 against its background. HUD text at least 14 px at 1080p.
- Flashing never exceeds 3 per second, and never occupies more than 25 percent of the
  screen. This is a photosensitivity limit, not a style preference.
- Keyboard-only path: every menu action reachable with Tab and Enter, visible focus ring,
  and the game startable without a mouse.
- Critical audio cues (incoming attack, low health) need a visual twin.

## 5. Menus and transitions

- No hard cuts. Every screen change takes 150 to 400 ms.
- Use one transition language: same direction, same ease, same duration band. Do not mix
  a slide, a fade, and a wipe in the same build.
- Lock input during a transition, then release on completion. Accept a skip input after
  100 ms so a fast player is never trapped.
- Cover the load, not the frame. Fade to the background colour, swap the scene, fade in.
  A visible one-frame flash of the wrong scene is the most common amateur tell.
- Menus are tier 6. A plain readable menu beats an animated unreadable one.

## 6. Game-over drama

The run ending is the emotional peak. Do not spend it on an instant modal.

1. **Beat.** 400 to 600 ms of nothing but the world settling: final hit, particles,
   music tail, camera pull. Input for gameplay is dead; do not accept a restart in this
   window.
2. **Cause.** One short line naming what killed the player. No blame, no joke at the
   player's expense.
3. **Score reveal.** Count the score up over 600 to 900 ms with one tick sound per
   meaningful step (every 10 points, not every point). Show best score next to it, and
   mark a new best explicitly with text, not just colour.
4. **Retry path.** One primary action, reachable by a single key or click, restarting in
   under 1 second. Secondary actions (menu, share) are visually quieter.
5. Never stack a second modal on the first. Never require reading a paragraph to retry.

## 7. Anti-juice list

These read as bugs. Do not ship them.

- Shake fired every frame or every bullet. Guard it to one shake per 100 ms.
- Shake above 8 px or longer than 200 ms. Players report it as a camera bug.
- Shaking the UI camera, or shaking while text is being read.
- Hit-stop above 120 ms, or hit-stop that never restores.
- Particles that cover the player sprite, the hit marker, or the HUD. Cap alpha and
  spawn on the impact side, not on top of the player.
- Particle count unbounded per frame. One boss death must not spawn 2000 sprites.
- Full-screen white flash, or more than 3 flashes per second.
- Camera zoom punch above 8 percent, or a zoom that never returns to 1.0.
- Audio clipping, or the same sample stacked more than 4 times.
- Sound that fires before the visual (feels disconnected) or 200 ms after it (feels laggy).
- Screen shake on menu open, on hover, or on score change.
- Damage numbers that jitter, overlap, or fly off screen.
- Slow motion on every kill. It stops being emphasis when it is constant.
- Colour-only state changes: red versus green bars with no icon or label.
- Linear easing on every tween. Use a short ease-out for arrivals, ease-in for exits.
- Unskippable intro animations longer than 1200 ms on retry.

## 8. Verify

Run the pass or fail table in `references/juice-checklist.md` before calling polish done.
Each row has a numeric budget and a browser check. Anything without a browser check is
an opinion, not a result.
