# Juice Checklist

Pass or fail only. No partial credit, no "feels good enough".
Fill the Pass column with PASS or FAIL and the evidence (timestamp, screenshot, or number).

Frame budget reference: 1 frame = 16.7 ms at 60 fps.

| Effect | Where it fires | Numeric budget | How to verify | Pass |
| --- | --- | --- | --- | --- |
| Input response | On every pointer or key press that has a game action | First visual change within 1 frame (16.7 ms), never above 33 ms | Browser: press the input and watch the frame counter or a screen recording stepped frame by frame. The sprite must move or flash in the same frame or the next one. | |
| Input buffer | On an action pressed slightly before it is legal | Accepted window 100 to 150 ms | Browser: spam the action 100 ms before landing. The action must fire on landing without a second press. | |
| Hit-stop | On confirmed contact | 40 to 80 ms, 120 ms hard cap | Browser: record at 60 fps, count frozen frames on contact (2 to 5 frames). The world must resume and the timer must return to 1.0. | |
| Kill hit-stop | On the killing blow | 90 ms, 150 ms cap | Browser: land a kill. The pause must be visibly longer than a normal hit but under a quarter second. | |
| Squash and stretch | Player and enemy sprites on impact | Scale 0.85 to 1.15, back to 1.0 within 120 ms | Browser: watch the impact at half speed. Sprite distorts on the axis of the hit and settles. No permanent deformation. | |
| Screen shake | Gameplay camera on a significant hit | Amplitude 2 to 8 px, duration 80 to 200 ms | Browser: DevTools performance recording. Measure camera offset bounds across the shake; must stay within 8 px and stop inside 200 ms. | |
| Shake retrigger guard | Rapid repeated hits | Minimum 100 ms between shakes | Browser: hold fire into a wall for 2 seconds. The screen must stutter at a readable rhythm, not vibrate continuously. | |
| UI camera isolation | While any HUD or overlay is visible | Zero shake on UI layer | Browser: trigger the heaviest shake. HUD text and score must stay pixel-stable. | |
| Camera zoom punch | On a heavy hit or kill | 4 to 7 percent, 8 percent cap, back to 1.0 in 80 to 150 ms | Browser: log `camera.zoom` during the event. Peak under 1.08 and exactly 1.0 after 200 ms. | |
| Hit flash | Sprite or impact point on contact | Alpha 0.15 to 0.35, 50 to 120 ms, max 3 per second | Browser: hit the same target repeatedly. Flash is visible but the sprite is never fully white, and the rate never exceeds 3 per second. | |
| Particle burst size | On each hit | 8 to 24 particles per burst, 40 cap | Browser: count one burst in a paused frame. No single hit produces a cloud. | |
| Particle ceiling | Global, during the busiest moment | 300 simultaneous, lifetime 300 to 600 ms | Browser: trigger the biggest event, then log the live particle count. Peak at or below 300 and the scene clears within 800 ms. | |
| Particle occlusion | Around the player sprite | Player silhouette at least 70 percent visible at all times | Browser: screenshot the busiest frame. The player outline must be readable without moving. | |
| Action sound | Every primary player verb | Fires within 30 ms of the input, attack under 20 ms | Browser: record audio and input together. The transient must align with the visual within 2 frames. | |
| Hit sound | On confirmed contact | Distinct from the action sound, 4 concurrent copies maximum | Browser: fire into a crowd. Audio stays separated, not a single buzzing tone. | |
| Fail sound | On damage, life loss, or run end | Lower pitch than action and hit, decay 300 to 800 ms | Browser: take a hit with headphones. It must be unmistakably bad news and must not be comedic. | |
| State change sound | Menu open, wave start, score milestone, game over | One per state change, never doubled | Browser: run a full loop start to game over. Every change is audible exactly once. | |
| Audio headroom | Master output at the busiest moment | Peak at or below -3 dBFS, zero clipped samples | Browser: record 10 seconds of peak play, inspect the waveform. No flat-topped peaks. | |
| Audio variation | Repeated identical actions | Pitch plus or minus 5 percent per instance | Browser: fire 20 times. The sound has texture, not a machine-gun copy. | |
| Audio unlock | First user gesture | Context resumed before the first gameplay sound | Browser: load fresh, click start, confirm the first action is audible. No silent opening. | |
| Reduced motion | `prefers-reduced-motion: reduce` | Shake off, zoom off, particles at or below 20, flash at or below alpha 0.15 | Browser: enable the OS reduced-motion flag, reload, replay the same hit. No camera movement, feedback still legible. | |
| Colour independence | Every state indicator (health, danger, score tier) | At least 2 non-colour channels (shape, icon, position, text, outline) | Browser: apply a greyscale filter. Every state remains distinguishable. | |
| Flash safety | Any full-screen or large-area flash | Max 3 per second, area at or below 25 percent of screen | Browser: count flashes in a 10 second recording. Rate and area within limit. | |
| Menu transition | Every screen change | 150 to 400 ms, no hard cut, input locked then released | Browser: navigate start, pause, game over, retry. Every change animates and no frame shows the wrong scene. | |
| Transition consistency | All screens | Same direction, same ease, same duration band | Browser: click through every screen once. No mixed wipes, slides and cuts. | |
| Game over beat | On run end | 400 to 600 ms before any result UI appears | Browser: die and count frames. The result panel must not appear in the same frame as the killing hit. | |
| Retry path | Game over screen | One action restarts, total time under 1 second | Browser: press the primary key once. New run is playable within 1 second with no menu detour. | |
| Score reveal | Game over screen | Count-up 600 to 900 ms, one tick per 10 points, new best marked by text | Browser: finish a run. Score animates, best compares, a new record is stated in words. | |
| Anti-juice: shake storm | Continuous fire or collision | Shake never on consecutive frames | Browser: hold the action into a wall for 3 seconds. No sustained vibration. | |
| Anti-juice: flash storm | Repeated damage | No more than 3 flashes per second, no full white frame | Browser: take rapid damage. Image stays readable throughout. | |
| Frame budget | Busiest gameplay moment | 16.7 ms average, 20 ms cap | Browser: DevTools performance panel, 10 second capture during peak play. No frame over 20 ms. | |

## Verify in browser, always

A budget verified only by reading code is unverified. For each row:

1. Open the game with DevTools, performance panel recording.
2. Trigger the effect once, in isolation, then once at peak load.
3. Step the recording frame by frame and read the actual number.
4. Write PASS or FAIL with the observed value in the Pass column.
5. Re-run any row you changed code for. Polish regressions are silent.
