---
name: game-design
description: Use before any gameplay code when starting a new game idea, when proposing any new feature, or when answering any scope question such as "should we add X" or "can we fit Y". Produces the one-page design contract, enforces exactly one core mechanic, and gates every feature through a 6-hour build budget for a 1-day competition build.
---

# Game Design - Squad Law

This file is a gate, not advice. A design decision that skips it is not a decision; it is scope creep with a commit message.

## 1. Exactly one core mechanic (hard rule)

Write the core mechanic in this exact form before prototyping:

```
[Verb] [object] to [goal].
```

- Exactly one verb, one object, one fail state.
- A second mechanic is allowed only if it is a variation of the first: same verb, same object, one changed parameter (speed, count, spacing, direction, or timing).
- Removal test: remove the second mechanic. If the game is still fun and merely easier, it is a variation and is allowed. If the game stops working, it is a second core mechanic and is banned.
- A build that fails the removal test is not reviewable. Fix it by cutting, not by documenting it as "advanced".

## 2. The one-page contract

Before gameplay code merges, `docs/design-contract.md` exists and contains all seven fields below. Copy `references/contract-template.md` to create it.

| Field | Required content | Fail condition |
| --- | --- | --- |
| Player fantasy | One sentence, present tense, states who the player is and what they get to do | Longer than one sentence, or names no player role |
| Core loop | `verb -> feedback -> reward`, one of each | Any stage has more than one entry |
| Win condition | One observable end state | Uses words like "survive" or "do well" with no number |
| Lose condition | One observable end state, with the timer or resource that triggers it | Death is the only lose state and no timer exists |
| Design pillars | Exactly 3, each one adjective plus one behavior it forces | 4 or more, or a pillar no mechanic implements |
| Non-goals | At least 4 explicit "we will not build" lines | Contains "maybe later" |
| Build budget | 6.0 hours, allocated per system, sums to 6.0 | Sum is not 6.0 or a system is missing |

Build budget default caps:

| System | Cap (hours) |
| --- | --- |
| Core mechanic plus player controller | 1.5 |
| Level content (5 sections) | 1.0 |
| Graphics and visual identity | 1.5 |
| Audio and feedback (SFX plus one music loop) | 1.0 |
| Menus, HUD, win and lose screens | 0.5 |
| Integration, build, and bug buffer | 0.5 |
| **Total** | **6.0** |

Budget rules:
- A system that hits its cap is cut, not extended.
- Borrowing hours is allowed only as a logged trade: subtract from one system and add the same amount to another in the same change log line.
- Anything not named in the budget table has a cap of 0.

## 3. Scope gate

Every proposed feature must answer, in one sentence:

> What does the player feel that they cannot feel now?

The answer must name a feeling and the moment it appears. Cut the feature if any of these is true:

1. No answer is written.
2. The answer is "more", "complete", "polished", "better", or "finished".
3. The answer needs the word "and" to stay one sentence.
4. The answer restates the core mechanic that already exists.
5. The answer names a feeling the current build already produces.
6. The cost exceeds the remaining hours in that system's cap.
7. It needs a system that is not in the contract.

Worked cuts:

| Proposal | Answer offered | Verdict |
| --- | --- | --- |
| Second playable character | "Players feel choice" | Cut. Same verb, same object, new sprite. Ship as a palette swap in 10 minutes. |
| Online leaderboard | "Players feel pride against strangers" | Cut. Needs a backend; the contract has no backend. Ship a local best score on the win screen instead. |
| Double jump | "Players feel freedom" | Cut. It deletes the level-reading tension the core loop depends on; freedom is not a new feeling, it is the absence of the one we sell. |
| Dialogue cutscene intro | "Players feel story" | Cut. 45 minutes for a feeling the game does not sell. Ship one title line plus the control hint. |
| Options menu with volume sliders and key remapping | "Players feel respected" | Cut. Respect is not scored. Ship a single mute key. |
| Three new enemy types | "Players feel variety" | Cut to one new enemy that changes exactly one variable. Variety without a new decision is a texture swap. |

A cut is recorded in the change log with the answer that failed. Do not re-propose a cut feature without a new answer and a new log line.

## 4. Append-only change log

The contract ends with a change log. Every design decision adds one line:

```
YYYY-MM-DD | decision made | reason | supersedes: none | D-00N
```

Rules:
- Append only. Never edit, reword, or delete a previous line.
- To reverse a decision, append a new line that names the line it supersedes.
- A feature is not approved until its log line exists.
- The contract body may be updated only in the same edit that adds the log line explaining why.

## 5. Reviewer self-check (target: under 2 minutes)

Answer each item PASS or FAIL. Any FAIL blocks the feature or the build.

1. The contract exists at `docs/design-contract.md` and all seven fields are filled.
2. The core mechanic is one sentence of the form `[Verb] [object] to [goal]`.
3. The removal test was run and only variations remain.
4. Every feature in the current build maps to a contract field or a pillar.
5. Every feature has a one-sentence scope gate answer in the change log.
6. The build budget table sums to 6.0 hours.
7. No system is over its cap, or the overage has a matching logged trade.
8. Non-goals list at least 4 lines and contains no "maybe later".
9. The change log is append-only: no line is edited or missing a date and reason.
10. Win and lose conditions each contain a number or an observable state.

## 6. Next artifact

Copy `references/contract-template.md` to `docs/design-contract.md`, fill every field, and commit it before the first gameplay commit.
