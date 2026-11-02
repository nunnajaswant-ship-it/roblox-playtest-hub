import { useMemo } from 'react';
import { computeReadiness, VERDICT_LABEL } from '../domain/readiness';
import { SEVERITY_WEIGHT } from '../domain/severity';
import { useApp, useDispatch } from '../state/context';
import { ReadinessPanel } from '../components/ReadinessPanel';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusPill } from '../components/StatusPill';

export function ReadinessView() {
  const { db } = useApp();
  const dispatch = useDispatch();

  const readiness = useMemo(
    () => computeReadiness(db.reports, db.activeBuildId),
    [db.reports, db.activeBuildId]
  );

  const build =
    db.activeBuildId === 'all'
      ? null
      : db.builds.find((item) => item.id === db.activeBuildId) ?? null;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Release readiness</h1>
          <p className="view-sub">
            {build
              ? `${build.version} ${build.name}${build.isLive ? ' - live' : ''}`
              : 'All builds combined'}
          </p>
        </div>
      </div>

      <ReadinessPanel readiness={readiness} />

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">How this number is made</span>
        </div>
        <div className="panel-body stack">
          <div className="formula">
            weight: blocker {SEVERITY_WEIGHT.blocker} / high {SEVERITY_WEIGHT.high} / medium{' '}
            {SEVERITY_WEIGHT.medium} / low {SEVERITY_WEIGHT.low}
            <br />
            open weight = {readiness.openWeight}, total weight = {readiness.totalWeight}
            <br />
            score = round(100 * (1 - open / total)) = {readiness.score}
            <br />
            an open blocker caps the score at 40. a fixed but unverified report still counts.
          </div>
          <p className="hint">
            Verdict: <strong>{VERDICT_LABEL[readiness.verdict]}</strong>. The score is a release
            gate, not a quality metric. Use the board to clear blockers first.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Open high severity</span>
          <span className="hint">{readiness.highs.length} reports</span>
        </div>
        <div className="panel-body">
          {readiness.highs.length === 0 ? (
            <p className="hint">No open high severity reports.</p>
          ) : (
            <div className="table-wrap">
              <table className="reports" style={{ minWidth: 620 }}>
                <thead>
                  <tr>
                    <th scope="col">Ref</th>
                    <th scope="col">Report</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readiness.highs.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => dispatch({ type: 'report/select', id: report.id })}
                    >
                      <td className="mono" style={{ color: 'var(--ink-300)', fontSize: 11 }}>
                        {report.ref}
                      </td>
                      <td className="title-cell">
                        <button
                          type="button"
                          className="linkish"
                          onClick={(event) => {
                            event.stopPropagation();
                            dispatch({ type: 'report/select', id: report.id });
                          }}
                        >
                          {report.title}
                        </button>
                      </td>
                      <td>
                        <SeverityBadge severity={report.severity} />
                      </td>
                      <td>
                        <StatusPill status={report.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
