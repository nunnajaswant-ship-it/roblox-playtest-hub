# Memory

Durable context for anyone - human or agent - who opens this repo later. Append,
never rewrite history. Newest context at the bottom.

## What this is

**Playtest Hub** - a structured bug reporting and triage tool for Roblox
experiences. Built for a one-day competition from a written problem statement.
Static React app, no backend, data in the browser behind a swappable adapter.

Repo: https://github.com/nunnajaswant-ship-it/roblox-playtest-hub

## Why it exists

The brief: teams hear "the obby is broken" in Discord and cannot act on it. The
tool turns that into a report with a build, an area, expected vs actual, severity,
reproduction steps, and a screenshot link, then lets a developer triage and assign.

## Decisions that must not be silently reversed

| # | Decision | Reason | Date |
| --- | --- | --- | --- |
| M1 | Repo renamed from `pixelrush_survey_corps` to `roblox-playtest-hub` | The old name described a game that is not being built | 2026-11-02 |
| M2 | Pivoted from a Phaser game to this tool | The actual problem statement is the bug tracker | 2026-11-02 |
| M3 | No backend; `StorageAdapter` seam instead | A server adds auth and deploy risk to a one-day demo | 2026-11-02 |
| M4 | No Tailwind, no component library | ~30 tokens; a library would make it look like every admin panel | 2026-11-02 |
| M5 | Hand-rolled SVG instead of a chart library | Two shapes do not justify 40 kB | 2026-11-02 |
| M6 | Severity is `blocker/high/medium/low`, weights 12/6/3/1 | Blunt, explainable, printed in the UI | 2026-11-02 |
| M7 | A `fixed` report is still open for readiness until `verified` | An unverified fix is not a released fix | 2026-11-02 |
| M8 | Duplicate detection is advisory, never blocking | False positives must not stop a tester filing | 2026-11-02 |

## Gotchas discovered while building

- `localStorage` throws in some privacy modes. Every write is wrapped and surfaces
  a toast; the app keeps working in memory.
- The board must not require drag. Keyboard move buttons are the accessible path and
  the demo path, because drag is unreliable on a projector.
- Imported JSON is untrusted data. It is validated before replacing anything, and
  all strings render as text.
- `crypto.randomUUID` is missing on insecure origins in some browsers. A fallback
  exists in `domain/ids.ts`.

## Where things live

| Question | File |
| --- | --- |
| What are we building and why | `docs/PRD.md` |
| What does correct mean | `docs/TRD.md` |
| Why these libraries | `docs/TECHSTACK.md` |
| How is it structured | `docs/ARCHITECTURE.md` |
| What does it look like | `docs/DESIGN.md` |
| What is the plan and status | `docs/TASKS.md` |
| Durable memory | this file |

## Current state

See the status table in `docs/TASKS.md`. If it disagrees with this file, TASKS.md
wins for progress and this file wins for intent.

## How to continue

1. `npm install`
2. `npm run test` - domain logic must be green before touching UI.
3. `npm run dev` - open 5173, run the demo scenario in PRD section 7.
4. Any new number shown to a user must explain itself on screen.

## Build log

- 2026-11-02: Pivot completed. Game scaffold removed, Playtest Hub built on React 19 + Vite 8 + TS 7.
- Domain first: similarity, readiness, validation, filters, then storage, then UI. 41 tests.
- Verified in a real browser: seeded board, drag/select triage, live form, duplicate
  match at 74 percent with a reason, report created as PH-109, persistence across reload,
  readiness 18 -> 48 when the blocker was verified, keyboard N and Escape, mobile 375px.

## Defects found and fixed during verification

| Symptom | Cause | Fix |
| --- | --- | --- |
| Readiness showed 0/100 | every report on the live build was open | added two verified reports so the score is meaningful |
| Mobile page 604px wide on a 375px screen | grid items default to min-width auto; centered grid items size to max-content | minmax(0,1fr) tracks, min-width 0 on main/header/nav, justify-items stretch |
| Header overflowed at 375px | fixed-width brand, picker and button | collapse brand name, let the picker shrink with a 96px floor |
| Console error "useStore must be used inside StoreProvider" after editing state | Fast Refresh cannot hot-swap a module that exports both a component and hooks, so consumers read a null context | split into `reducer.ts`, `context.ts`, `StoreProvider.tsx`. Verified by editing the provider while the page was live: clean HMR, no error |

## Known limits

- Single browser, single device. No multi-user sync. The adapter seam is the path.
- Board is comfortable to about 300 cards, then it needs windowing.
- No auth. The actor is a constant in src/config.ts.
- Import replaces the whole database; there is no merge.

## Scale-up: the pipeline (2026-11-02)

- Added a playable test build with two variants: 0.5.0 (three planted defects) and
  0.5.1 (fixed). The old build stays playable, which is the version-safety story.
- Added the pipeline: deterministic score, suggested severity, confidence,
  route, eight stages, downloadable work order, branch fix/PH-<ref>.
- Added five agent prompts in pipeline/agents/ registered in opencode.jsonc:
  reproducer, severity, fixer, selftest, reviewer. Leaves only. Never main.
- Rule: a fix lives on a branch and only a human Verified mark unlocks merge.
- Verified in browser: 7 nav views, canvas game ticks, pipeline scores 92 and
  routes correctly, 0 console errors.

## Deliberate scope for a 20 minute build

- Pipeline stages 3-4 are rules, not a model call. Fast, offline, explainable.
- The agent team runs from the CLI; it is not orchestrated by a server.
- The test build's defects are planted, not emergent, so the demo is repeatable.
