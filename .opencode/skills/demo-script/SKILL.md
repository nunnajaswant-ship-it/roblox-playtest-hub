---
name: demo-script
description: Two-minute live demo script and rehearsal contract for a 1-day game pitch. Use when writing the pitch, timing the 120 second demo, deciding what the presenter says versus what the screen shows, rehearsing run-throughs, or planning recovery from a live crash. Enforces the 15/60/30/15 structure, the 5 second hook rule, the two-run rehearsal gate, and the pre-recorded fallback clip.
---

# Demo Script

The demo is a performance, not a build log. 120 seconds, one screen, one voice.
Write the script before the last feature, not after, because the script tells you what
to cut.

## 1. The 120 second structure

Hard budgets. If a section overruns, the next section is cut, never squeezed.

| Time | Section | Budget | Job |
| --- | --- | --- | --- |
| 0:00 to 0:15 | Hook | 15 s | Show the mechanic and the stakes, no introduction |
| 0:15 to 1:15 | Gameplay | 60 s | Prove the loop is fun, show escalation, show failure and recovery |
| 1:15 to 1:45 | Features | 30 s | Three concrete things max, each visible on screen |
| 1:45 to 2:00 | Roadmap | 15 s | Where it goes next and where to play it |

Rules:

- Aim for 110 spoken seconds. The remaining 10 s absorbs a slow load, a surprise applause
  beat, or a fumbled transition. A script that targets exactly 120 s runs over.
- Time starts when the screen changes, not when you start talking.
- One presenter. Two voices splitting 120 s wastes 5 to 8 s on handoffs.
- No slide deck. A slide is 15 wasted seconds of a 120 second demo.

## 2. Say versus show, beat by beat

| Beat | Time | Says | Shows |
| --- | --- | --- | --- |
| Hook action | 0:00 to 0:05 | Nothing, or one short line. Let the game talk | Game already running, the core verb being performed. No logo, no title card |
| Hook line | 0:05 to 0:15 | One sentence naming the verb, the object, the goal, and the fail state | The same action on screen, then the first sign of danger |
| First loop | 0:15 to 0:35 | Why the loop is satisfying, one sentence | Clean opening play, uninterrupted. No menu, no settings |
| Escalation | 0:35 to 0:55 | What changes as pressure rises | Harder section, new pattern, faster rhythm |
| Failure and recovery | 0:55 to 1:15 | What a good player learns | Deliberate or honest death, the game-over beat, the retry, a better run. This is the most persuasive 20 seconds in the demo |
| Feature one | 1:15 to 1:30 | One sentence, no feature names invented on the spot | The feature being used, not described |
| Feature two | 1:30 to 1:45 | One sentence | The second feature, ideally a variation showing depth |
| Roadmap | 1:45 to 1:52 | Two or three concrete next steps with a time estimate | Roadmap is spoken only. Keep the game visible, no slides |
| Close | 1:52 to 2:00 | Where to play it, one line, then stop talking | URL or QR, game still running on screen |

Presenter discipline:

- The screen carries every claim. If you say "it has combos", a combo must be on screen
  in the same breath.
- Never read from the screen. The script is a memory aid, the game is the argument.
- Pause for one second after the hook action. Silence makes people look up.

## 3. The hook rule

The core mechanic must be visible and in the player's hands within the first 5 seconds.

Banned in the first 5 seconds:

- Logo animation, splash screen, engine watermark, title card with a tagline.
- "Hi, I'm" and any name or team introduction.
- A slide, a menu, a settings screen, or a level select.
- Any sentence that starts with "So" or "Today I'm going to show you".

Required in the first 5 seconds:

- The game in gameplay, the primary verb already firing, one readable visual consequence.
- The hook line must start with a noun or a verb, not with "we". Example shape:
  "You dash through bullets to score, and one hit ends the run."
- The stakes are named before 0:15. A demo with no fail state has no tension and no
  reason to watch the next 105 seconds.

