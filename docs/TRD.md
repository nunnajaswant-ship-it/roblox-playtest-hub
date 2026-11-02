# TRD - Playtest Hub

How the requirements are met, and what "correct" means.

## 1. Shape of the system

A single-page client application. No server. All state lives in the browser, behind
a storage adapter that can be replaced by an HTTP client without touching the UI.

```
React views -> store (reducer) -> repository -> storage adapter -> localStorage
```

The repository is the only module that knows where data comes from. Swapping
`LocalStorageAdapter` for `HttpAdapter` is the entire backend migration.

## 2. Data model

```ts
type Severity = 'blocker' | 'high' | 'medium' | 'low';
type Category = 'gameplay' | 'obby' | 'shop' | 'ui' | 'performance' | 'audio' | 'data' | 'other';
type Status   = 'new' | 'triaged' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix';
type Platform = 'pc' | 'mobile' | 'console' | 'vr';
type Frequency = 'always' | 'often' | 'sometimes' | 'once';

interface Build   { id; version; name; releasedAt; isLive; notes }
interface Member  { id; name; role; initials; tint }
interface Entry   { at; kind: 'created'|'status'|'assignee'|'comment'|'duplicate'; text }
interface Report  {
  id; ref; title; buildId; area;
  category; severity; status; platform; frequency;
  expected; actual; steps: string[];
  screenshotUrl?; reporter; assigneeId: string|null;
  duplicateOf: string|null;
  createdAt; updatedAt; history: Entry[];
}
interface Database { schemaVersion: 1; builds: Build[]; members: Member[]; reports: Report[]; activeBuildId: string; }
```

`ref` is a human handle (`PH-104`). `id` is `crypto.randomUUID()`. The ref is what a
developer pastes into chat; the id is what the code keys on.

## 3. Algorithms

### 3.1 Duplicate detection

Deterministic, explainable, no model calls.

```
normalize(title)  = lowercase, strip punctuation, collapse spaces, drop stopwords
tokens            = set of normalized words with a trailing plural 's' removed
jaccard           = |A & B| / |A | B|
trigramDice       = 2 * |trigrams(A) & trigrams(B)| / (|trigrams(A)| + |trigrams(B)|)
score             = 0.35*jaccard + 0.15*trigramDice + 0.30*sameCategory + 0.20*sameArea
```

Text similarity alone fails on vague titles like "shop doesn't work", which are the
reports that most need help. Category and area agreement carry deliberate weight so
a vague report still surfaces the pile-up in the same place.

- Suggest when `score >= 0.55`, sorted descending, top 3, never the report itself.
- Show the percentage and a one-line reason ("same category, 3 shared words").
- Never block submit. Duplicate detection is advice.

Test vectors are fixed in `src/domain/similarity.test.ts`:

| A | B | Expectation |
| --- | --- | --- |
| Shop doesn't work | Shop purchase takes Robux but gives no item | match >= 0.55 |
| Obby stage 4 checkpoint broken | Stage 4 checkpoint does not save progress | match >= 0.55 |
| Shop takes Robux | Mobile joystick overlaps jump button | no match |

### 3.2 Release readiness

Weighted resolution for one build, with an explicit hard gate.

```
weight(blocker)=12  weight(high)=6  weight(medium)=3  weight(low)=1
openWeight   = sum of weight over reports NOT in (verified, wont_fix)
totalWeight  = sum of weight over all reports in the build
score        = totalWeight === 0 ? 100 : round(100 * (1 - openWeight / totalWeight))
if any open blocker: score = min(score, 40), verdict = 'not_ready'
else if any open high: verdict = 'at_risk'
else if any open medium: verdict = 'watch'
else verdict = 'ready'
```

This is deliberately blunt. It is a release gate, not a quality metric, and the
formula is printed in the UI so nobody has to trust a number.

## 4. State management

- One `useReducer` store. Actions are `{type, payload}`, exhaustive switch.
- Derived data (filtered reports, readiness, counts) is computed with `useMemo`,
  never stored. One source of truth.
- The selected report is an id, not an object. Deleting a report cannot leave a
  stale copy on screen.
- Persistence is debounced 200ms after any mutation.

## 5. Storage and migration

- Key: `playtest-hub.db.v1`.
- On load: parse, validate `schemaVersion`, and if the key is missing or corrupt,
  seed demo data and record the reason in `settings.lastLoadError`.
- A corrupt value is never silently overwritten without telling the user.
- Export writes a pretty JSON file with the same shape. Import validates before it
  replaces anything, and keeps the previous database in memory for one-step undo.

## 6. Validation

A single pure `validateReport(draft)` returns `{ field: message }`. The same
function runs in the form and in the import path, so both agree. Rules are in PRD
FR-2. Validation never throws.

## 7. Accessibility requirements

- Every input has a programmatic label. No placeholder-as-label.
- Severity and status are never encoded by colour alone: colour plus text.
- Board cards are focusable; `Move left` / `Move right` buttons are real buttons.
- Dialog and drawer trap focus, close on Escape, and restore focus to the trigger.
- Live regions announce "Report created", "Moved to In progress", "Assigned to X".
- Target 4.5:1 contrast for body text; 3:1 for large text and UI borders.
- `prefers-reduced-motion` disables transitions and the board drag animation.

## 8. Performance

- First contentful paint under 1.5s on a mid-range laptop over a local server.
- No layout work on scroll; the board is the only virtualisation candidate and is
  not virtualised because the demo dataset is small. State the limit: the board is
  comfortable to ~300 cards. Beyond that, add windowing.
- Bundle target: under 220 kB gzipped, which is achievable with no UI library.

## 9. Browser targets

Current Chrome, Edge, Firefox, Safari. No IE. `crypto.randomUUID` has a fallback.
Data is per-browser and per-device; this is stated in the UI, not hidden.

## 10. Test strategy

| Layer | Tool | What is proven |
| --- | --- | --- |
| Domain logic | Vitest | similarity, readiness, validation, filters, id/ref generation |
| Reducer | Vitest | every action, including history entries and duplicate flag |
| Storage | Vitest | round trip, corrupt input, schema mismatch |
| Browser | Playwright MCP | the demo scenario end to end, plus console cleanliness |

A green build is not a green product. The browser session is the acceptance gate.

## 11. Security and privacy

- No network calls at runtime. Nothing leaves the machine.
- Screenshot links are validated as http(s) and rendered as `rel="noreferrer
  noopener"` anchors. No `dangerouslySetInnerHTML` anywhere.
- No secrets, no API keys, no tokens in the bundle.
- Imported JSON is data, never code. All strings are rendered as text.
