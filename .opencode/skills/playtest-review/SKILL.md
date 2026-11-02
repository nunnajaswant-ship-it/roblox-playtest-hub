---
name: playtest-review
description: "Gate any done claim on real browser evidence for the Pixel Rush web game - use when playtesting a build, checking console errors, capturing title, gameplay, game-over and restart screenshots, sending movement keys, soaking the game for 3 minutes, or checking 375x667 mobile and throttled CPU behaviour with the playwright and chrome-devtools MCP servers."
---

# Playtest Review

Browser evidence or it did not happen. A diff, a green unit test, or a clean
build log is not evidence that the game plays.

## Rule 1 - no feature is done without a session

A feature is DONE only when a browser session, on the current working tree,
exercised it end to end and left artifacts on disk. These are automatic FAIL,
not reasons to skip the run:

- "should work", "the code path looks right", "tested mentally"
- a screenshot of a different machine, a different branch, or an earlier build
- a passing unit test with no browser session in the same review
- a claim that the browser tool was unavailable, without a BLOCKED verdict

If the browser tool cannot be reached, the verdict is BLOCKED. Never PASS.

## Tool names

OpenCode exposes every MCP tool under two shapes. The flat name is what appears
in the tool list; the Code Mode path is what you call inside `execute`.

| Server | Tool | Flat name | Code Mode path |
|---|---|---|---|
| playwright | browser_navigate | playwright_browser_navigate | tools.playwright.browser_navigate |
| playwright | browser_console_messages | playwright_browser_console_messages | tools.playwright.browser_console_messages |
| playwright | browser_take_screenshot | playwright_browser_take_screenshot | tools.playwright.browser_take_screenshot |
| playwright | browser_snapshot | playwright_browser_snapshot | tools.playwright.browser_snapshot |
| playwright | browser_find | playwright_browser_find | tools.playwright.browser_find |
| playwright | browser_click | playwright_browser_click | tools.playwright.browser_click |
| playwright | browser_press_key | playwright_browser_press_key | tools.playwright.browser_press_key |
| playwright | browser_type | playwright_browser_type | tools.playwright.browser_type |
| playwright | browser_resize | playwright_browser_resize | tools.playwright.browser_resize |
| playwright | browser_wait_for | playwright_browser_wait_for | tools.playwright.browser_wait_for |
| playwright | browser_evaluate | playwright_browser_evaluate | tools.playwright.browser_evaluate |
| playwright | browser_network_requests | playwright_browser_network_requests | tools.playwright.browser_network_requests |
| playwright | browser_network_request | playwright_browser_network_request | tools.playwright.browser_network_request |
| playwright | browser_tabs | playwright_browser_tabs | tools.playwright.browser_tabs |
| chrome-devtools | list_pages | chrome-devtools_list_pages | tools["chrome-devtools"].list_pages |
| chrome-devtools | new_page | chrome-devtools_new_page | tools["chrome-devtools"].new_page |
| chrome-devtools | navigate_page | chrome-devtools_navigate_page | tools["chrome-devtools"].navigate_page |
| chrome-devtools | list_console_messages | chrome-devtools_list_console_messages | tools["chrome-devtools"].list_console_messages |
| chrome-devtools | get_console_message | chrome-devtools_get_console_message | tools["chrome-devtools"].get_console_message |
| chrome-devtools | list_network_requests | chrome-devtools_list_network_requests | tools["chrome-devtools"].list_network_requests |
| chrome-devtools | take_screenshot | chrome-devtools_take_screenshot | tools["chrome-devtools"].take_screenshot |
| chrome-devtools | take_snapshot | chrome-devtools_take_snapshot | tools["chrome-devtools"].take_snapshot |
| chrome-devtools | press_key | chrome-devtools_press_key | tools["chrome-devtools"].press_key |
| chrome-devtools | evaluate_script | chrome-devtools_evaluate_script | tools["chrome-devtools"].evaluate_script |
| chrome-devtools | resize_page | chrome-devtools_resize_page | tools["chrome-devtools"].resize_page |
| chrome-devtools | emulate | chrome-devtools_emulate | tools["chrome-devtools"].emulate |

Two things that break runs:

- The chrome-devtools server name contains a hyphen. In Code Mode use bracket
  notation: `tools["chrome-devtools"].navigate_page`. `tools.chrome-devtools.x`
  is a syntax error.
- Most chrome-devtools tools require a `pageId`. Get it from `list_pages` first
  and reuse it for the whole run. Playwright tools keep their own session and
  do not take a pageId.

Open the tool list once before the first call. If a name in this table is
missing, use the closest name the server actually exposes and record the
substitution in the report. Never invent a name.

## Session setup

