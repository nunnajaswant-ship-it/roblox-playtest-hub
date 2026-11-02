import { describe, expect, it } from 'vitest';
import { emptyDraft, hasErrors, validateDatabase, validateReport } from './validation';
import { seedDatabase } from '../data/seed';

const valid = {
  ...emptyDraft('b-050'),
  title: 'Shop purchase takes Robux and gives nothing',
  area: 'Checkout',
  expected: 'The item appears in the inventory immediately.',
  actual: 'Robux are taken and the inventory stays empty.',
  reporter: 'Nunna'
};

describe('validateReport', () => {
  it('accepts a complete draft', () => {
    expect(validateReport(valid)).toEqual({});
    expect(hasErrors(validateReport(valid))).toBe(false);
  });

  it('rejects an empty draft', () => {
    const errors = validateReport(emptyDraft('b-050'));
    expect(errors.title).toBeDefined();
    expect(errors.expected).toBeDefined();
    expect(errors.actual).toBeDefined();
    expect(errors.reporter).toBeDefined();
  });

  it('rejects a title that is too short to be useful', () => {
    const errors = validateReport({ ...valid, title: 'shop' });
    expect(errors.title).toContain('8');
  });

  it('rejects a non-http screenshot link', () => {
    const errors = validateReport({ ...valid, screenshotUrl: 'javascript:alert(1)' });
    expect(errors.screenshotUrl).toBeDefined();
  });

  it('accepts an https screenshot link', () => {
    const errors = validateReport({ ...valid, screenshotUrl: 'https://example.com/a.png' });
    expect(errors.screenshotUrl).toBeUndefined();
  });

  it('allows an empty step list', () => {
    const errors = validateReport({ ...valid, steps: [] });
    expect(errors.steps).toBeUndefined();
  });

  it('rejects empty steps mixed with real ones', () => {
    const errors = validateReport({ ...valid, steps: ['Join', '  '] });
    expect(errors.steps).toBeDefined();
  });
});

describe('validateDatabase', () => {
  it('accepts the seed database', () => {
    const result = validateDatabase(seedDatabase());
    expect(result.ok).toBe(true);
  });

  it('rejects a wrong schema version', () => {
    const broken = { ...seedDatabase(), schemaVersion: 2 };
    const result = validateDatabase(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain('schemaVersion');
  });

  it('rejects a report with an unknown severity', () => {
    const db = seedDatabase();
    (db.reports[0] as unknown as { severity: string }).severity = 'catastrophic';
    const result = validateDatabase(db);
    expect(result.ok).toBe(false);
  });

  it('rejects a non-object', () => {
    const result = validateDatabase('not a database');
    expect(result.ok).toBe(false);
  });
});
