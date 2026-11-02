import { describe, expect, it } from 'vitest';
import { reducer, type AppState } from './reducer';
import { seedDatabase } from '../data/seed';
import { EMPTY_FILTERS } from '../domain/filters';
import type { ReportDraft } from '../domain/types';

function initial(): AppState {
  return {
    db: seedDatabase(),
    filters: { ...EMPTY_FILTERS },
    view: 'overview',
    selectedId: null,
    formOpen: false,
    toast: null,
    toastSeq: 1,
    storageError: null
  };
}

const draft: ReportDraft = {
  title: 'Checkpoint at stage 5 never triggers',
  buildId: 'b-050',
  area: 'Stage 5',
  category: 'obby',
  severity: 'high',
  platform: 'pc',
  frequency: 'always',
  expected: 'Touching the pad saves the checkpoint.',
  actual: 'The pad flashes but the respawn point does not change.',
  steps: ['Reach stage 5', 'Touch the pad', 'Fall'],
  screenshotUrl: '',
  reporter: 'Nunna'
};

describe('reducer', () => {
  it('creates a report with the next ref and a history entry', () => {
    const state = reducer(initial(), {
      type: 'report/create',
      draft,
      duplicateOf: null,
      actor: 'Nunna'
    });

    expect(state.db.reports).toHaveLength(9);
    expect(state.db.reports[0].ref).toBe('PH-109');
    expect(state.db.reports[0].status).toBe('new');
    expect(state.db.reports[0].history).toHaveLength(1);
    expect(state.formOpen).toBe(false);
    expect(state.selectedId).toBe(state.db.reports[0].id);
  });

  it('records a status change in history', () => {
    const start = initial();
    const state = reducer(start, {
      type: 'report/status',
      id: 'r-102',
      status: 'triaged',
      actor: 'Nunna'
    });

    const report = state.db.reports.find((item) => item.id === 'r-102')!;
    expect(report.status).toBe('triaged');
    expect(report.history).toHaveLength(2);
    expect(report.history[1].text).toBe('Moved to triaged.');
    expect(report.history[1].kind).toBe('status');
  });

  it('ignores a status change to the same status', () => {
    const start = initial();
    const state = reducer(start, {
      type: 'report/status',
      id: 'r-102',
      status: 'new',
      actor: 'Nunna'
    });

    expect(state).toBe(start);
  });

  it('assigns a report and logs it', () => {
    const state = reducer(initial(), {
      type: 'report/assign',
      id: 'r-102',
      assigneeId: 'm-abhiram',
      actor: 'Nunna'
    });

    const report = state.db.reports.find((item) => item.id === 'r-102')!;
    expect(report.assigneeId).toBe('m-abhiram');
    expect(report.history.at(-1)?.text).toBe('Assigned to Abhiram.');
  });

  it('unassigns with a readable log line', () => {
    const state = reducer(initial(), {
      type: 'report/assign',
      id: 'r-101',
      assigneeId: null,
      actor: 'Nunna'
    });

    const report = state.db.reports.find((item) => item.id === 'r-101')!;
    expect(report.assigneeId).toBeNull();
    expect(report.history.at(-1)?.text).toBe('Unassigned.');
  });

  it('adds a comment and refuses an empty one', () => {
    const withComment = reducer(initial(), {
      type: 'report/comment',
      id: 'r-102',
      text: 'Reproduced on mobile.',
      actor: 'Abhiram'
    });

    const empty = reducer(withComment, {
      type: 'report/comment',
      id: 'r-102',
      text: '   ',
      actor: 'Abhiram'
    });

    expect(empty).toBe(withComment);
    const report = withComment.db.reports.find((item) => item.id === 'r-102')!;
    expect(report.history.at(-1)?.kind).toBe('comment');
  });

  it('marks a duplicate and clears it', () => {
    const marked = reducer(initial(), {
      type: 'report/duplicate',
      id: 'r-102',
      duplicateOf: 'r-101',
      actor: 'Nunna'
    });

    let report = marked.db.reports.find((item) => item.id === 'r-102')!;
    expect(report.duplicateOf).toBe('r-101');
    expect(report.history.at(-1)?.text).toContain('PH-101');

    const cleared = reducer(marked, {
      type: 'report/duplicate',
      id: 'r-102',
      duplicateOf: null,
      actor: 'Nunna'
    });

    report = cleared.db.reports.find((item) => item.id === 'r-102')!;
    expect(report.duplicateOf).toBeNull();
  });

  it('resets to seed data and clears filters', () => {
    const dirty = reducer(initial(), {
      type: 'filters/set',
      patch: { search: 'shop', severity: 'blocker' }
    });
    const reset = reducer(dirty, { type: 'data/reset' });

    expect(reset.db.reports).toHaveLength(8);
    expect(reset.filters).toEqual(EMPTY_FILTERS);
  });
});