Server target: the chrome-devtools server must be pointed at Playwright's
Chromium, because Chrome is not installed on this machine. Use its
configuration guide for the executable path setting; do not guess a flag name.
If chrome-devtools cannot attach, run every step on playwright, mark the
mobile and throttled rows PARTIAL with the reason, and say so in the verdict.

Evidence folder, created before the first capture. It must live INSIDE the
workspace root, because the playwright server denies every write outside its
allowed roots with `File access denied: ... is outside allowed roots`:

```
D:\desktop\pixel rush\.playwright-mcp\evidence\playtest-<YYYYMMDD-HHMMSS>\
```

`vite.config.js` already ignores `**/.playwright-mcp/**` in `server.watch`. That
ignore is mandatory: without it, writing a screenshot into the project makes the
Vite dev server full-reload the page mid-session, which looks exactly like a
dropped keypress or a game crash. The folder is also in `.gitignore`.

Write the absolute path at the top of the report. Use `.playwright-mcp/` for
playwright captures. The chrome-devtools server is configured with its default
filesystem root (the OS temp directory), so its `take_screenshot` filePath must
point at temp, or the server must be relaunched with `--workspace` naming the
repo. Never mix the two evidence roots in one report without saying so.

`browser_take_screenshot` resolves a relative filename against the workspace
root and silently drops the file somewhere you did not look, so always pass an
absolute path. Both tools return an inline image when no path is given, which is
not evidence you can hand to anyone.

## Procedure - run in this order

Do not reorder, do not merge steps, do not skip a step because an earlier one
looked fine.

### 1. Start the dev server in the background

Run the dev script from `package.json` as a background command, for example
`npm run dev`, and wait for the line that prints the local URL. Record that
exact URL and the exit status of the process. A dev server that starts and then
dies is a FAIL found at step 1, not a flake to retry.

Pass condition: the process is still running when step 2 succeeds and the
printed URL responds.

### 2. Navigate to the URL

`browser_navigate` with the URL from step 1, then `browser_snapshot` to confirm
the page has a tree. On chrome-devtools, `list_pages` then `navigate_page`
`{type: "url", url: <url>}`.

Pass condition: snapshot shows the game container or canvas and the document
title is not the browser default and not an error page.

### 3. Capture console output - boot baseline

`browser_console_messages` `{level: "info"}` before any input. On chrome-devtools
`list_console_messages` `{pageId}` `{includeStackTraces: true}`.

Save the raw text to `console-boot.txt` and quote every error line verbatim in
the report. This is the baseline that every later check is compared against.

### 4. Screenshot the title screen

`browser_take_screenshot` with an absolute filename `01-title.png`, then
`browser_snapshot` so the start control has a target reference.

Pass condition: title, start prompt, and any score or instructions are legible
at the default viewport, and the canvas is not blank, black, or a solid fill.

### 5. Start the game

Click the start control with `browser_click`, or `browser_press_key` with the
key the design contract names. Use `browser_find` to locate the control text
first if the snapshot is large.

Pass condition: the title state is gone and a playable state is visible in a
fresh `browser_snapshot`.

### 6. Send the movement keys

Send the movement bindings from the game's input map, not from memory. Read the
bindings file (the constants or input module) and use those keys. The expected
default set is ArrowLeft, ArrowRight, ArrowUp, ArrowDown and their WASD
equivalents, plus Space for the primary action.

Send each key with `browser_press_key` `{key: "ArrowRight"}`, one at a time,
with a snapshot or `evaluate_script` read between them. Long holds need to be
simulated by repeated presses, because a single press is a tap.

Pass condition: the controllable entity moves in the expected direction on
every binding, with a measured position delta, and no binding is dead.

### 7. Screenshot gameplay

`browser_take_screenshot` to an absolute `02-gameplay.png` after the position
deltas are measured.

Pass condition: the entity is visibly not at the spawn position and HUD
elements (score, timer, lives) show live values.

### 8. Force a fail state

Read the fail condition from the design contract and reach it honestly: drive
the entity into the first hazard, or drain the lives if lives exist. If the
fail path cannot be reached within 90 seconds of real input, stop and ask the
owner for a debug entry point. Do not fake the state by editing memory, and do
not declare game over from a code read.

Record the elapsed time to reach the fail state.

Pass condition: the game reaches its own fail state through gameplay input.

### 9. Screenshot game over

`browser_take_screenshot` to an absolute `03-game-over.png`, then
`browser_snapshot`, then `browser_console_messages` again.

Pass condition: a game-over affordance is visible (final score, restart
control) and no error appeared between step 7 and step 9.

### 10. Restart and confirm state resets

Trigger the restart control, then read the state back. Use
`browser_evaluate` or `evaluate_script` to read the values the HUD displays,
comparing pre-death and post-restart.

Pass condition, all four observable:

- score is back to its start value
- timer or lives are back to their start value
- the entity is back at spawn within the spawn tolerance
- the game is accepting input again, proven by a second position delta

