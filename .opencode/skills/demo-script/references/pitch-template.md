# Pitch Template - 120 second demo script

Copy this file to `docs/demo-script.md` and fill every placeholder.
Do not add beats. Do not reorder beats. Do not exceed the second budget in any row.
Aim for 110 spoken seconds total; the spare 10 s absorbs fumbles.

## Header

| Field | Value |
| --- | --- |
| Game name | |
| One-line pitch (max 20 words, verb first) | |
| Core mechanic (`verb + object + goal`) | |
| Fail state | |
| Presenter | |
| Demo machine and browser | |
| Fallback clip paths |  |
| Play URL or QR shown at close | |
| Total planned spoken time |  |
| Total measured time, run 1 |  |
| Total measured time, run 2 |  |

## Script

Fill Say with the exact words, not a summary. If you would not say it out loud, delete it.
Fill Show with the concrete on-screen state at that second.
Fill Fallback with the action if this beat fails, or "none" if a failure is not survivable.

| Timestamp | Say | Show | Fallback |
| --- | --- | --- | --- |
| 0:00 to 0:05 | (hook action - silence, or one short line) | Game already in gameplay, core verb firing, no logo, no menu, no title card | If not loaded by 0:03, switch to fallback clip and use the recovery line |
| 0:05 to 0:15 | (hook line: "You [verb] [object] to [goal], and [fail state].") | Same action continuing, first sign of danger on screen | Skip to 0:15 beat, do not repeat the hook |
| 0:15 to 0:35 | (why the loop is satisfying, one sentence) | Clean opening play, uninterrupted | Continue to escalation, note the missing beat |
| 0:35 to 0:55 | (what changes as pressure rises) | Harder section, new pattern, faster rhythm | Stay one section longer, drop the next feature beat |
| 0:55 to 1:15 | (what a good player learns from dying) | Death, game-over beat, retry, improved run | If the death does not happen naturally, skip the beat and do not fake it |
| 1:15 to 1:30 | (feature one, one sentence) | The feature in use | Cut feature one, move to feature two |
| 1:30 to 1:45 | (feature two, one sentence) | The second feature in use | Cut, move to roadmap |
| 1:45 to 1:52 | (two or three concrete next steps) | Game still visible, no slides | Cut entirely |
| 1:52 to 2:00 | (where to play, one line, then stop) | URL or QR, game still running | Say the URL from memory and stop |

## Hook check

Answer before rehearsing. Any "no" means the hook is not written yet.

| Check | Pass |
| --- | --- |
| Core mechanic visible and controllable within 5 seconds | |
| No logo, splash, title card, or menu before 0:05 | |
| Hook line starts with a verb or a noun, not "we" or "so" | |
| Fail state named before 0:15 | |
| First 15 seconds contain zero tech stack words | |

## Rehearsal log

Two full timed runs plus one failure drill are required before the demo slot.
Record the real numbers. Estimates do not count.

| Run | Date and time | Start state | Measured total | Beat that overran | Fix applied |
| --- | --- | --- | --- | --- | --- |
| 1 | | Fresh page load | | | |
| 2 | | Fresh page load | | | |
| Failure drill | | Kill process or close tab mid-run | Recovery time: | | |

Gate: both runs between 108 and 120 seconds, recovery under 10 seconds. If a run is over
120, cut a beat; do not speak faster.

## Recovery line (memorise verbatim, one sentence)

> "That crash is live, so I am switching to the recording of this same build, and the demo continues."

## Cut list

Cross out, do not delay. Cut in this order when running long:

1. Roadmap
2. Feature two
3. Failure beat (only if the build is unstable)
4. Any sentence with "also"
5. Tech stack, architecture, credits

## Banned on stage

- Apologising, hedging, or explaining a bug.
- Narrating controls ("I'm pressing space now").
- Reading this table aloud.
- "Any questions" before the play URL is shown.
