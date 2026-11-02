# Pass / Fail Matrix - playtest-review

Every row must appear in the review report with a verdict and an observation.
An unobserved row is a FAIL of the review. Tool names are the verified server
tools; the flat and Code Mode forms are in SKILL.md.

Phase column is the procedure step in SKILL.md that produces the evidence.

| Check ID | Check | Tool used | Evidence | Pass condition |
|---|---|---|---|---|
| BOOT-01 | Dev server starts and stays up | background shell running `npm run dev` | process output with the printed URL, exit status | server prints a local URL and is still running after the first navigation |
| BOOT-02 | Page responds at the dev URL | playwright browser_navigate; chrome-devtools navigate_page | HTTP load result, page title read back | navigation returns a document, not ERR_CONNECTION_REFUSED, not a 404 page |
| BOOT-03 | Phaser boots a game instance | playwright browser_evaluate; chrome-devtools evaluate_script | returned object with canvas size and a running scene key | a canvas exists with non-zero width and height and at least one active scene |
| RENDER-01 | Title screen paints | playwright browser_take_screenshot; chrome-devtools take_screenshot | `01-title.png` | title text, start prompt and instructions are legible; canvas is not blank, black or one flat colour |
| RENDER-02 | Gameplay HUD paints | playwright browser_take_screenshot | `02-gameplay.png` | score, timer or lives are visible with non-placeholder values |
| INPUT-01 | Horizontal movement responds | playwright browser_press_key; chrome-devtools press_key | entity x before and after ArrowLeft and ArrowRight | x decreases then increases by more than 2 px per press, and the sign matches the direction |
| INPUT-02 | Vertical movement responds | playwright browser_press_key; chrome-devtools press_key | entity y before and after ArrowUp and ArrowDown | y changes in the expected direction on both keys |
| INPUT-03 | Alternate bindings are wired | playwright browser_press_key | position delta per key, one row per binding from the input map | every binding in the input map produces motion; no dead key |
| INPUT-04 | Primary action fires | playwright browser_press_key with the action key; chrome-devtools press_key | projectile or effect count before and after | the action produces exactly one new entity, effect or sound event per press, not zero and not a burst |
| INPUT-05 | Input is not lost after focus change | playwright browser_click on the body, then browser_press_key | position delta after refocus | movement still responds after clicking the page surface |
| COLL-01 | Entity collides with a hazard | playwright browser_press_key driven into the hazard | screenshot plus lives or damage value before and after | the hazard registers once, with a visible reaction and a single damage increment per contact |
| COLL-02 | Collision has no false positives | playwright browser_evaluate; chrome-devtools evaluate_script | damage counter during a clear 5 second run in open space | damage counter stays unchanged when the entity touches nothing |
| SCORE-01 | Score increases on the scoring event | playwright browser_evaluate; chrome-devtools evaluate_script | HUD score before and after one scoring event | score increases by exactly the amount the design contract specifies |
| SCORE-02 | Score does not drift | playwright browser_evaluate | HUD score sampled twice with no input between | identical values; no passive or duplicate scoring |
| TIMER-01 | Timer counts down | playwright browser_evaluate; chrome-devtools evaluate_script | HUD timer sampled at t0 and t0 plus 10 s | value decreases by 10 plus or minus 1 second of game time |
| TIMER-02 | Timer stops at game over | playwright browser_evaluate | HUD timer sampled twice after game over | identical values; the clock is not still running behind the overlay |
| PAUSE-01 | Pause freezes the simulation | playwright browser_press_key with the pause key; chrome-devtools press_key | entity position, timer and score sampled 2 s apart while paused | all three unchanged while paused, and a pause affordance is visible |
| PAUSE-02 | Resume restores play | playwright browser_press_key | timer and position sampled after resume | timer resumes decrementing and movement responds again within 1 second |
| AUDIO-01 | Audio unlocks on first input | playwright browser_console_messages; chrome-devtools list_console_messages | console text after the first click or key, plus AudioContext state | no autoplay-blocked warning after the first gesture and the context state is running, or the game documents audio as not exposed and this row is PARTIAL |
| OVER-01 | Fail state is reachable by play | playwright browser_press_key sequence | elapsed time and the death cause on screen | the game reaches its own fail state through input, within 90 s of driving |
| OVER-02 | Game over screen is informative | playwright browser_take_screenshot; playwright browser_snapshot | `03-game-over.png` plus snapshot | final score and a restart affordance are visible and the HUD is not still animating a live run |
| OVER-03 | Restart resets all mutable state | playwright browser_evaluate; chrome-devtools evaluate_script | score, timer, lives and entity position before death and after restart | all four equal their start values; entity back at spawn within tolerance |
| OVER-04 | Restart keeps input alive | playwright browser_press_key | position delta after restart | movement responds after restart with no reload required |
| RESIZE-01 | 1920x1080 layout holds | playwright browser_resize; chrome-devtools resize_page | screenshot plus canvas rect | canvas stays inside the viewport, is centred, and no console error appears |
| RESIZE-02 | 800x600 layout holds | playwright browser_resize; chrome-devtools resize_page | screenshot plus canvas rect | HUD stays readable, canvas is not clipped, and input still responds |
| MOBILE-01 | 375x667 touch layout holds | chrome-devtools emulate with viewport 375x667x2,mobile,touch | `05-mobile-375x667.png` plus the viewport probe object | scrollWidth is not greater than innerWidth plus 1, canvas is fully inside the viewport, controls are tappable, no new console errors |
| PERF-01 | Frame responsiveness at 60 Hz | playwright browser_evaluate requestAnimationFrame probe; chrome-devtools evaluate_script | probe object with mean, p95, max, over20, over50 | p95 is at most 20 ms and over50 is zero during the sample |
| PERF-02 | Frame responsiveness after a 3 minute soak | playwright browser_evaluate probe after six 30 s browser_wait_for calls | probe object plus `console-soak.txt` | p95 is at most 20 ms, over50 is zero, no new console errors, and mean has not grown by more than 25 percent since the first probe |
| PERF-03 | Frame responsiveness at 4x CPU throttle | chrome-devtools emulate with cpuThrottlingRate 4 | probe object plus a movement delta under throttle | p95 is at most 33 ms and input still moves the entity |
| NET-01 | No asset 404s | playwright browser_network_requests with `{static: true, all: true}`; chrome-devtools list_network_requests | request list with status codes | every request status is below 400; the count of 404 and 500 responses is zero |
| NET-02 | No absolute local paths requested | playwright browser_network_requests | request URL list | no request URL starts with file://, C:/, D:/, localhost with an unexpected port, or 127.0.0.1 |
| CONSOLE-01 | Console is clean at boot | playwright browser_console_messages; chrome-devtools list_console_messages | `console-boot.txt` | zero errors and zero uncaught exceptions before the first input |
| CONSOLE-02 | Console is clean through the full run | playwright browser_console_messages with `{all: true}`; chrome-devtools list_console_messages with preserved messages | `console-run.txt`, verbatim quoted lines | zero errors and zero uncaught exceptions across boot, play, death, restart, resize, mobile and throttle; only DEV-ONLY tooling messages are tolerated at this stage |
| CONSOLE-03 | No unhandled promise rejections | playwright browser_evaluate installing a rejection listener before play; chrome-devtools evaluate_script | rejection count captured at the end of the run | zero unhandled rejections |
| PERF-04 | No runaway memory growth | chrome-devtools performance_start_trace and performance_stop_trace around a 10 s gameplay sample | trace summary plus the two frame probes | no steadily climbing heap trend across the soak and no growth-related console warning |

## Required coverage map

The matrix must stay at or above these themes. Do not drop a row to save time;
drop the review verdict to BLOCKED instead.

- boot: BOOT-01, BOOT-02, BOOT-03
- render: RENDER-01, RENDER-02
- input: INPUT-01 to INPUT-05
- collision: COLL-01, COLL-02
- score: SCORE-01, SCORE-02
- timer: TIMER-01, TIMER-02
- pause: PAUSE-01, PAUSE-02
- game over: OVER-01, OVER-02
- restart: OVER-03, OVER-04
- audio unlock on first input: AUDIO-01
- resize: RESIZE-01, RESIZE-02, MOBILE-01
- console cleanliness: CONSOLE-01, CONSOLE-02, CONSOLE-03
- asset 404s: NET-01, NET-02
- performance: PERF-01 to PERF-04
