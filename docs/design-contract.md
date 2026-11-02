# Design Contract - Pixel Rush: Survey Corps

One page. If a feature is not on this page, it is not in the game.

## Player fantasy

You are the last scout on a map that is being deleted, and every hook you land buys
one more second of speed.

## Core mechanic

**Hook anchors to chain momentum and reach the next beacon.**

- One verb: **hook**.
- One object: **anchor**.
- One goal: **beacon**.
- One fail state: **the collapse catches you**.

Walking exists only to aim. It is deliberately slower than a hook chain, so the
hook is always the correct answer and the player learns it in three seconds.

## Allowed variation

**Charged hook.** Hold longer to reach a farther anchor, with a longer commitment.
Same verb, same object, one changed parameter (range). Removal test: remove it and
the game is easier but still works, so it is a variation, not a second mechanic.

Anything else is out. No combat, no shooting, no inventory, no second verb.

## Core loop

```
hook -> zip with speed lines and a rising tone -> beacon planted, collapse pushed back slightly
```

Every beacon plants in under 2 seconds of contact. The reward is time, not points.

## Win condition

Plant all 5 beacons before the collapse reaches the player.

## Lose condition

- The collapse wall touches the player, or
- the player takes 3 hazard hits.

## Design pillars

1. **Momentum** - speed is earned by chaining hooks, never given by a button.
2. **Readability** - every hazard is visible before it can hit, by at least 0.5s.
3. **Dread** - the collapse is always on screen and always closer than it was.

## Non-goals

- We will not build combat, enemies that shoot back, or a boss.
- We will not build a story, cutscenes, dialogue, or named characters.
- We will not build a shop, upgrades, currency, or an inventory.
- We will not build multiplayer, leaderboards, or accounts.
- We will not build 3D, sprite rigging, or imported art packs.
- We will not build a level editor.

## Build budget (6.0 hours)

| System | Cap (h) | Spent (h) | Status |
| --- | --- | --- | --- |
| Core hook mechanic plus player controller | 1.5 | 0.0 | planned |
| Level content (5 sections) | 1.0 | 0.0 | planned |
| Graphics and visual identity | 1.5 | 0.0 | planned |
| Audio and feedback (SFX plus one music loop) | 1.0 | 0.0 | planned |
| Menus, HUD, win and lose screens | 0.5 | 0.0 | planned |
| Integration, build, and bug buffer | 0.5 | 0.0 | planned |
| **Total** | **6.0** | **0.0** | |

## Scope gate log

| Feature | What the player feels that they cannot feel now | Decision |
| --- | --- | --- |
| Charged hook | The commitment of a long, risky line | keep - it is a variation |
| Beacon combo multiplier | Pride in a clean chain | cut - score is not the reward, time is |
| Screen-space collapse shader | True dread | keep as flat gradient plus noise, not a shader |
| Second playable scout | Choice | cut - palette swap only, and only if time remains |
| Online leaderboard | Pride against strangers | cut - no backend in contract |

## Change log (append only)

```
2026-11-02 | Concept fixed: Survey Corps hook traversal | Repo name and one-day budget | supersedes: none | D-001
2026-11-02 | Collapse is time pressure, not a score chase | Makes the fail state readable and the demo tense | supersedes: none | D-002
2026-11-02 | Charged hook kept as the only variation | Removal test passes | supersedes: none | D-003
```
