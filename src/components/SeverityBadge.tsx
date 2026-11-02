import type { Severity } from '../domain/types';
import { SEVERITY_COLOR_VAR, SEVERITY_GLYPH, SEVERITY_LABEL } from '../domain/severity';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const color = `var(${SEVERITY_COLOR_VAR[severity]})`;

  return (
    <span className="sev-badge" style={{ color }}>
      <span aria-hidden="true">{SEVERITY_GLYPH[severity]}</span>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