A restart that leaves score or lives at the death values is a FAIL even if the
screen looks correct.

### 11. Soak - 3 minutes with the browser left running

Leave the page open and let real time pass. `browser_wait_for` caps a single
wait at 30 seconds, so chain six waits of 30 seconds. Do not close the tab, do
not reload, do not touch the game during the soak.

After the soak:

- `browser_console_messages` with `{all: true}` into `console-soak.txt`
- frame responsiveness probe, below
- `browser_take_screenshot` to `04-soak.png`

Frame probe, run through `browser_evaluate` or `evaluate_script`; both await the
returned promise:

```js
() => new Promise((resolve) => {
  const t = [];
  let last = performance.now();
  let n = 0;
  function tick(now) {
    t.push(now - last);
    last = now;
    if (++n < 120) { requestAnimationFrame(tick); return; }
    const s = t.slice(1).sort((a, b) => a - b);
    const p = (q) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
    resolve({
      frames: s.length,
      mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2),
      p95: +p(0.95).toFixed(2),
      max: +s[s.length - 1].toFixed(2),
      over20: s.filter((x) => x > 20).length,
      over50: s.filter((x) => x > 50).length
    });
  }
  requestAnimationFrame(tick);
})
```

Soak pass condition: zero new console errors, `p95 <= 20` ms, `over50 === 0`.
A steady climb in `mean` across two probes three minutes apart is a leak
signal and must be reported even if the absolute numbers still pass.

### 12. Mobile check at 375x667

chrome-devtools `emulate` with
`{viewport: "375x667x2,mobile,touch", pageId}`. Each `emulate` call replaces all
previous emulation settings, so send every setting you still want in the same
call. Then screenshot `05-mobile-375x667.png` and probe:

```js
() => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  canvas: (() => {
    const c = document.querySelector('canvas');
    if (!c) { return null; }
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             left: Math.round(r.left), top: Math.round(r.top) };
  })(),
  audio: (() => {
    const a = window.__audioContext;
    return a ? a.state : "not exposed";
  })()
})
```

Pass condition: `scrollWidth <= innerWidth + 1`, no canvas edge outside the
viewport, touch-sized start and restart controls still tappable, and no new
console errors. Playwright has no tool-level device emulation, so
`browser_resize` to 375x667 is a viewport-only downgrade; record it as PARTIAL.

### 13. Throttled CPU check

chrome-devtools `emulate` with `{cpuThrottlingRate: 4, viewport: "375x667x2,mobile,touch", pageId}`,
then repeat the frame probe and one movement key press.

Pass condition: `p95 <= 33` ms, the entity still moves on a key press, and no
new console errors. Reset with `{cpuThrottlingRate: 1, pageId}` when done. If the
claimed frame-rate insight name from the DevTools MCP trace tools is needed for
a deeper look, confirm the exact insight name from the trace output instead of
guessing it; the frame probe above is the pass/fail number.

### 14. Console error gate - final

Re-run `browser_console_messages` with `{all: true}` and
`list_console_messages` with `{includePreservedMessages: true}`.

Any uncaught exception, any `console.error`, and any failed resource request is
an automatic FAIL for the whole review. Capture the exact text, the source file
and line if the tool provides a stack, and the step number where it first
appeared. Quote it in the report; a paraphrase is not evidence.

Dev-only noise is the single allowed exception, and only for messages emitted
by the dev server tooling itself, such as the Vite HMR websocket. Mark those
`DEV-ONLY`, quote them, and re-check them against the static build in
ship-checklist. Nothing else is exempt, including "harmless" Phaser warnings.

### 15. Write the evidence

Create `report.md` in the evidence folder with:

| Check ID | Verdict | Observation |
|---|---|---|
| BOOT-01 | PASS | canvas 960x540 present, title "Pixel Rush" |

Then the required fields:

- `URL:` the exact URL tested
- `COMMIT:` git SHA, or "no git repo" plus the working tree timestamp
- `TOOLS:` servers used
- `SCREENSHOTS:` absolute paths
- `CONSOLE:` the verbatim error lines, or "none"
- `SUBSTITUTIONS:` any tool name that differed from the table
- `VERDICT:` PASS, FAIL, or BLOCKED, with the failing check IDs

Every row carries a verdict and an observation. A row with an empty observation
is a FAIL of the review itself, because it cannot be distinguished from a row
that was never run.

## Failure handling

Reproduce first. Re-run the failing step once, unchanged, to separate a real
defect from a harness problem. If it reproduces, keep the artifacts, report the
minimal input sequence, and return FAIL. Never soften a verdict because the
demo is close.

## Reference

`references/pass-fail-matrix.md` holds the full check list with the tool, the
evidence, and the pass condition for each check. Every check in the matrix must
appear in the report with a verdict.