## 4. Rehearsal gate

No demo slot until both gates are recorded in `references/pitch-template.md`.

1. **Two full run-throughs**, start to finish, timed with a stopwatch, in the same
   conditions as the demo: same machine, same browser, same window size, same network
   assumption.
2. Write down the **actual times** for both runs and the beat that overran.
3. Both runs must land between **108 and 120 seconds**. Under 108 is rushed and needs a
   beat added; over 120 gets a cut, not a faster voice.
4. One of the two runs must include a **simulated failure**: kill the game process or
   pull the tab mid-run, then deliver the recovery line and switch to the fallback clip.
   Time that recovery. It must be under 10 seconds from dead screen to moving video.
5. Rehearse with sound on. The demo is scored on audio; a muted rehearsal hides clipping,
   silence, and the missing audio unlock on first gesture.
6. Rehearse the retry beat. The retry is the part that breaks live because it is the part
   nobody practices.

Gate result: two timed runs, written down, plus one timed recovery drill. Anything less
is a hope, not a demo.

## 5. Failure plan

Assume the build crashes. Plan the 10 seconds, not the debug.

Before the slot:

- Record a **90 second fallback clip** of a real run of the exact build being demoed.
  1080p, 60 fps, audio on, no cursor jitter, no dev tools, no debug overlay.
- Export as `public/fallback.mp4` plus a `fallback.gif` or `.webm` so a codec failure
  cannot take out both. Verify both open in the demo browser, not just locally.
- Pre-open the clip in a second tab, muted and paused at frame one. Do not search the
  filesystem live.
- Keep a second copy outside the repo, on the desktop or a USB stick, in case the build
  folder is the thing that broke.

During a crash:

1. Say the recovery line immediately, while the screen is still broken. Do not wait to
   diagnose, do not scroll a console, do not say "one second".
2. Switch to the fallback tab. Target under 10 seconds of dead screen.
3. Continue the script from the beat you were on. Do not restart the demo.
4. Do not debug live. Do not explain the stack trace. Do not promise a fix on stage.
5. After the demo, note the crash and the beat it happened on.

The exact recovery line, one sentence, memorised verbatim:

> "That crash is live, so I am switching to the recording of this same build, and the demo continues."

Rules for that sentence: it names the fact, names the fix, and moves on. No apology, no
self-deprecation, no blame on the machine. Say it once. If the fallback also fails, close
with the one line about where to play it and stop.

## 6. What to cut, and what is banned

Cut, in this order, when time is short:

1. The roadmap. It is 15 s of promises and the least provable section.
2. The third feature. Two visible features beat three described ones.
3. The failure beat, but only if the game is stable; it is the best evidence you have.
4. Any sentence containing "also", "additionally", or "we also have".
5. Any mention of the tech stack, architecture, libraries, file structure, or how the
   code is organised.
6. Credits, team names, thanks, and tool acknowledgements.
7. Anything you have to explain before showing.

Banned outright:

- **Apologising.** No "sorry", "this is a bit buggy", "we ran out of time", "it usually
  works", "ignore that". The audience did not know it was broken until you said so.
- **Narrating controls.** No "I'm pressing space now", "so I'll click here", "let me move
  over there". The input is visible; narrating it wastes seconds and reads as nervous.
- Reading bullet points aloud, in any section.
- Hedging: "kind of", "sort of", "basically", "I think", "hopefully".
- Naming tools, AI assistance, or how fast it was built, unless it is the pitch's actual
  premise.
- Ending on "any questions" before the URL or play link has been shown.

If something breaks and you have already used the recovery line, stay silent and keep
the fallback playing. Silence reads as control. Commentary reads as panic.

## 7. Script artifact

Fill in `references/pitch-template.md`. It carries the beat skeleton, a timestamp column,
a say column, a show column, a fallback column, and the rehearsal log. A demo without a
written, timed script is an improvisation, and improvisation is what the other teams are
doing.
