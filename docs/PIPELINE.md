# Pipeline

The product is not the form. The form is the intake. The product is what happens
after a tester presses "file".

## The chain

```
tester plays build
   -> finds a bug
   -> files a structured report (build, area, expected, actual, steps, severity)
   -> PIPELINE
        1. intake        report normalised, ref assigned
        2. reproduce     is it reproducible? steps + expected/actual + evidence
        3. severity      deterministic scoring, suggested level + confidence
        4. route         human-required vs agent-repair vs needs-more-info
        5. agent repair  a scoped work order goes to the agent team, on a branch
        6. self test     the agent team tests its own fix
        7. human review  a person confirms on a build
        8. release       merge to main, previous version untouched until now
   -> developer and agent team both work from the same reproducible artifact
```

## Two hard rules

**Rule 1 - the previous version survives.** Every repair happens on a branch
named `fix/PH-<ref>`. `main` is never touched by an agent. A fix only reaches
`main` after stage 7. That is why the demo can say "the old build still exists"
and it is literally true.

**Rule 2 - severity is computed, then owned by a human.** The pipeline produces a
score, a suggested level, a confidence number and the reasons behind it. It never
silently overrides the tester. When the two disagree, the report is flagged for a
person. Blunt, explainable, no hidden model.

## Stage 3 - how severity is scored

Deterministic, no network, no model call, reproducible for judges.

```
score = 30 base
      + category risk      shop 20, data 18, obby 16, gameplay 14,
                           performance 10, ui 8, other 6, audio 4
      + frequency          always 20, often 14, sometimes 8, once 3
      + platform           mobile 10, console 8, vr 8, pc 6
      + impact keywords    robux, purchase, lost, save, progress, crash,
                           freeze, stuck, every player  -> +8 each, max 24
clamped to 0..100

>= 85 blocker        >= 70 high        >= 52 medium        < 52 low
```

Confidence rises with evidence: at least two repro steps, a screenshot link, a
detailed actual behaviour. Below 60 the pipeline asks for more information instead
of guessing.

## Stage 4 - routing

| Condition | Route | Who acts |
| --- | --- | --- |
| confidence < 60 | needs-more-info | tester, with a specific question |
| severity blocker or high | human-required | a person decides before code changes |
| severity medium | agent-repair, human review after | agent team |
| severity low | agent-repair, auto | agent team |
| tester and pipeline disagree by 2 levels | human-required | a person breaks the tie |

## The agent team

Five OpenCode agents, each a `.md` prompt in `pipeline/agents/`, registered in
`opencode.jsonc` so they are available to the CLI and to this repo.

| Agent | Job | Output |
| --- | --- | --- |
| `reproducer` | turn the report into the shortest exact reproduction | ordered steps, preconditions |
| `severity` | challenge the pipeline score with the written severity definitions | agree or escalate, with reason |
| `fixer` | smallest change that fixes it on branch `fix/PH-<ref>` | patch + rationale |
| `selftest` | verify the fix and check for regressions | pass/fail with evidence |
| `reviewer` | gate the merge against the contract and the tests | approve or block |

They are leaves: they do not talk to the client, they do not merge, and they do
not touch `main`.

## How the demo runs

1. Play `Test build` in the app. Two variants exist: `0.5.0` with three planted
   defects, and `0.5.1` with them fixed.
2. Find one bug on stage. File it. The pipeline scores and routes it instantly.
3. Open Pipeline. Show the work order, the suggested severity, the confidence,
   and the branch that a fix must live on.
4. For one report, run the agent team from the terminal. It produces a patch on
   `fix/PH-<ref>`.
5. Move the report to Fixed. Self-test runs against `0.5.1`.
6. A human marks Verified. Only then is the change eligible for `main`.

## What is real and what is scoped

Real: intake, normalisation, reproducible report, scoring, routing, work-order
generation, branch isolation, the agent prompts, the approval gate.

Scoped for the day: the pipeline runs in the browser without a model call, and the
agent team is invoked from the CLI rather than orchestrated by a server. That is a
deliberate trade: a deterministic stage 3-4 is demoable in front of judges without
a network dependency, and the agent work stays inspectable in git.
