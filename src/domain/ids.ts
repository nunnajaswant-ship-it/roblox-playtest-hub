import type { Report } from './types';

/** `crypto.randomUUID` is missing on some insecure origins. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Human handles are sequential per repo: PH-101, PH-102, ...
 * Derived from existing refs so an import cannot produce a collision.
 */
export function nextRef(reports: Report[]): string {
  let highest = 100;
  for (const report of reports) {
    const match = /^PH-(\d+)$/.exec(report.ref);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `PH-${highest + 1}`;
}
