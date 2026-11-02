# LEDGER - append only

## Wave 0 - Recon (athena)
- Project dir empty. No git repo. Node v24.18.0, npm 11.16.0, OpenCode v2.2.5.
- npm resolution: @upstash/context7-mcp 4.4.4, @playwright/mcp 0.0.84, chrome-devtools-mcp 1.12.0, oh-my-opencode 5.1.57, @pebbly/aseprite-ai-artist 0.8.2, opencode-pty 0.4.0. opencode-notifier: NOT FOUND.
- phaser latest = 4.2.1. vite latest = 8.3.5.
- Chrome NOT installed. Edge present. winget Chrome install FAILED: installer hash mismatch.
- oh-my-opencode npm description = standalone harness (OmO), not an OpenCode plugin.

## Wave 2 - Dispatch
- T2 pixel, T3 solon, T4 ariadne, T5 argus dispatched in parallel (disjoint file sets).

## Wave 2 - Returns
- T3 solon: COMPLETE. 4 files. Verified: ASCII only, frontmatter parses (runtime registered both skills).
- T4 ariadne: COMPLETE. 4 files. Verified: ASCII only, frontmatter parses.
- T5 argus: COMPLETE. 4 files. Verified: 35-check matrix, no invented tool names.
- T2 pixel: PARTIAL. Build + install verified, but browser boot unverified and dev server left running.

## Wave 3 - Integration (athena)
- Killed orphan dev server on 5173.
- Wrote global config: mcp.servers context7/playwright/chrome-devtools + plugins superpowers.
- `opencode mcp list` -> all three connected.
- Superpowers registered 16 skills.
- Verified hud.timeValue and scene.scene.isPaused() are real Phaser APIs: builder's flagged risks were false alarms.

## Wave 4 - Verification (athena)
- Playwright MCP: boot OK, Phaser 4.2.1 WebGL, 0 errors / 0 warnings, canvas 1280x720.
- Input: ArrowRight tap +4px; 600ms hold -154px (~257 px/s, matches PLAYER_SPEED 250).
- Pause: single Esc -> Pause scene, Game paused, timer frozen at 57028ms.
- Resume: Esc -> Game resumed, timer advanced.
- GameOver: endRun -> GameOver scene, data {score:42, best:42}.
- Restart: R -> Game, score 0, timer 57896ms.
- localStorage 'pixel-rush.best' = "7" after an earlier run.
- Console after full run: 0 errors, 0 warnings.

## Defect found and fixed
- Playwright MCP denies writes outside workspace roots, so evidence must live in-repo.
- Writing screenshots into the repo made Vite full-reload the page mid-playtest, which
  presented as a lost Escape keypress and a jump back to Menu.
- Fix: vite.config.js server.watch.ignored += .playwright-mcp, qa-evidence, dist.
  .gitignore updated. Re-ran the full sequence: page stayed alive (qaTag survived), all
  transitions correct.
- Corrected playtest-review and ship-checklist, which told agents to write evidence to
  %TEMP% (guaranteed to fail).

## Wave 5 - Deliver
- npm run build exit 0: dist/index.html 1.72 kB, js 1388.39 kB (gzip 363.98 kB).
- npm run preview on 4173: boots to Menu, Enter -> Game, 0 errors / 0 warnings.
- Context7 live check: resolved /phaserjs/phaser (v4.2.1) and returned version-pinned
  scene-lifecycle docs from the Phaser 4.2.1 source.
- chrome-devtools live check: navigated, screenshotted to temp, read console. 0 errors.
- AGENTS.md + docs/{design-contract,level-table,demo-script}.md written.

## Open
- Deploy URL not published: needs owner account + explicit approval.
- Game concept not chosen: design-contract is an unfilled template by design.

## Wave 6 - Shared repo (athena)
- Repo: https://github.com/nunnajaswant-ship-it/pixelrush_survey_corps (public, default branch main)
- Concept fixed from repo name: Pixel Rush - Survey Corps. Hook traversal, 5 beacons, collapse wall.
- Pushed 50 files on main (f30dab2, then e4196e0 for the PR template).
- Branches created and pushed: abhiram/levels, abhitej/feel.
- Team contract: team/abhiram (levels data), team/abhitej (audio + fx). Neither edits src/.
- npm run check:team validates both modules. It caught 2 real bounds errors in the seed level on first run.
- Clean-clone proof: fresh clone -> npm install 0, check:team PASS, npm run build 0, dist/index.html present.
- Still on the placeholder mechanic. The hook core is the next build wave.

## Open
- Repo is public. Confirm that is intended.
- Concept was inferred from the repo name. Confirm or overrule before the hook core is built.
