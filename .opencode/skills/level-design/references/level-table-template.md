# Level Tuning Table - <game name>

Copy this file to `docs/level-table.md`. One row per section. Fill the row before coding the section, then append measured values after each playtest pass.

## Column definitions

| Column | Definition | Rule |
| --- | --- | --- |
| Section | Stable ID plus a short name. | `S1` to `S5` for the demo build. Never renumber after a playtest. |
| Stage focus | Which part of Teach, Test, or Twist the section is centered on. | One value only. Never "teach and test". |
| New element introduced | The single hazard, tool, or rule the player meets here. Write `none` if the section only reuses known elements. | At most one per row. Blank is a fail. |
| Variable that changes | The one parameter that differs from the previous row: speed, count, spacing, direction, or timing. Write `none` only for S1. | Exactly one value. Two values is a fail. |
| Intended first-run fail rate | Percent of first-time players expected to fail this section on attempt one. | Use the band from the level-design difficulty table. |
| Measured fail rate | Percent observed in the last playtest pass. | Append the date. Leave blank until measured. |
| Time budget (s) | Planned seconds from section entry to section exit. | Sum of all rows must land between 90 and 180 s. |
| Measured duration (s) | Observed seconds in the last playtest pass. | Append the date. |
| Checkpoint at entry | Whether a checkpoint exists at the section start. | Must be `yes` for every section. |

## Section table

| Section | Stage focus | New element introduced | Variable that changes | Intended first-run fail rate | Measured fail rate | Time budget (s) | Measured duration (s) | Checkpoint at entry |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 <name> | <teach> | <element> | <none> | <0%> | <blank> | <20> | <blank> | <yes> |
| S2 <name> | <test> | <none> | <speed> | <10-20%> | <blank> | <30> | <blank> | <yes> |
| S3 <name> | <twist> | <none> | <spacing> | <25-40%> | <blank> | <30> | <blank> | <yes> |
| S4 <name> | <test> | <element> | <none> | <40-55%> | <blank> | <35> | <blank> | <yes> |
| S5 <name> | <twist> | <none> | <count> | <55-70%> | <blank> | <35> | <blank> | <yes> |

## Novelty timeline (45-second rule check)

Add one line per novelty event with its recording timestamp, then diff consecutive entries. Any diff above 45 s is a dead spot.

| Event timestamp (s) | Event type (new element / new combination / parameter change) | Diff from previous (s) |
| --- | --- | --- |
| <0> | <new element: first hazard> | <0> |
| <28> | <new combination: hazard plus gap> | <28> |
| <blank> | <blank> | <blank> |
| <blank> | <blank> | <blank> |
| <blank> | <blank> | <blank> |
