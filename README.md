# Playtest Hub

Structured bug reports and triage for Roblox experiences.

A tester files a report with a build, an area, expected vs actual behaviour, a
severity, and reproduction steps. A developer sees a board, assigns it, and moves
it to done. Release readiness stops being a feeling.

Built for a one-day competition from a written problem statement. React + Vite,
no backend, data in the browser behind a swappable storage adapter.

## Run it

```sh
npm install
npm run dev        # http://127.0.0.1:5173
npm run test       # 41 domain and reducer tests
npm run build      # typecheck, then static build into dist/
npm run preview    # serve dist/ on http://127.0.0.1:4173
```

## The full loop

```
play Test build  ->  find a defect  ->  file a report  ->  pipeline scores and routes
   ->  work order on branch fix/PH-<ref>  ->  agent team repairs  ->  self-test
   ->  a human marks Verified  ->  only then is a merge allowed
```

- **Test build** plays a real canvas game. Build `0.5.0` ships with three planted
  defects. Build `0.5.1` is the same scene after the fixes. The old build always
  stays playable.
- **Pipeline** shows the score, the suggested severity, the confidence, the
  reasoning, the route, and a downloadable work order. It is deterministic: no
  model call, no network, reproducible in front of a judge.
- **Agent team** lives in `pipeline/agents/` as five prompts (reproducer, severity,
  fixer, selftest, reviewer), registered in `opencode.jsonc`. They work on
  `fix/PH-<ref>` and never touch `main`.

The first load seeds three builds, three people, and eight reports so the board is
never empty. Everything persists in `localStorage`. Export from the Data tab.

## The demo, in 90 seconds

1. **Overview** - readiness 21, verdict "Not ready", one open blocker: the shop
   takes Robux and delivers nothing.
2. **Triage** - drag the stage 4 checkpoint report to Triaged, or use the arrows on
   the card. Assign it. The history records both.
3. **New report** - start typing a shop title. Duplicate detection surfaces PH-101
   at 74% with a reason. File it anyway, or mark it a duplicate.
4. **Readiness** - verify the blocker. The score moves and the verdict flips to
   "At risk". The arithmetic is printed on screen.

## What is implemented

| Requirement | Where |
| --- | --- |
| Build and version selector | header, filters every view |
| Bug report form | "New report", validated, keyboard-first |
| Severity and category | written definitions, drives the score |
| Triage board | six columns, drag and keyboard move |
| Status and assignee | board, drawer, logged in history |
| Duplicate detection (stretch) | live in the form, explainable score |
| Release readiness (stretch) | per-build score, verdict, blocker list |
| Persistence | localStorage, export, import, reset |

## Design decisions worth knowing

- **No backend.** The adapter seam in `src/data/adapter.ts` is the whole migration
  path. See `docs/ARCHITECTURE.md`.
- **A `fixed` report still counts against readiness** until it is `verified`. An
  unverified fix is not a shipped fix.
- **Duplicate detection is advice, never a gate.** It shows the percentage and the
  reason, and the tester can file anyway.
- **Severity is text plus shape plus colour.** Never colour alone.
- **Data is local to the browser.** Said in the UI, not hidden.

## Documentation

| Document | Contents |
| --- | --- |
| `docs/PRD.md` | problem, users, requirements, acceptance criteria |
| `docs/TRD.md` | data model, algorithms, validation, security, test strategy |
| `docs/TECHSTACK.md` | every choice, and what it beat |
| `docs/ARCHITECTURE.md` | layers, folders, data flow, extension points |
| `docs/DESIGN.md` | tokens, components, screens, motion, accessibility |
| `docs/TASKS.md` | the plan and its status |
| `docs/MEMORY.md` | durable context and decisions |

## Project shape

```
src/
  domain/    types, severity, status, readiness, similarity, validation, filters
  data/      storage adapter, localStorage, seed, repository
  state/     reducer, provider, actions
  components/ header, nav, board, cards, form, drawer, toasts
  views/     overview, triage, reports, readiness, data
  styles/    tokens, base, components
```

`domain/` has no React and no browser API. That is why it is fully unit tested and
why the same validation runs in the form and on import.

## Tests

`npm run test` covers duplicate scoring (including the "shop doesn't work" case),
readiness arithmetic and the blocker cap, validation, storage round-trips, corrupt
data recovery, and every reducer action.

## Licence

MIT.
