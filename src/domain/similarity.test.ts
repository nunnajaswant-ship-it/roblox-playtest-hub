import { describe, expect, it } from 'vitest';
import { findDuplicates, similarityScore, tokenize } from './similarity';
import { seedDatabase } from '../data/seed';

const db = seedDatabase();

describe('tokenize', () => {
  it('drops stopwords and folds plurals', () => {
    const tokens = tokenize('The shop items are not working');
    expect(tokens.has('the')).toBe(false);
    expect(tokens.has('are')).toBe(false);
    expect(tokens.has('item')).toBe(true);
    expect(tokens.has('shop')).toBe(true);
  });
});

describe('similarityScore', () => {
  it('matches a vague shop report to a specific shop bug', () => {
    const report = db.reports.find((item) => item.ref === 'PH-101')!;
    const detail = similarityScore(
      { title: "Shop doesn't work", category: 'shop', area: 'Checkout' },
      report
    );

    expect(detail.score).toBeGreaterThanOrEqual(0.55);
    expect(detail.sameCategory).toBe(true);
    expect(detail.sameArea).toBe(true);
  });

  it('matches two descriptions of the same checkpoint bug', () => {
    const report = db.reports.find((item) => item.ref === 'PH-102')!;
    const detail = similarityScore(
      {
        title: 'Obby stage 4 checkpoint broken',
        category: 'obby',
        area: 'Stage 4'
      },
      report
    );

    expect(detail.score).toBeGreaterThanOrEqual(0.55);
  });

  it('does not match unrelated reports', () => {
    const report = db.reports.find((item) => item.ref === 'PH-103')!;
    const detail = similarityScore(
      { title: 'Shop takes Robux', category: 'shop', area: 'Checkout' },
      report
    );

    expect(detail.score).toBeLessThan(0.55);
  });

  it('scores an identical title at 1', () => {
    const report = db.reports[0];
    const detail = similarityScore(
      { title: report.title, category: report.category, area: report.area },
      report
    );

    expect(detail.score).toBeCloseTo(1, 5);
  });
});

describe('findDuplicates', () => {
  it('returns matches sorted by score and honours the limit', () => {
    const matches = findDuplicates(
      { title: 'Shop purchase takes Robux but gives no item', category: 'shop', area: 'Checkout' },
      db.reports,
      { limit: 2 }
    );

    expect(matches.length).toBeLessThanOrEqual(2);
    if (matches.length > 1) {
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
    }
  });

  it('never returns the report being edited', () => {
    const report = db.reports.find((item) => item.ref === 'PH-101')!;
    const matches = findDuplicates(
      { title: report.title, category: report.category, area: report.area },
      db.reports,
      { excludeId: report.id }
    );

    expect(matches.every((match) => match.report.id !== report.id)).toBe(true);
  });

  it('explains why it matched', () => {
    const matches = findDuplicates(
      { title: 'Shop does not work', category: 'shop', area: 'Checkout' },
      db.reports
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].reason.length).toBeGreaterThan(0);
  });
});
