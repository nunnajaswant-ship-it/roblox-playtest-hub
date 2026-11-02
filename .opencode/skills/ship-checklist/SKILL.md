---
name: ship-checklist
description: "Run the go/no-go release gate for the Pixel Rush web game before any demo, submission or deploy - covers a clean reproducible build, serving dist statically, absolute path and 404 sweeps, page title, meta and favicon, a cache-disabled private window load, the 60 fps performance floor, and live URL verification, with an owner and time-box per check."
---

# Ship Checklist

Ships as a gate, not as advice. Every row has an owner, a time-box, and a pass
condition someone else can observe. Rows nobody can observe are not checks.

## Go / no-go gate

Run this gate once, top to bottom, on the exact tree that will be demoed or
submitted. It runs before any demo, submission, or deploy, and no row may be
skipped because it passed an hour ago on a different tree.

```
GO     every row PASS, zero console errors, zero 404s, perf floor met
NO-GO  any row FAIL
BLOCKED cannot run the row, for example no browser session
```

NO-GO and BLOCKED both stop the ship. "PASS with a known issue" does not exist
in this gate; either the row passed or it did not. A single FAIL row makes the
gate NO-GO even when the other rows are green.

Publishing to a public URL is an external action that needs explicit owner
approval before it happens. The verification in this checklist is read-only and
does not need approval; the deploy itself does.

## Evidence folder

```
D:\desktop\pixel rush\.playwright-mcp\evidence\ship-<YYYYMMDD-HHMMSS>\
```

Collect `build-1.txt`, `build-2.txt`, `build-diff.txt`, screenshots, console
dumps and `ship-report.md` there. Keep it inside the workspace: the playwright
server refuses writes outside its allowed roots, and the chrome-devtools server
defaults to the OS temp directory. `vite.config.js` ignores
`**/.playwright-mcp/**` in `server.watch`, so writing evidence into the repo
cannot trigger a dev-server reload; without that ignore it does, and a page
reload during a playtest looks like a lost input or a crash.

## 1. Clean build - delete dist, rebuild, prove reproducibility

Owner: build owner. Time-box: 10 minutes.

Do not test a stale `dist`. A build that only works because of leftover files is
a NO-GO, and stale artifacts are the most common cause of a demo that dies on a
fresh machine.

```powershell
Remove-Item -Recurse -Force dist
npm run build
```

Confirm the process exits 0 and that `dist/index.html` exists with a non-zero
length. If the permission layer asks about the delete, confirm it is scoped to
`dist` only and nothing above it.

Then prove reproducibility by building twice from clean and comparing SHA256
manifests:

```powershell
$ev = "D:\desktop\pixel rush\.playwright-mcp\evidence\ship-latest"
Remove-Item -Recurse -Force dist
npm run build
Get-ChildItem dist -Recurse -File |
  ForEach-Object { "$($_.FullName.Substring((Resolve-Path dist).Path.Length + 1))  $((Get-FileHash $_.FullName -Algorithm SHA256).Hash)" } |
  Sort-Object | Set-Content "$ev\build-1.txt"
Remove-Item -Recurse -Force dist
npm run build
Get-ChildItem dist -Recurse -File |
  ForEach-Object { "$($_.FullName.Substring((Resolve-Path dist).Path.Length + 1))  $((Get-FileHash $_.FullName -Algorithm SHA256).Hash)" } |
  Sort-Object | Set-Content "$ev\build-2.txt"
Compare-Object (Get-Content "$ev\build-1.txt") (Get-Content "$ev\build-2.txt") |
  Set-Content "$ev\build-diff.txt"
Get-Content "$ev\build-diff.txt"
```

Pass condition: exit code 0 on both builds, `dist/index.html` present, and
`build-diff.txt` is empty. Vite emits content hashes into filenames, so an
identical tree must produce an identical manifest. Any diff is a nondeterministic
build input (timestamps, random ids, injected dates) and is a NO-GO until
explained or fixed.

## 2. Static check A - dist loads when served statically

Owner: QA. Time-box: 5 minutes.

The demo is served as static files, not from the dev server. Test the artifact,
not the toolchain.

```powershell
npx vite preview --port 4173 --strictPort
```

Use the preview script from `package.json` if one exists; the point is a plain
static server over `dist` with no HMR and no module rewriting. Load
`http://localhost:4173/` in the browser.

