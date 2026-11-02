import type { Readiness } from '../domain/types';
import { VERDICT_COLOR_VAR, VERDICT_LABEL } from '../domain/readiness';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReadinessPanel({ readiness }: { readiness: Readiness }) {
  const color = `var(${VERDICT_COLOR_VAR[readiness.verdict]})`;
  const offset = CIRCUMFERENCE * (1 - readiness.score / 100);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="section-title">Release readiness</span>
        <span className="verdict" style={{ color }}>
          {VERDICT_LABEL[readiness.verdict]}
        </span>
      </div>

      <div className="panel-body">
        <div className="readiness">
          <div
            className="ring-wrap"
            role="img"
            aria-label={`Readiness ${readiness.score} out of 100. ${VERDICT_LABEL[readiness.verdict]}.`}
          >
            <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="var(--ink-700)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
              />
            </svg>
            <div className="ring-value">
              <span className="ring-number" style={{ color }}>
                {readiness.score}
              </span>
              <span className="ring-label">out of 100</span>
            </div>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
              <span className="chip">{readiness.openCount} open</span>
              <span className="chip">{readiness.totalCount} total</span>
              <span className="chip">{readiness.blockers.length} blockers</span>
            </div>

            <p className="hint" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              {readiness.explanation}
            </p>

            {readiness.blockers.length > 0 ? (
              <div>
                <div className="section-title" style={{ marginBottom: 6, color: 'var(--sev-blocker)' }}>
                  Open blockers
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7 }}>
                  {readiness.blockers.map((report) => (
                    <li key={report.id}>
                      <span className="mono" style={{ color: 'var(--ink-300)' }}>
                        {report.ref}
                      </span>{' '}
                      {report.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hint">No open blockers on this build.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
