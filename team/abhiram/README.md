# Abhiram - Levels, Hazards, Difficulty

You own the challenge. The game is only as good as the five sections you build.

## Read first, in this order

1. `docs/design-contract.md` - what the game is. Do not add anything it does not name.
2. `docs/INTEGRATION.md` - the exact shape your data must have.
3. `docs/level-table.md` - the five sections and their targets.
4. `.opencode/skills/level-design/SKILL.md` - the rules you are judged against.

## Your folder

You own `team/abhiram/` and nothing else.

```
team/abhiram/
  levels/index.js      <- the level data the game imports
  README.md            <- this file
```

Never edit `src/`, `docs/`, `package.json`, or `team/abhitej/`. If you need a new
engine feature, say so in your PR description and Athena will add it.

## What to deliver

`team/abhiram/levels/index.js` exporting `LEVELS`, matching the contract exactly.

Your job is not to place objects randomly. Your job is to make the player learn:

| Section | You must teach | Then test it with |
| --- | --- | --- |
| S1 Breaking Ground | what an anchor is and what the hook does | two anchors, zero hazards, first beacon within one hook |
| S2 First Gap | that the collapse kills | a gap you can only cross by hooking |
| S3 Saw Line | that saws have a rhythm | one saw, generous timing window |
| S4 Drone Field | that vertical timing matters | a drone plus a short anchor |
| S5 The Long Chain | nothing new | all three, tighter spacing |

Rules that will fail your PR:

- Two new hazards in the same section.
- A hazard within 40px of an anchor.
- A beacon reachable by walking without a hook.
- A section that opens on a test instead of a teach.
- More than 45 seconds with nothing new.

## Your workflow

```sh
git checkout -b abhiram/levels
# edit team/abhiram/levels/index.js
npm run check:team        # must print PASS
git add team/abhiram
git commit -m "levels: add S3 saw line"
git push -u origin abhiram/levels
```

Then open a pull request into `main`. Do not merge it yourself.

## How to check your work visually

The game will not show your level until Athena integrates it. Until then:

- `npm run check:team` proves the data is valid, in bounds, and reachable.
- Keep a sketch of each section in your PR description: a rough ASCII map is
  enough. It is faster than words and it makes review instant.

## Done means

- `npm run check:team` prints PASS.
- All five sections are listed in `docs/level-table.md` with a time budget.
- Your PR description names the one new element per section.