Pass condition: the game reaches its title screen from the static server, with
the same behaviour as the dev server, and the response for `/` is 200.

## 3. Static check B - no absolute local paths

Owner: QA. Time-box: 5 minutes.

```powershell
Get-ChildItem dist -Recurse -File -Include *.html,*.js,*.css,*.json |
  Select-String -Pattern 'file://', 'C:\\', 'D:\\', 'localhost:', '127\.0\.0\.1'
```

Pass condition: zero matches, apart from a documented dev-only comment inside a
source map that is not loaded at runtime. Any hard-coded machine path or
localhost URL in a shipped asset is a NO-GO: it works on your machine and
breaks on the judge's.

Also confirm every asset reference in `dist/index.html` is root-relative (`/`)
or page-relative (`./`), never a drive letter or a backslash path.

## 4. Static check C - no missing assets

Owner: QA. Time-box: 5 minutes.

With the static server running, read the request list:
`browser_network_requests` with `{static: true, all: true}` on playwright, or
`list_network_requests` on chrome-devtools.

Pass condition: every request status is below 400, and the count of 404 and 500
responses is zero. Note that the Playwright `filter` parameter matches URLs, not
status codes, so read the returned list instead of filtering for "404".

Cross-check that audio files, atlases, tilemaps and the favicon each appear in
the list at least once. A game that never loads its music because the path is
wrong looks identical to a game that has no music.

## 5. Static check D - title and meta

Owner: QA. Time-box: 3 minutes.

Read in the page:

```js
() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content ?? null,
  viewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
  ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? null,
  lang: document.documentElement.lang
})
```

Pass condition: `document.title` equals the game name used in the demo script
and is not "Vite + Phaser", "Document" or empty; `description` is present and
describes the game; `viewport` includes `width=device-width`; `lang` is set.

## 6. Static check E - favicon present

Owner: QA. Time-box: 2 minutes.

Pass condition: `dist` contains an icon file or `index.html` declares
`<link rel="icon">`, the network list shows that request at status 200, and the
browser tab shows the icon rather than a default globe or page glyph.

A missing favicon is a small failure that reads as "unfinished project", so it
is a NO-GO, not a nice-to-have.

## 7. Static check F - fresh private window, cache disabled

Owner: QA. Time-box: 7 minutes.

The judge sees a cold browser with no cache, no stored state, no dev session.

- New isolated context: playwright `browser_tabs` with
  `{action: "new", url: <url>, isolatedContext: "shipcheck"}`, or chrome-devtools
  `new_page` with `{url: <url>, isolatedContext: "shipcheck"}`.
- Hard navigation with the cache bypassed: chrome-devtools `navigate_page` with
  `{type: "url", url: <url>, ignoreCache: true}`.
- No devtools protocol attached to the page beyond the automation session, no
  earlier tab reused.

Pass condition: title screen renders, the game starts and plays, console has
zero errors, zero 404s, and nothing depends on `localStorage` or cookies left
over from a previous run. A second navigation in the same isolated context must
also reach the title screen, proving the game survives its own stored state.

## 8. Performance floor

Owner: performance owner. Time-box: 10 minutes.

Target: 60 frames per second on desktop Chromium at 1280x720, which is a
16.7 ms frame budget. Gate: p95 frame time at or below 20 ms and zero frames
above 50 ms in a 10 second gameplay sample. Under 4x CPU throttle the gate is
p95 at or below 33 ms.

Measurement method, in this order:

1. Frame probe, the pass/fail number. Run through `browser_evaluate` or
   `evaluate_script` during real gameplay (step 7 of playtest-review). Both
   tools await a returned promise.

