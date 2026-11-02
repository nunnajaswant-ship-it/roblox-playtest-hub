# Level Tuning Table - Pixel Rush: Survey Corps

One row per section. Fill before coding the section, then append measured values
after each playtest pass. Never delete a row; append with a date.

## Column definitions

| Column | Definition | Rule |
| --- | --- | --- |
| Section | Stable ID plus a short name. | `S1` to `S5`. Never renumber after a playtest. |
| Stage focus | Teach, Test, or Twist. | One value only. Never "teach and test". |
| New element introduced | The single hazard or rule the player meets here. | At most one per row. |
| Variable that changes | The one parameter that differs from the previous row. | Exactly one value. |
| Intended first-run fail rate | Percent of first-time players expected to fail here on attempt one. | Use the band below. |
| Measured fail rate | Percent observed in the last pass, with date. | Blank until measured. |
| Time budget (s) | Planned seconds from section entry to exit. | Must total 90 to 180. |
| Checkpoint at entry | Does the section start on a safe platform? | Must be `yes`. |

## Section table

| Section | Stage focus | New element introduced | Variable that changes | Intended first-run fail rate | Measured fail rate | Time budget (s) | Measured duration (s) | Checkpoint at entry |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 Breaking Ground | teach | the hook anchor, zero hazards | none | 0% |  | 20 |  | yes |
| S2 First Gap | test | the collapse wall becomes lethal | distance | 10-20% |  | 30 |  | yes |
| S3 Saw Line | teach | saw hazard | none | 25-40% |  | 30 |  | yes |
| S4 Drone Field | twist | drone hazard | vertical timing | 40-55% |  | 35 |  | yes |
| S5 The Long Chain | test | no new element, all three combined | anchor spacing | 55-70% |  | 35 |  | yes |

Total planned: 150s, inside the 90-180s target.

## Novelty timeline (45-second rule)

Add one line per novelty event with its recording timestamp, then diff consecutive
entries. Any diff above 45s is a dead spot.

| Event timestamp (s) | Event type | Diff from previous (s) |
| --- | --- | --- |
| 0 | new element: first anchor | 0 |
| 18 | new combination: hook over a gap | 18 |
| 48 | new element: saw | 30 |
| 78 | new combination: saw plus short anchor | 30 |
| 110 | new element: drone | 32 |
| 140 | parameter change: anchor spacing drops | 30 |

## Retry and checkpoints

- 3 hits per run. A hit costs 1 second of knockback, not a restart.
- Death restarts the current section, never the whole run.
- Control returns within 0.5s of a death.
- No death runs longer than 1.2s before control returns.

## Reviewer checklist

1. Every section has a safe entry platform.
2. No section opens on a Test.
3. No novelty gap exceeds 45 seconds.
4. Every hazard is visible 0.5s before it can hit.
5. No hazard sits within 40px of an anchor.
6. Each row has exactly one new element or one changed variable.
7. Total run length is 90 to 180 seconds.
8. A death never costs more than 60 seconds of progress.
