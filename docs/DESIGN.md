# Design

A QA tool that looks like an instrument panel, not an admin template. Dense, calm,
and readable under pressure.

## 1. Principles

1. **Severity is the loudest thing on screen.** Colour and shape, never colour alone.
2. **Numbers explain themselves.** Every score shows its arithmetic.
3. **One accent.** Cyan means interactive. Everything else is neutrally weighted.
4. **No decoration that costs a frame.** No blur stacks, no parallax, no glass.

## 2. Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ink-900` | `#080b11` | page background |
| `--ink-800` | `#0d121b` | panel |
| `--ink-700` | `#131a26` | raised panel, input |
| `--ink-600` | `#1c2534` | borders |
| `--ink-400` | `#4a5a72` | disabled text |
| `--text-200` | `#c3d0e2` | secondary text |
| `--text-100` | `#eef3fa` | primary text |
| `--accent` | `#38e8ff` | interactive, focus |
| `--accent-ink` | `#04222b` | text on accent |

Severity:

| Severity | Colour | Shape cue |
| --- | --- | --- |
| blocker | `#ff4d6d` | filled square, 4px left bar |
| high | `#ff9f43` | filled diamond, 4px left bar |
| medium | `#ffd166` | filled triangle, 4px left bar |
| low | `#6ea8ff` | filled circle, 4px left bar |

Verdicts: ready `#3ddc97`, watch `#ffd166`, at risk `#ff9f43`, not ready `#ff4d6d`.

Contrast: body text 12.9:1, secondary 7.1:1, accent on ink 10.4:1. All above 4.5:1.

## 3. Type

| Role | Size / line | Weight | Family |
| --- | --- | --- | --- |
| Page title | 28 / 34 | 650 | system sans |
| Section title | 15 / 20 | 600 | system sans |
| Body | 14 / 21 | 400 | system sans |
| Small | 12 / 17 | 450 | system sans |
| Micro / ref | 11 / 14 | 600 | system mono, letter-spacing .04em |

Numerals in scores and counts use `font-variant-numeric: tabular-nums`.

## 4. Space and shape

- 4px base scale: 4, 8, 12, 16, 20, 24, 32, 48.
- Radii: 6px controls, 10px panels, 999px pills.
- Border: 1px `--ink-600`. No shadows except the drawer, which uses one soft edge.
- Density: board columns 300px min, cards 96px tall at rest.

## 5. Layout

```
+------------------------------------------------------------------+
| logo  Playtest Hub      [build v0.5.0 Obby Rework v]   [New +]   |
+----------+-------------------------------------------------------+
| Overview |                                                       |
| Triage   |   <view content>                                      |
| Reports  |                                                       |
| Readiness|                                                       |
| Data     |                                                       |
+----------+-------------------------------------------------------+
```

- Sidebar 208px, collapsible under 900px into a horizontal tab strip.
- Board scrolls horizontally on narrow screens; columns keep 300px.
- Max content width 1440px, then centred.

## 6. Components

| Component | Notes |
| --- | --- |
| `SeverityBadge` | left bar + glyph + label; the glyph carries meaning without colour |
| `StatusPill` | text pill, terminal states get a muted fill |
| `ReportCard` | severity bar, title, ref, build, area, assignee, age, move buttons |
| `ReadinessPanel` | ring, verdict, arithmetic line, blocker list |
| `ReportDrawer` | `<dialog>`, two-column on wide, stacked on narrow |
| `ReportForm` | fieldset groups, inline errors, live duplicate slot |
| `Toast` | bottom right, one at a time, 4s, dismissible |

## 7. Screens

### Overview
Readiness panel (ring + verdict), four stat tiles (open, blockers, unassigned,
verified this build), severity bar, recent activity list.

```
+---------------------+  +--------+ +--------+ +--------+
|  READINESS  62      |  | open 9 | | blk 1  | | unass 3|
|  AT RISK            |  +--------+ +--------+ +--------+
|  blockers: 1        |
|  12+6+3+1 math line |
+---------------------+
| severity  [====--]  |  | recent activity            |
```

### Triage
Six columns, horizontal scroll. Column header: name, count, severity dots.
Cards are draggable and keyboard-movable.

### Reports
Table: ref, title, build, area, category, severity, status, assignee, updated.
Sortable by updated and severity. Filters in a sticky toolbar. Empty state names
the filters.

### Readiness
Per-build breakdown, a table of open blockers and high items, and the formula in
plain words.

### Data
Export, import, reset to demo, schema version, storage key, and the sentence that
data lives in this browser only.

### New report (dialog)
Title, build, area, category, severity (radio cards with definitions), expected,
actual, steps (ordered, add/remove), screenshot URL, platform, frequency, reporter.
Duplicate suggestions appear under the title as you type.

## 8. Motion

- 120ms ease-out for hover, 180ms for panel and drawer entry.
- The board card lifts 1px on drag start, nothing else.
- Score ring animates once on mount, 400ms, and only if motion is allowed.
- `prefers-reduced-motion: reduce` removes all of the above, keeping state changes
  instant and still announced.

## 9. Accessibility

- Focus ring: 2px `--accent` with 2px offset, always visible on keyboard focus.
- The board never requires a mouse: each card has Move left / Move right.
- Severity and status always carry a text label.
- Toasts and status changes use `aria-live="polite"`.
- Dialogs use native `<dialog>` with `showModal()`.
- Form errors are linked with `aria-describedby` and announced on submit.

## 10. Responsive

| Width | Behaviour |
| --- | --- |
| >= 1200 | full sidebar, 3-up stat tiles, drawer 720px |
| 900-1199 | sidebar collapses to icons plus labels on hover, drawer 560px |
| < 900 | tab strip, board scrolls horizontally, form is single column |
| < 600 | stat tiles stack, table becomes cards |

## 11. Copy voice

Short, factual, no exclamation marks. "Report created" not "Awesome! Bug logged!".
Severity definitions are written so a tester can self-classify in one read.
