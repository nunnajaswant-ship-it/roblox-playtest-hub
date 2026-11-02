import type { Severity } from './types';

/** Highest impact first. Used for sorting and for the form radio order. */
export const SEVERITIES: Severity[] = ['blocker', 'high', 'medium', 'low'];

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  blocker: 12,
  high: 6,
  medium: 3,
  low: 1
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  blocker: 'Blocker',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

/** Shown on the form so two testers classify the same bug the same way. */
export const SEVERITY_DEFINITION: Record<Severity, string> = {
  blocker: 'Stops the release. Data loss, Robux taken without delivery, or the experience is unplayable.',
  high: 'A core loop is broken for most players, but a workaround exists.',
  medium: 'A feature misbehaves in a way players will notice. Not release blocking.',
  low: 'Cosmetic or rare. Fix when there is time.'
};

/** CSS custom property name, not a raw colour, so the theme stays single-source. */
export const SEVERITY_COLOR_VAR: Record<Severity, string> = {
  blocker: '--sev-blocker',
  high: '--sev-high',
  medium: '--sev-medium',
  low: '--sev-low'
};

/** Shape cue so severity is never carried by colour alone. */
export const SEVERITY_GLYPH: Record<Severity, string> = {
  blocker: '\u25A0',
  high: '\u25C6',
  medium: '\u25B2',
  low: '\u25CF'
};

export function severityRank(severity: Severity): number {
  return SEVERITIES.indexOf(severity);
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === 'string' && (SEVERITIES as string[]).includes(value);
}
