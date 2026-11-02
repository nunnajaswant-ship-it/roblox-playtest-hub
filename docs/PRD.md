# PRD - Playtest Hub

Structured bug reports for Roblox experiences.

## 1. Problem

Roblox teams ship updates fast and hear about breakage through Discord: "the obby is
broken", "the shop doesn't work". Those messages cannot be reproduced, ranked, or
assigned. A developer loses twenty minutes asking which stage, which device, and
what they clicked, before writing a single line of a fix.

The missing artifact is not a chat. It is a **reproducible report**: which build,
which area, what should have happened, what did happen, how bad it is, and a link
to proof.

## 2. Users

| Persona | Who | Job to be done |
| --- | --- | --- |
| Tester | Playtesters, community moderators | Report a bug in 60 seconds so it survives the trip to a developer |
| Triage lead | Producer or QA lead | Decide what blocks release, spot duplicates, assign work |
| Developer | Scripter, UI artist | Get a report that can be reproduced without asking questions |

## 3. Goals

1. A tester can file a complete, structured report in under 90 seconds.
2. A triage lead can see the release picture in one screen and assign in one click.
3. Every report is tied to a build and an area, so it can be reproduced later.

## 4. Non-goals

- Not a chat app, not a Discord replacement, not real-time multiplayer.
- No Roblox API integration, no Open Cloud, no OAuth. Game data is entered by hand.
- No user accounts or permissions in v1. Identity is a name typed on the report.
- No file uploads. Screenshots are links (Roblox users already host on Discord,
  Imgur, or the Creator Hub).

## 5. Functional requirements

### FR-1 Build and version selector
- A build list with version, name, and live status.
- A global selector filters the board, the report list, and readiness.
- New reports default to the currently live build.
- `MUST` persist the last selected build across reloads.

### FR-2 Bug report form
Required: title, build, area, category, severity, expected, actual.
Optional: reproduction steps (ordered, add/remove), screenshot URL, platform,
frequency, reporter name.
- Title 8 to 100 characters.
- Expected and actual 10 to 600 characters each.
- Screenshot URL must parse as http(s) if present.
- `MUST` show possible duplicates live while the title is typed.
- `MUST` validate inline and block submit on error, without a page reload.

### FR-3 Severity and category
Severity: `blocker`, `high`, `medium`, `low`, each with a written definition so two
people classify the same bug the same way.
Category: `gameplay`, `obby`, `shop`, `ui`, `performance`, `audio`, `data`, `other`.
`MUST` be filterable, and `MUST` drive the readiness score.

### FR-4 Triage board
- Columns by status: New, Triaged, In progress, Fixed, Verified, Won't fix.
- Cards show severity, title, build, area, assignee, age.
- `MUST` move a card between columns by drag and by explicit buttons. Buttons are
  the accessible path, drag is the fast path.
- `MUST` record every move in the report history.

### FR-5 Status and assignee
- Six statuses above. Transitions are free-form but logged.
- Assignee is a member of the team or Unassigned.
- `MUST` be changeable from the board card and from the report detail.

### FR-6 Stretch - duplicate detection
- Live suggestions in the form and a duplicate banner in the detail view.
- Matching uses title similarity plus category and area agreement.
- `MUST` be explainable: show a percentage and why it matched.

### FR-7 Stretch - release readiness
- Per-build score with a verdict: Ready, Watch, At risk, Not ready.
- Lists open blockers and high severity items by name.
- Explains the arithmetic on screen. No unexplained number.

### FR-8 Persistence
- All data survives reload. Export and import as JSON. Reset to demo data.
- `MUST` state clearly that data is local to the browser.

## 6. Acceptance criteria

| ID | Criterion | How it is checked |
| --- | --- | --- |
| A1 | Three reports for obby and shop exist and render on the board | Seed data plus a browser session |
| A2 | A new report can be filed with all required fields | Form submit in the browser |
| A3 | A report can be assigned and moved New -> Triaged -> In progress | Board interaction |
| A4 | Readiness changes when a blocker is closed | Close a blocker, re-read the score |
| A5 | Duplicate suggestions appear for a near-identical title | Type "Shop purchase deducts robux no item" |
| A6 | Data survives a reload | Reload after filing |
| A7 | Keyboard-only user can file and triage a report | Tab order and Enter/Space |
| A8 | No console errors in the whole session | Browser console capture |

## 7. Demo script (2 minutes)

1. Open on the readiness dashboard. Point at the open blocker: "the shop is taking
   money and giving nothing."
2. Switch to the board. Show three reports sitting in New.
3. Assign the obby report to Abhiram. Drag it to Triaged, then In progress.
4. File a fourth report live. Type a title close to an existing one and let the
   duplicate warning fire.
5. Go back to readiness. Close the shop blocker. The score moves and the verdict
   flips. Stop talking.

## 8. Success metrics

- Median fields completed per report: at least 6.
- Duplicate suggestion accepted or dismissed: every report.
- Time from report to assigned: under 30 seconds in the demo.

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Local-only storage read as "not a real product" | Say it in the UI, and ship export/import plus a storage adapter seam |
| Severity becomes opinion | Written definitions on the form itself |
| Duplicate detection is noisy | Threshold tuned, always shows why, never blocks submit |
| Scope creep into a chat app | Non-goals are explicit, comments are a history log not a thread |
