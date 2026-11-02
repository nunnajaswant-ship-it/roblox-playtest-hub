# Pixel Rush: Survey Corps

A one-day competition build. Phaser 4.2.1 + Vite 8, plain JavaScript, no backend.

You are a scout on ground that is collapsing. Plant your survey beacons before the
dark takes the map, and before your luck runs out.

## Play

```sh
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # emits dist/
npm run preview    # serves dist/ on http://127.0.0.1:4173
```

## The loop

Hook an anchor, get yanked toward it, keep the momentum, plant the next beacon.

- **Move** - WASD or arrow keys. Deliberately slow. Walking is not how you survive.
- **Hook** - hold Space (or click/tap) to fire at the nearest anchor in front of you.
  Release to let go with your speed intact.
- **Beacon** - touch it to plant it. Five to win.
- **Collapse** - a wall of static eats the map from the left. It never stops.
- **Lose** - the collapse reaches you, or you take three hits.

## Repo layout

```
src/                 engine, scenes, HUD, integration - owned by Athena
  scenes/            Boot, Preload, Menu, Game, Pause, GameOver
  ui/                HUD, buttons, FPS, accessibility helpers
  config.js          every tunable number lives here
team/abhiram/        levels, hazards, difficulty - owned by Abhiram
team/abhitej/        audio and screen effects - owned by Abhitej
docs/                design contract, level table, integration contract
.opencode/skills/    squad law, six skills, read before you build
scripts/             validators you can run without the game
```

## Who owns what

| Person | Folder | Owns |
| --- | --- | --- |
| Athena | `src/`, `docs/`, `.opencode/` | core loop, scenes, integration, deploy |
| Abhiram | `team/abhiram/` | level data, hazard patterns, difficulty curve |
| Abhitej | `team/abhitej/` | sound effects, music, screen effects |

Nobody edits another owner's folder. If you need a change in `src/`, open an issue
or say it in the PR description and Athena makes it.

## Rules

1. Read `docs/design-contract.md` before adding anything. If it is not in the
   contract, it is scope creep and it gets cut.
2. Run `npm run check:team` before every push. It validates your modules against
   the integration contract. A red check is a broken build for everyone.
3. Plain ASCII only. Hyphens, not em dashes.
4. One branch per person. Never push directly to `main`.
5. No binary assets. Audio is procedural, art is drawn in code. Keeps the repo
   small and the load instant.

## Branches

- `main` - always builds and always runs. Athena merges.
- `abhiram/levels` - Abhiram's work.
- `abhitej/feel` - Abhitej's work.

Push your branch, open a pull request, and Athena integrates it. Do not merge it
yourself.

## Where the plan lives

- `docs/design-contract.md` - what the game is, and what it is not.
- `docs/INTEGRATION.md` - the exact module contracts. Read this before coding.
- `docs/level-table.md` - the five sections, their fail rates and pacing.
- `.opencode/skills/` - the six skills. They are law, not advice.
