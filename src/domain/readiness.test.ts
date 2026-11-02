import { describe, expect, it } from 'vitest';
import { computeReadiness } from './readiness';
import { seedDatabase } from '../data/seed';
import type { Status } from './types';

function withStatus(status: Status) {
  const db = seedDatabase();
  db.reports = db.reports.map((report) =>
    report.ref === 'PH-101' ? { ...report, status } : report
  );
  return db;
}

describe('computeReadiness', () => {
  it('is not ready while a blocker is open and caps the score at 40', () => {
    const db = seedDatabase();
    const readiness = computeReadiness(db.reports, 'b-050');

    expect(readiness.blockers).toHaveLength(1);
    expect(readiness.verdict).toBe('not_ready');
    expect(readiness.score).toBeLessThanOrEqual(40);
  });

  it('moves to at risk once the blocker is verified', () => {
    const db = withStatus('verified');
    const readiness = computeReadiness(db.reports, 'b-050');

    expect(readiness.blockers).toHaveLength(0);
    expect(readiness.verdict).toBe('at_risk');
    expect(readiness.score).toBeGreaterThan(40);
  });

  it('still counts a fixed but unverified report', () => {
    const db = withStatus('fixed');
    const readiness = computeReadiness(db.reports, 'b-050');

    expect(readiness.blockers).toHaveLength(1);
    expect(readiness.verdict).toBe('not_ready');
  });

  it('reaches 100 and ready when everything is terminal', () => {
    const db = seedDatabase();
    db.reports = db.reports.map((report) => ({ ...report, status: 'verified' as const }));
    const readiness = computeReadiness(db.reports, 'b-050');

    expect(readiness.score).toBe(100);
    expect(readiness.verdict).toBe('ready');
    expect(readiness.openCount).toBe(0);
  });

  it('ignores reports from other builds', () => {
    const db = seedDatabase();
    const scoped = computeReadiness(db.reports, 'b-041');

    expect(scoped.totalCount).toBe(1);
    expect(scoped.blockers).toHaveLength(0);
  });

  it('returns 100 for a build with no reports', () => {
    const db = seedDatabase();
    const readiness = computeReadiness(db.reports, 'b-does-not-exist');

    expect(readiness.score).toBe(100);
    expect(readiness.verdict).toBe('ready');
  });

  it('explains its arithmetic', () => {
    const db = seedDatabase();
    const readiness = computeReadiness(db.reports, 'b-050');

    expect(readiness.explanation).toContain(String(readiness.openWeight));
    expect(readiness.explanation).toContain(String(readiness.totalWeight));
  });
});
