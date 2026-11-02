import { useMemo } from 'react';
import { countsBySeverity } from '../domain/filters';
import { computeReadiness } from '../domain/readiness';
import { isTerminal } from '../domain/status';
import { useApp, useDispatch } from '../state/context';
import { ReadinessPanel } from '../components/ReadinessPanel';
import { SeverityBar } from '../components/SeverityBar';

function timeAgo(iso: string): string {
  const delta = Date.now() - Date.parse(iso);
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function OverviewView() {
  const { db } = useApp();
  const dispatch = useDispatch();

  const scoped = useMemo(
    () =>
      db.activeBuildId === 'all'
        ? db.reports
        : db.reports.filter((report) => report.buildId === db.activeBuildId),
    [db.reports, db.activeBuildId]
  );

  const readiness = useMemo(
    () => computeReadiness(db.reports, db.activeBuildId),
    [db.reports, db.activeBuildId]
  );

  const counts = useMemo(() => countsBySeverity(scoped), [scoped]);
  const open = scoped.filter((report) => !isTerminal(report.status));
  const unassigned = open.filter((report) => report.assigneeId === null);
  const verified = scoped.filter((report) => report.status === 'verified');

  const recent = useMemo(() => {
    return scoped
      .flatMap((report) =>
        report.history.map((entry) => ({ entry, report }))
      )
      .sort((a, b) => Date.parse(b.entry.at) - Date.parse(a.entry.at))
      .slice(0, 7);
  }, [scoped]);

  const buildName =
    db.activeBuildId === 'all'
      ? 'all builds'
      : db.builds.find((build) => build.id === db.activeBuildId)?.version ?? 'this build';

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Release overview</h1>
          <p className="view-sub">
            What {buildName} looks like right now, and what is holding it back.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: 'view/set', view: 'triage' })}
        >
          Open triage board
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Open</span>
          <span className="stat-value">{open.length}</span>
          <span className="stat-hint">not verified or closed</span>
        </div>
        <div className="stat">
          <span className="stat-label">Blockers</span>
          <span className="stat-value" style={{ color: readiness.blockers.length ? 'var(--sev-blocker)' : undefined }}>
            {readiness.blockers.length}
          </span>
          <span className="stat-hint">stop the release</span>
        </div>
        <div className="stat">
          <span className="stat-label">Unassigned</span>
          <span className="stat-value">{unassigned.length}</span>
          <span className="stat-hint">nobody owns these yet</span>
        </div>
        <div className="stat">
          <span className="stat-label">Verified</span>
          <span className="stat-value" style={{ color: 'var(--verdict-ready)' }}>
            {verified.length}
          </span>
          <span className="stat-hint">confirmed on a build</span>
        </div>
      </div>

      <ReadinessPanel readiness={readiness} />

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Severity spread</span>
          <span className="hint">{scoped.length} reports</span>
        </div>
        <div className="panel-body">
          <SeverityBar counts={counts} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Recent activity</span>
        </div>
        <div className="panel-body">
          <div className="timeline">
            {recent.map(({ entry, report }) => (
              <div className="timeline-item" key={entry.id}>
                <span className={`timeline-dot is-${entry.kind}`} aria-hidden="true" />
                <div>
                  <div className="timeline-text">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 0, height: 'auto', color: 'var(--accent)' }}
                      onClick={() => dispatch({ type: 'report/select', id: report.id })}
                    >
                      {report.ref}
                    </button>{' '}
                    {entry.text}
                  </div>
                  <div className="timeline-at">
                    {entry.by} - {timeAgo(entry.at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
