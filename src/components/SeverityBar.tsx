import type { Severity } from '../domain/types';
import { SEVERITIES, SEVERITY_COLOR_VAR, SEVERITY_LABEL } from '../domain/severity';

export function SeverityBar({ counts }: { counts: Record<Severity, number> }) {
  const total = SEVERITIES.reduce((sum, severity) => sum + counts[severity], 0);

  return (
    <div>
      <div className="sevbar" role="img" aria-label={describe(counts, total)}>
        {total === 0 ? null : (
          SEVERITIES.map((severity) =>
            counts[severity] === 0 ? null : (
              <span
                key={severity}
                className="sevbar-seg"
                style={{
                  flex: counts[severity],
                  background: `var(${SEVERITY_COLOR_VAR[severity]})`
                }}
                title={`${SEVERITY_LABEL[severity]}: ${counts[severity]}`}
              />
            )
          )
        )}
      </div>

      <div className="sevbar-legend">
        {SEVERITIES.map((severity) => (
          <span className="legend-item" key={severity}>
            <span
              className="sev-dot"
              style={{ background: `var(${SEVERITY_COLOR_VAR[severity]})` }}
              aria-hidden="true"
            />
            {SEVERITY_LABEL[severity]} {counts[severity]}
          </span>
        ))}
      </div>
    </div>
  );
}

function describe(counts: Record<Severity, number>, total: number): string {
  if (total === 0) return 'No reports in this build';
  return SEVERITIES.map((severity) => `${counts[severity]} ${SEVERITY_LABEL[severity]}`).join(', ');
}
