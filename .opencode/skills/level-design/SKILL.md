---
name: level-design
description: Use when laying out sections, waves, hazard pacing, checkpoints, lives, retry timing, or difficulty for any level in this repo, and when reviewing a playtest recording for unfair deaths or pacing dead spots. Enforces teach-test-twist order, the 45-second novelty rule, numeric fail-rate targets, and the 60-second progress-loss cap.
---

# Level Design - Squad Law

Every section is built in this order, measured against these numbers, and recorded in the tuning table before it is coded.

## 1. Teach -> Test -> Twist (mandatory order)

| Stage | Definition | Exit condition |
| --- | --- | --- |
| Teach | The new element appears in a zero-risk window. It is the only thing on screen that can hurt or help. No timer pressure. Failure is possible but never fatal. | The player performs the correct response twice in a row. |
| Test | The same element, now with the real fail state live. One clean repetition. | The player survives or dies once; either result is acceptable. |
| Twist | The same element with exactly one parameter changed (speed, count, spacing, direction, or timing). The learned response must be re-timed, not relearned. | The player clears it once or dies and retries within 60 s of progress loss. |

Failure mode of skipping teach: the player dies to a rule they were never shown. The death teaches "the game is unfair" instead of "I mistimed". It is measurable in a recording as any death where the player did not move before dying, or a first-run death rate above 40 percent inside the first 10 seconds of a section. Either finding fails the review.

A section may not begin with a Test. A Twist may not introduce a new element; it may only change a parameter of the element already taught.

## 2. The 45-second rule

From first input to win screen, no gap longer than 45 seconds may pass without one of these three events:

1. A new element appears.
2. Two known elements appear in a combination not seen before.
3. A known element changes one parameter value.

Check it by timestamps on the playtest recording: list each event time, diff consecutive entries. Any diff greater than 45 s is a dead spot and fails review.

## 3. Difficulty curve (numeric targets)

Target session length for the demo build: 90 to 180 seconds. Default plan: 5 sections, about 150 s total.

| Section | Intended first-run fail rate | Time budget (s) |
| --- | --- | --- |
| S1 Teach | 0 percent | 20 |
| S2 Test | 10 to 20 percent | 30 |
| S3 Twist | 25 to 40 percent | 30 |
| S4 Combine | 40 to 55 percent | 35 |
| S5 Finale | 55 to 70 percent | 35 |

Additional targets:
- Full-run completion on the first attempt: 20 to 40 percent across 5 or more first-time players.
- Full-run completion by the third attempt: 100 percent of testers.
- No single death may be caused by an off-screen hazard. Any such death is a bug, not difficulty.
- If measured first-run fail rate is more than 20 points above target, lower one variable. If more than 20 points below, raise one variable. Change one number per pass.

Recording a sample smaller than 5 players is allowed, but the result is labeled "unverified" in the tuning table.

## 4. Checkpoints, lives, and retry (1-day defaults)

- Maximum lost progress on any death: 60 seconds of play. Checkpoint spacing must be at or under 60 s by timer.
- Default lives: 3 per run.
- Retry delay: control returns within 0.5 s of death.
- Death animation: 1.2 s maximum, and it must be skippable by any input.
- On death: respawn at the last checkpoint with full resources and the combo or score restored to the checkpoint value.
- On losing all 3 lives: restart the current section, not the whole run.
- No unskippable cutscene, camera pan, or logo plays on death or retry.
- A checkpoint is required at the start of every section and after every Twist that the player clears.

Checkable: pause the recording at each death, read the timestamp of the previous checkpoint, subtract. Any value above 60 s fails.

## 5. One variable at a time

Between any two consecutive waves or sections, change exactly one thing:

- Add one new element, or
- Change one parameter of an existing element (speed, count, spacing, direction, timing).

Banned:
- Two new hazards in the same wave.
- A new hazard in the same wave as a new mechanic.
- A new element during a Twist stage.
- Changing two parameters between consecutive waves.

Checkable: for each row of the tuning table, count the new elements plus the changed variables. The count must be 1. Rows at 0 are dead spots and must justify the 45-second rule; rows at 2 or more fail.

## 6. Tuning table

Fill `references/level-table-template.md` at `docs/level-table.md` before coding a section. Required per row: section, new element introduced, intended fail rate, time budget, and the one variable that changes. Update the measured fail rate and measured duration after each playtest pass; never delete a row, append a new one with the date.

## 7. Reviewer checklist (run against a playtest recording)

Answer PASS or FAIL with a timestamp for each FAIL. Any FAIL blocks the section.

1. Every section contains Teach, then Test, then Twist, in that order.
2. Every Teach stage ends after two consecutive correct responses with no death.
3. No section opens on a Test.
4. No gap between novelty events exceeds 45 seconds.
5. Every death occurs more than 3 seconds after the hazard first became visible.
6. No death is caused by an off-screen or untelegraphed hazard.
7. Measured fail rate per section is within 20 points of its target, or the divergence is logged.
8. Total run length is between 90 and 180 seconds.
9. Every death costs 60 seconds of progress or less.
10. Retry returns control within 0.5 s and the death animation is 1.2 s or less.
11. Each tuning table row has exactly one new element or one changed variable.
12. Three lives are granted per run and losing them restarts the section, not the run.

## 8. Next artifact

Copy `references/level-table-template.md` to `docs/level-table.md` and fill one row per section before writing that section's code.
