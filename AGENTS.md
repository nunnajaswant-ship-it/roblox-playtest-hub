# AGENTS.md - Pixel Rush

Read this before touching code. It is the repo contract for every agent and every
human on this build, regardless of which tool you run.

## What this is

A Phaser 4.2.1 + Vite 8 HTML5 game for a one-day competition. Plain JavaScript,
no backend. The scaffold in `src/` is a concept-agnostic shell: Boot -> Preload ->
Menu -> Game -> Pause -> GameOver, with a placeholder mechanic that is meant to
be replaced.

## Commands

```sh
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # emits dist/
npm run preview  # serves dist/ on http://127.0.0.1:4173
```

## Squad law - load the skill before the work

The six skills in `.opencode/skills/` are binding, not advisory:

| Skill | Load it before |
| --- | --- |
| `game-design` | Choosing the concept, or proposing any feature |
| `level-design` | Laying out sections, waves, hazards, checkpoints |
| `game-juice` | Any polish, feedback, audio, or transition work |
| `demo-script` | Writing or rehearsing the pitch |
| `playtest-review` | Claiming any feature is done |
| `ship-checklist` | Any demo, submission, or deploy |

OpenCode discovers these automatically. Other tools must read the `SKILL.md`
files directly. If a skill and this file disagree, the skill wins.

## Definition of done

A feature is done when `playtest-review` has produced browser evidence for it:
screenshots, quoted console output, and a pass/fail row per check. A green build
is not evidence that the game plays. Zero console errors is a gate, not a bonus.

## Hard rules

- Exactly one core mechanic. Variations only. See `game-design`.
- No new dependency without a one-line reason in the commit message.
- Never commit `node_modules/`, `dist/`, or `.playwright-mcp/`.
- Keep gameplay tunables in `src/config.js`, not inline in scenes.
- Write plain ASCII in code and docs. Use hyphens, not em dashes.
- No placeholder shipped as final. The placeholder mechanic must be deleted, not
  relabelled.
- Deploying to a public URL needs the owner's explicit approval. Building and
  previewing do not.

## File ownership

Do not edit a file another worker owns. Coordinate through the owner:

- `src/scenes/**`, `src/ui/**`, `src/config.js`, `src/main.js` - the build owner
- `.opencode/skills/**` - the skill authors, one directory each
- `.opencode/company/**` - the orchestrator only
- `docs/**` - the design owner

## Browser QA notes

- Playwright MCP refuses writes outside the workspace root. Screenshots go to
  `.playwright-mcp/evidence/<stamp>/`.
- `vite.config.js` ignores `.playwright-mcp/**` in `server.watch`. Do not remove
  that ignore: writing a screenshot into the project otherwise full-reloads the
  page mid-playtest and looks exactly like a dropped keypress.
- Chrome is not installed. Both browser servers drive Playwright's Chromium, and
  playwright is configured for the installed Edge channel.
- `?debug` exposes the Phaser game as `window.__PIXEL_RUSH__` and shows an FPS
  counter. Use it to read scene and player state during playtests.

## Current state

The game concept is not chosen. Before gameplay code changes, fill
`docs/design-contract.md` and `docs/level-table.md`, then build against them.
