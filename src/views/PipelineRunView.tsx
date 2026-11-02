import { useEffect, useMemo, useState } from 'react';
import { useApp, useDispatch } from '../state/context';
import { analyze } from '../pipeline/triage';
import { SEVERITY_LABEL } from '../domain/severity';

interface Line {
  title: string;
  detail: string;
  tone: 'info' | 'ok' | 'warn' | 'stop';
}

export function PipelineRunView() {
  const { db, runId } = useApp();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);

  const report = db.reports.find((item) => item.id === runId) ?? null;
  const build = db.builds.find((item) => item.id === report?.buildId);

  const triage = useMemo(
    () => (report ? analyze(report, build) : null),
    [report, build]
  );

  useEffect(() => {
    setStep(0);
  }, [runId]);

  const lines: Line[] = useMemo(() => {
    if (!report || !triage) return [];
    const humanNeeded = triage.route === 'human_required';

    return [
      {
        title: 'Intake',
        detail: `${report.ref} received from ${report.reporter} against ${build?.version ?? 'a build'} - ${report.area}.`,
        tone: 'info'
      },
      {
        title: 'Reproducible report',
        detail:
          report.steps.length >= 2
            ? `${report.steps.length} steps, expected and actual present. This can be reproduced.`
            : 'Not enough steps. The pipeline would send one question back to the tester.',
        tone: report.steps.length >= 2 ? 'ok' : 'warn'
      },
      {
        title: 'Severity',
        detail: `Scored ${triage.score}/100, suggests ${SEVERITY_LABEL[triage.suggested]}, confidence ${triage.confidence}%.`,
        tone: 'info'
      },
      {
        title: 'Route',
        detail: triage.routeDetail,
        tone: humanNeeded ? 'warn' : 'ok'
      },
      {
        title: 'Work order',
        detail: `Generated for branch ${triage.branch}. main is untouched.`,
        tone: 'ok'
      },
      {
        title: 'Agent team assigned',
        detail: 'reproducer, severity, fixer, selftest, reviewer - queued against the work order.',
        tone: 'info'
      },
      {
        title: 'Self-test',
        detail: 'Runs after the patch. It cannot pass without executing the reproduction.',
        tone: 'info'
      },
      {
        title: 'Human review',
        detail: 'Blocked. A person must confirm the fix on a build and mark it Verified.',
        tone: 'warn'
      },
      {
        title: 'Release',
        detail: humanNeeded
          ? 'Not eligible yet. This route needs a person to decide the approach first.'
          : 'Eligible to merge only after the human Verified mark.',
        tone: 'stop'
      }
    ];
  }, [report, triage, build]);

  useEffect(() => {
    if (lines.length === 0) return;
    if (step >= lines.length) return;
    const timer = setTimeout(() => setStep((current) => current + 1), 1150);
    return () => clearTimeout(timer);
  }, [step, lines.length]);

  if (!report || !triage) {
    return (
      <div className="run">
        <div className="run-inner">
          <h1 className="run-title">No report in the pipeline</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'run/finish' })}
          >
            Open the workspace
          </button>
        </div>
      </div>
    );
  }

  const done = step >= lines.length;
  const pct = Math.round((Math.min(step, lines.length) / lines.length) * 100);

  return (
    <div className="run">
      <div className="run-inner">
        <div className="run-head">
          <div>
            <div className="run-eyebrow">Pipeline run</div>
            <h1 className="run-title">
              {report.ref} - {report.title}
            </h1>
            <div className="run-sub">
              {build ? `${build.version} ${build.name}` : 'unknown build'} / {report.area} /{' '}
              {report.reporter}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dispatch({ type: 'run/finish' })}
          >
            Skip walkthrough
          </button>
        </div>

        <div className="run-bar" aria-hidden="true">
          <div className="run-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="run-grid">
          <ol className="run-stages">
            {lines.map((line, index) => {
              const state = index < step ? 'done' : index === step ? 'active' : 'pending';
              return (
                <li key={line.title} className={`run-stage is-${state}`}>
                  <span className="run-dot" aria-hidden="true" />
                  <div>
                    <div className="run-stage-title">{line.title}</div>
                    <div className="run-stage-detail">{line.detail}</div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="run-console" aria-live="polite">
            <div className="run-console-head">pipeline.log</div>
            <div className="run-console-body">
              {lines.slice(0, step).map((line) => (
                <div key={line.title} className={`run-line tone-${line.tone}`}>
                  <span className="run-line-tag">{line.title}</span>
                  {line.detail}
                </div>
              ))}
              {!done ? <div className="run-cursor">_</div> : null}
            </div>
          </div>
        </div>

        {done ? (
          <div className="run-result">
            <div>
              <div className="run-eyebrow">Outcome</div>
              <div className="run-result-route">{triage.routeLabel}</div>
              <div className="run-sub">
                Branch {triage.branch}. Nothing merges without a human Verified mark.
              </div>
            </div>
            <div className="row">
              <button
                type="button"
                className="btn"
                onClick={() => dispatch({ type: 'form/open' })}
              >
                Report another bug
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => dispatch({ type: 'run/finish' })}
              >
                Open the workspace
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
