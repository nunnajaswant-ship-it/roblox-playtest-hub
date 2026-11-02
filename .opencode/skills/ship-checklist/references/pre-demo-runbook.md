# Pre-Demo Runbook - T-60 to T-0

One pass, in this order, on the exact tree that will be demoed. Owners are the
agents named in the company ledger; the human client is only needed for the
publish approval at T-15.

Rules for the whole window:

- Every step writes its output into
  `D:\desktop\pixel rush\.playwright-mcp\evidence\ship-<stamp>\`.
- A step that overruns borrows time only from a later step marked optional.
  LIVE-02 is never optional.
- Never fix code after T-15 unless the fix is one line and the whole gate is
  re-run from T-45. Late fixes are how demos break.
- Plain text status in the ledger after every step: PASS, FAIL, or BLOCKED.

| Start | Step | Owner | Duration | Pass condition | If it fails |
|---|---|---|---|---|---|
| T-60 | Scope freeze and gate start | athena | 3 min | tree SHA or timestamp recorded, no further edits allowed without a re-run | stop, decide GO on the previous tree |
| T-57 | Two clean builds, reproducible | pixel | 12 min | both builds exit 0, `dist/index.html` present, SHA256 manifests identical | fix the nondeterministic input, or ship the previous passing build |
| T-45 | Static serve, asset and meta sweep | argus | 10 min | `/` returns 200, zero 404s and 500s, no absolute local paths, title, description, viewport and favicon correct | fix the asset or meta, rebuild, restart at T-57 |
| T-35 | Full playtest matrix | argus | 12 min | every row in playtest-review references/pass-fail-matrix.md is PASS with an observation | FAIL the gate, report the failing IDs, no fixes inside this window |
| T-23 | Performance floor, 4x throttle, 375x667 mobile | chronos | 8 min | desktop p95 at most 20 ms, throttled p95 at most 33 ms, mobile layout holds with no new console errors | apply one remediation from ship-checklist step 8, re-measure once, then no-go |
| T-15 | Publish approval and deploy | pixel | 5 min | approval recorded, live URL returns 200 for `/` and for the main bundle | do not deploy, demo from localhost and say so in the pitch |
| T-10 | Live URL verification in a private window | argus | 5 min | subset matrix PASS with cache bypassed, screenshots and console dump saved | roll back to the previous deploy, or demo localhost and disclose it |
| T-5 | Demo dry run against the live URL | ariadne | 4 min | the 120 second script runs end to end without a crash, restart or reload | cut the optional third beat, keep hook and core loop |
| T-1 | Go / no-go call | athena | 1 min | verdict block filled, GO or NO-GO decided out loud | default is NO-GO, not "try it live" |

## Step detail

### T-60 - Scope freeze, 3 min, athena

Record the tree identity (git SHA, or "no git repo" plus working tree
timestamp) and announce the freeze. From here, only the deploy owner touches the
repo, and only to deploy.

Exit: one line in the ledger with the tree identity and the freeze time.

### T-57 - Two clean builds, 12 min, pixel

Run ship-checklist step 1 exactly as written: delete `dist`, build, hash
manifest, delete `dist`, build again, hash manifest, compare. Save `build-1.txt`,
`build-2.txt`, `build-diff.txt`.

Exit: exit code 0 twice, empty diff, `dist/index.html` present with non-zero
length.

### T-45 - Static serve, assets, meta, 10 min, argus

Serve `dist` with the static preview server on a fixed port, then run
ship-checklist steps 2 to 6: static load, absolute path sweep, 404 sweep, title
and meta read, favicon status.

Exit: zero 404s, zero absolute local paths, title equals the demo name, favicon
200.

### T-35 - Full playtest matrix, 12 min, argus

Run playtest-review end to end, all 15 steps, every matrix row. Do not sample.
The title, gameplay, game-over and restart screenshots are required artifacts
for the pitch as well as for QA.

Exit: report with every row having a verdict and an observation, plus the
verdict line.

### T-23 - Performance and mobile, 8 min, chronos

Desktop probe at 1280x720, 4x CPU throttle probe, then the 375x667 touch layout
with the viewport probe object. Record numbers, not impressions.

Exit: p95 desktop at most 20 ms, p95 throttled at most 33 ms, mobile
`scrollWidth` within 1 px of `innerWidth`, no new console errors.

### T-15 - Deploy, 5 min, pixel with athena approval

Publishing is an external action: get explicit approval first, then deploy, then
confirm the live URL responds 200 for `/` and for the main bundle. Record the
response headers.

Exit: live URL and timestamp in the ledger.

### T-10 - Live verification, 5 min, argus

Fresh isolated context, cache bypassed navigation, subset matrix: boot, render,
one input row, zero 404s, console clean, game over, restart, frame probe, mobile
layout. Save `live-title.png`, `live-gameplay.png`, `console-live.txt`.

Exit: subset PASS on the live URL, in a window that never saw localhost.

### T-5 - Demo dry run, 4 min, ariadne

Run the 120 second script against the live URL, not the dev server, with the
presenter speaking, timed. Confirm the restart path the demo uses works on the
live deploy.

Exit: one clean timed run, and a fallback clip recorded if the run showed any
latency spike on the live URL.

### T-1 - Go / no-go, 1 min, athena

Read the verdict block out loud. GO requires every blocking row PASS. Anything
else is NO-GO. NO-GO means demo the recorded fallback clip and say the build is
not shipping, not "let us see what happens".

## Abort criteria

Stop the runbook and go NO-GO immediately, without trying to repair, if any of
these is true:

- console shows an uncaught exception at any point after T-35
- the live URL serves a stale build (bundle hash differs from the local build)
- the citation gate cannot be completed before T-0
- the demo requires a dev server, a terminal, or any manual step to work

## Handoff at T-0

The owner of the demo needs exactly four things: the live URL, the tree
identity, the verdict line, and the fallback clip path. Nothing else.
