# Abhitej - Audio and Screen Effects

You own how the game feels. Judges score audio separately. Silence loses points.

## Read first, in this order

1. `docs/design-contract.md` - the pillars you are selling: momentum, readability, dread.
2. `docs/INTEGRATION.md` - the exact function names and limits.
3. `.opencode/skills/game-juice/SKILL.md` - every numeric budget you must respect.
4. `.opencode/skills/game-juice/references/juice-checklist.md` - the pass/fail table.

## Your folder

You own `team/abhitej/` and nothing else.

```
team/abhitej/
  audio/index.js       <- createAudioKit, procedural only
  fx/index.js          <- createFx, camera and particle effects
  README.md            <- this file
```

Never edit `src/`, `docs/`, `package.json`, or `team/abhiram/`.

## What to deliver

Two factories, exactly as named in `docs/INTEGRATION.md`:

- `createAudioKit(options)` - every sound is generated with oscillators and noise.
  No audio files. Nothing is created until `unlock()` is called from a user gesture.
- `createFx(scene, options)` - impact, shake, hit-stop, beacon burst, collapse pulse.
  Honours `reducedMotion`.

The seed implementations already work. Make them good:

| Sound | Character |
| --- | --- |
| `hookFire` | short, sharp, upward |
| `hookAttach` | a bite, low and tight |
| `beacon` | rising two-tone, the reward |
| `hurt` | low, ugly, no comedy |
| `collapseTick` | pitch and urgency rise with the level argument |
| `win` / `lose` | short musical phrases, 2s maximum |
| `startMusic` | a tense loop, quiet enough to sit under everything |

## Non-negotiable limits

- No `AudioContext` before `unlock()`. A context created at import time stays
  suspended and the whole game is silent on demo day.
- Peak at or below -3 dBFS. Use a compressor, not hope.
- Pitch variation of about 5 percent on repeated sounds.
- Shake 2 to 8px, 80 to 200ms, never more than once per 100ms, gameplay camera only.
- Hit-stop 40 to 80ms.
- At most 300 particles on screen. Your effects must destroy their own objects.

## Your workflow

```sh
git checkout -b abhitej/feel
# edit team/abhitej/audio/index.js and team/abhitej/fx/index.js
npm run check:team        # must print PASS
git add team/abhitej
git commit -m "feel: add beacon chime and hook attach"
git push -u origin abhitej/feel
```

Then open a pull request into `main`. Do not merge it yourself.

## How to hear your work

The game will not play your audio until Athena integrates it. Until then, make a
throwaway page outside your repo if you want to audition sounds, or just describe
the shape of each sound in your PR. Do not commit the scratch page.

## Done means

- `npm run check:team` prints PASS.
- Every method in the contract exists and is safe to call before `unlock()`.
- Your PR description lists each sound and the numeric budget it satisfies.
