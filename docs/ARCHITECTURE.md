# Architecture

## 1. Layers

```
+-----------------------------------------------------------+
|  views/        Overview  Triage  Reports  Readiness  Data |
|  components/   Board  Card  Form  Drawer  Chips  Dialogs  |
+-----------------------------------------------------------+
|  state/        store.tsx  (useReducer, actions, selectors) |
+-----------------------------------------------------------+
|  domain/       types  severity  readiness  similarity      |
|                validation  filters  ids                    |
|                pure functions, no React, no browser        |
+-----------------------------------------------------------+
|  data/         repository.ts  ->  StorageAdapter           |
|                seed.ts        ->  LocalStorageAdapter      |
+-----------------------------------------------------------+
|  browser       localStorage                                |
+-----------------------------------------------------------+
```

Dependencies point down only. `domain/` imports nothing above it, which is why it
is trivially unit-testable and why the same validation runs in the form and in the
import path.

## 2. Folder structure

```
src/
  main.tsx                 mount
  App.tsx                  shell: header, nav, view switch, dialogs
  domain/
    types.ts               every interface and union
    severity.ts            weights, order, labels, descriptions
    status.ts              columns, order, labels, terminal states
    category.ts            labels and hints
    readiness.ts           score + verdict + explanation
    similarity.ts          tokeniser, trigram dice, duplicate scoring
    validation.ts          validateReport, validateImport
    filters.ts             applyFilters, countsBySeverity
    ids.ts                 nextRef, uuid fallback
  data/
    adapter.ts             StorageAdapter interface
    localStorageAdapter.ts read/write/remove, quota + corrupt handling
    seed.ts                demo builds, members, reports
    repository.ts          load/save/export/import with validation
  state/
    store.tsx              reducer, provider, useApp, useDispatch
    actions.ts             action union
  components/
    AppHeader.tsx  Nav.tsx  BuildSelector.tsx
    Board.tsx  BoardColumn.tsx  ReportCard.tsx
    ReportForm.tsx  Field.tsx
    ReportDrawer.tsx  HistoryList.tsx
    SeverityBadge.tsx  StatusPill.tsx  Avatar.tsx
    EmptyState.tsx  Toast.tsx  ConfirmDialog.tsx
    ReadinessPanel.tsx  SeverityBar.tsx
  views/
    OverviewView.tsx  TriageView.tsx  ReportsView.tsx
    ReadinessView.tsx  DataView.tsx
  styles/
    tokens.css  base.css  components.css
```

## 3. Data flow

```
user action
   -> dispatch({type:'report/update', ...})
   -> reducer returns new Database + history entry
   -> provider re-renders
   -> useEffect sees a new database version
   -> repository.save(db)  (debounced 200ms)
   -> LocalStorageAdapter.write()
```

There is no optimistic UI and no server, so no conflict resolution. Save failures
(quota, private mode) surface as a toast and mark the store dirty; the UI keeps
working in memory.

## 4. The adapter seam

```ts
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}
```

`repository.ts` depends only on this interface. A future backend is one new file:

```ts
export class HttpAdapter implements StorageAdapter { /* fetch */ }
```

No view changes. This is the answer to "how would this become multiplayer".

## 5. Rendering strategy

- One page, five views, switched by state. No router.
- The board renders columns of cards. Not virtualised; the stated limit is ~300
  cards, well past the demo.
- The report drawer is a `<dialog>` element, so focus trapping and Escape come from
  the platform rather than from a library.
- Every list has a stable key (`report.id`), never an index.

## 6. Error and empty states

| Situation | Behaviour |
| --- | --- |
| No reports match filters | Empty state naming the active filters, plus "Clear filters" |
| Storage corrupt | Load demo data, banner explains what happened, export offered first |
| Storage write fails | Toast, in-memory data intact, "Export now" action |
| Screenshot URL invalid | Inline field error, submit blocked |
| Import invalid | Nothing replaced, field-level reasons listed |

## 7. Extension points

1. **Backend**: implement `StorageAdapter`; repository is unchanged.
2. **Auth**: add `actor` to actions; the history already stores a `by` string.
3. **Attachments**: `screenshotUrl` becomes `attachments: string[]`; the adapter
   gains an upload method.
4. **Build comparison**: readiness already takes `(reports, buildId)`; call it twice.
5. **Notifications**: subscribe to reducer effects in the provider.

## 8. Why no server

The product's value is the report structure, not the storage. A server would add a
deployment dependency, a failure mode, and a login screen to a demo that has three
minutes. The adapter seam keeps the design honest: local-first now, network later,
same UI.