```js
() => new Promise((resolve) => {
  const t = [];
  let last = performance.now();
  let n = 0;
  function tick(now) {
    t.push(now - last);
    last = now;
    if (++n < 300) { requestAnimationFrame(tick); return; }
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

2. Trace, for the cause, not the verdict. chrome-devtools
   `performance_start_trace` before a gameplay sample, `performance_stop_trace`
   after, then `performance_analyze_insight` on the insight set the trace
   reports. Confirm the exact insight name from the trace output; insight names
   change between versions, so do not hard-code one from memory.

3. Throttled run. chrome-devtools `emulate` with `{cpuThrottlingRate: 4, pageId}`,
   then repeat the probe. Reset with `{cpuThrottlingRate: 1, pageId}`.

If the floor fails, in this order, re-measuring after each change:

1. Remove per-frame allocations and object churn in the update loop.
2. Cut particle counts and reduce emitter lifespans.
3. Reduce texture sizes and atlas count.
4. Cap `devicePixelRatio` at 2 or 1 for the canvas.
5. Reduce physics bodies or collision checks per frame.

Do not lower the target to make the row pass. If it still fails, the gate is
NO-GO, or the demo runs only on the machine where it passed and the failure is
disclosed in the pitch. Silent under-reporting is a FAIL of this checklist.

## 9. Deployment verification - required for "deployed"

Owner: QA. Time-box: 8 minutes.

A deploy is not done when the upload finishes. It is done when the live URL
passes this step.

1. Get the live URL from the deploy owner and confirm approval to publish
   already exists.
2. Open a fresh private window or a new isolated context, not a tab from the
   build session.
3. Navigate with the cache bypassed: chrome-devtools `navigate_page` with
   `{type: "url", url: <live url>, ignoreCache: true}`.
4. Run the shipped subset of the playtest matrix against the live URL: BOOT-01
   to BOOT-03, RENDER-01, INPUT-01, NET-01, CONSOLE-01, CONSOLE-02, OVER-01,
   OVER-03, PERF-01, MOBILE-01.
5. Screenshot the live title screen and the live gameplay to
   `live-title.png` and `live-gameplay.png`.
6. Record the live URL, the timestamp, and the response headers for `/` and for
   the main bundle.

Pass condition: every subset row PASS on the live URL in a cache-disabled
private window, with the screenshots and console dump saved. A pass on
localhost says nothing about the deploy and cannot substitute for this row.

If the live URL fails only for a non-game reason, such as a certificate or a
redirect loop, fix the hosting and re-run this row from step 1. Do not mark it
PASS with a caveat.

## Check table - owner and time-box

| ID | Check | Owner | Time-box | Blocking |
|---|---|---|---|---|
| BUILD-01 | dist deleted and rebuilt from clean, exit 0 | build owner | 5 min | yes |
| BUILD-02 | Two clean builds produce identical SHA256 manifests | build owner | 5 min | yes |
| STATIC-01 | dist serves and reaches title from a static server | QA | 5 min | yes |
| STATIC-02 | No absolute local paths or localhost in shipped assets | QA | 5 min | yes |
| STATIC-03 | Zero 404s and zero 500s, audio and atlases included | QA | 5 min | yes |
| META-01 | Title matches the demo name, description, viewport, lang | QA | 3 min | yes |
| META-02 | Favicon present, 200, visible in the tab | QA | 2 min | yes |
| COLD-01 | Fresh isolated context, cache bypassed, plays clean | QA | 7 min | yes |
| COLD-02 | Second navigation in the same context still reaches title | QA | included in COLD-01 | yes |
| PERF-01 | p95 at most 20 ms, zero frames above 50 ms at 1280x720 | performance owner | 6 min | yes |
| PERF-02 | p95 at most 33 ms under 4x CPU throttle | performance owner | 4 min | yes |
| LIVE-01 | Deploy approved and live URL returns 200 for `/` | build owner | 3 min | yes |
| LIVE-02 | Subset matrix PASS on live URL, cache bypassed, private window | QA | 5 min | yes |
| LIVE-03 | Live screenshots and console dump saved | QA | included in LIVE-02 | yes |

Total gate: about 45 minutes of wall clock, and it does not compress below 20
minutes because the two clean builds and the live verification are serial.

## Verdict block

Everything below goes into `ship-report.md`, and nothing else is needed:

```
TREE:      git SHA, or "no git repo" plus working tree timestamp
BUILD:     exit 0, dist/index.html present, manifests identical
STATIC:    url, status for / and for the main bundle
NET:       request count, 404 count, 500 count
META:      title, description, viewport, lang, favicon status
COLD:      isolated context name, cache bypassed yes, console errors
PERF:      p95 desktop, p95 throttled, max frame, method used
LIVE:      url, timestamp, subset rows PASS or FAIL
VERDICT:   GO or NO-GO, with failing IDs
```

## Reference

`references/pre-demo-runbook.md` is the timestamped version of this gate, from
T-60 minutes to T-0, with the owner and expected duration of each step.
