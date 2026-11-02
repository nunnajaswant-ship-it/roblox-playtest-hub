# Design Contract - <game name>

Copy this file to `docs/design-contract.md` and replace every `<...>`.
One line per field. If a field needs two lines, the design is not decided yet.

## Player fantasy

<One sentence, present tense, who the player is and what they get to do.>

Example: `You are a courier skating a collapsing neon highway, and every dodge buys one more second of speed.`

## Core mechanic

<[Verb] [object] to [goal]. One verb, one object, one fail state.>

Example: `Dash through gaps to keep the combo multiplier alive.`

## Allowed variation

<The one permitted second mechanic: same verb, same object, one changed parameter, plus the removal-test result.>

Example: `Hold dash to cross two gaps; removing it makes the game easier, not broken.`

## Core loop

<verb -> feedback -> reward>

Example: `Dash -> screen shake plus pitch-rising chime -> combo count and speed line grow.`

## Win condition

<One observable end state with a number.>

Example: `Reach 1000 m before the 120 s timer ends.`

## Lose condition

<One observable end state with the timer or resource that triggers it.>

Example: `Combo hits zero, or the 120 s timer ends below 1000 m.`

## Design pillars

<Exactly 3: one adjective plus the behavior it forces.>

Example: `Fast - every input resolves within 100 ms with visible motion.`

## Non-goals

<At least 4 explicit "we will not build" lines. No "maybe later".>

Example: `We will not build a shop, a save system, a tutorial level, or online play.`

## Build budget (6.0 hours)

<Allocate per system. The column must sum to 6.0.>

| System | Cap (h) | Spent (h) | Status |
| --- | --- | --- | --- |
| Core mechanic plus player controller | 1.5 | <0.0> | <planned> |
| Level content (5 sections) | 1.0 | <0.0> | <planned> |
| Graphics and visual identity | 1.5 | <0.0> | <planned> |
| Audio and feedback (SFX plus one music loop) | 1.0 | <0.0> | <planned> |
| Menus, HUD, win and lose screens | 0.5 | <0.0> | <planned> |
| Integration, build, and bug buffer | 0.5 | <0.0> | <planned> |
| **Total** | **6.0** | **<0.0>** | |

## Scope gate log

<One row per proposal. The answer is one sentence naming a feeling and the moment it appears.>

| Feature | What the player feels that they cannot feel now | Decision |
| --- | --- | --- |
| <Dash trail particles> | <The thrill of speed at the exact frame of a near miss> | <keep> |

## Change log (append only)

<Add one line per decision. Never edit or delete an existing line.>

```
YYYY-MM-DD | <decision> | <reason> | supersedes: none | D-001
YYYY-MM-DD | <decision> | <reason> | supersedes: D-001 | D-002
```

Example: `2026-11-02 | Cut online leaderboard | No backend in contract; local best score instead | supersedes: none | D-003`
