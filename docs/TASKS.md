# Tasks

Status legend: `todo` / `doing` / `done`. Each task has an observable check.

## Phase 0 - Foundation

| ID | Task | Check | Status |
| --- | --- | --- | --- |
| T0.1 | Repo renamed, game scaffold removed | Repo `roblox-playtest-hub`, empty tree except docs | done |
| T0.2 | Planning docs | PRD, TRD, TECHSTACK, ARCHITECTURE, DESIGN, TASKS, MEMORY exist | done |
| T0.3 | Project scaffold | `npm run build` exit 0 on an empty App | done |

## Phase 1 - Domain (pure, testable)

| ID | Task | Check | Status |
| --- | --- | --- | --- |
| T1.1 | Types and unions | `tsc --noEmit` clean | done |
| T1.2 | Severity, status, category tables | Labels, order, weights exported | done |
| T1.3 | Similarity engine | 3 fixed test vectors pass | done |
| T1.4 | Readiness scoring | Blocker caps score at 40 and verdict `not_ready` | done |
| T1.5 | Validation | Empty title rejected, valid draft accepted, bad URL rejected | done |
| T1.6 | Filters and counts | Filter by severity, status, build, assignee, search | done |

## Phase 2 - Data

| ID | Task | Check | Status |
| --- | --- | --- | --- |
| T2.1 | StorageAdapter + localStorage impl | Round-trip test passes | done |
| T2.2 | Seed data | 4 reports across obby and shop, 3 builds, 3 members | done |
| T2.3 | Repository | Corrupt JSON falls back to seed and reports why | done |
| T2.4 | Export / import / reset | Export then import round-trips without data loss | done |

## Phase 3 - UI

| ID | Task | Check | Status |
| --- | --- | --- | --- |
| T3.1 | Design tokens and base CSS | Tokens file, focus ring, reduced motion | done |
| T3.2 | App shell, header, build selector | Build filter changes the board | done |
| T3.3 | Triage board | Six columns, drag and keyboard move, history entry per move | done |
| T3.4 | Report form | Required fields enforced, duplicate suggestions live | done |
| T3.5 | Report drawer | Edit status, assignee, duplicate link, history | done |
| T3.6 | Reports table | Sort and filter, empty state names filters | done |
| T3.7 | Overview + readiness | Score, verdict, arithmetic, blocker list | done |
| T3.8 | Data view | Export, import, reset, storage disclosure | done |

## Phase 4 - Verification

| ID | Task | Check | Status |
| --- | --- | --- | --- |
| T4.1 | Unit tests | `npm run test` all green | done |
| T4.2 | Typecheck + build | `npm run typecheck` and `npm run build` exit 0 | done |
| T4.3 | Browser demo run | 3 seeded bugs, file a 4th, assign, move through flow | done |
| T4.4 | Console clean | 0 errors, 0 warnings | done |
| T4.5 | Persistence | Reload keeps new report | done |
| T4.6 | Accessibility pass | Keyboard-only file and triage a report | done |
| T4.7 | Push | `main` on GitHub matches local and builds from clean clone | done |

## Order

Phase 1 before Phase 3: the domain is the product, and it is the only part that can
be proven without a browser. Phase 2 depends on 1.1 only. Phase 3 depends on 1 and 2.
Phase 4 gates delivery.

## Cut list, in order, if the clock runs out

1. Data view import (keep export).
2. Severity bar chart.
3. Reports table sorting (keep filters).
4. Duplicate detection in the detail drawer (keep it in the form).
5. Never cut: form validation, status moves, readiness maths, persistence.
