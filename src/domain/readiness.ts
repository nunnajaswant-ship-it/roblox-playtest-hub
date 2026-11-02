import type { Readiness, Report, Verdict } from './types';
import { SEVERITY_WEIGHT } from './severity';
import { isTerminal } from './status';

export const VERDICT_LABEL: Record<Verdict, string> = {
  ready: 'Ready to release',
  watch: 'Watch',
  at_risk: 'At risk',
  not_ready: 'Not ready'
};

export const VERDICT_COLOR_VAR: Record<Verdict, string> = {
  ready: '--verdict-ready',
  watch: '--verdict-watch',
  at_risk: '--verdict-risk',
  not_ready: '--verdict-blocked'
};

/**
 * Blunt on purpose: this is a release gate, not a quality metric.
 *
 * A `fixed` report still counts. Only `verified` and `wont_fix` leave the ledger,
 * because an unverified fix is not a shipped fix.
 */
export function computeReadiness(reports: Report[], buildId: string): Readiness {
  const scoped = buildId === 'all' ? reports : reports.filter((r) => r.buildId === buildId);

  let openWeight = 0;
  let totalWeight = 0;

  for (const report of scoped) {
    const weight = SEVERITY_WEIGHT[report.severity];
    totalWeight += weight;
    if (!isTerminal(report.status)) openWeight += weight;
  }

  const open = scoped.filter((report) => !isTerminal(report.status));
  const blockers = open.filter((report) => report.severity === 'blocker');
  const highs = open.filter((report) => report.severity === 'high');

  const ratio = totalWeight === 0 ? 0 : openWeight / totalWeight;
  let score = totalWeight === 0 ? 100 : Math.round(100 * (1 - ratio));

  let verdict: Verdict;
  if (blockers.length > 0) {
    score = Math.min(score, 40);
    verdict = 'not_ready';
  } else if (highs.length > 0) {
    verdict = 'at_risk';
  } else if (open.some((report) => report.severity === 'medium')) {
    verdict = 'watch';
  } else {
    verdict = 'ready';
  }

  const explanation =
    totalWeight === 0
      ? 'No reports against this build yet, so there is nothing to hold it back.'
      : `Open weight ${openWeight} of ${totalWeight}. Score is 100 minus that share, rounded.` +
        (blockers.length > 0 ? ' An open blocker caps the score at 40.' : '');

  return {
    buildId,
    score,
    verdict,
    openWeight,
    totalWeight,
    openCount: open.length,
    totalCount: scoped.length,
    blockers,
    highs,
    explanation
  };
}
