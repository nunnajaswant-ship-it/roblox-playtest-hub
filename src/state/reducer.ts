import type {
  Database,
  Filters,
  Report,
  ReportDraft,
  Status,
  ViewId
} from '../domain/types';
import { EMPTY_FILTERS } from '../domain/filters';
import { nextRef, uid } from '../domain/ids';
import { seedDatabase } from '../data/seed';

export type ToastTone = 'ok' | 'warn' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface AppState {
  db: Database;
  filters: Filters;
  view: ViewId;
  selectedId: string | null;
  formOpen: boolean;
  toast: Toast | null;
  /** Set when the browser refused to persist. The app keeps working in memory. */
  storageError: string | null;
  toastSeq: number;
}

export type Action =
  | { type: 'db/replace'; db: Database }
  | { type: 'report/create'; draft: ReportDraft; duplicateOf: string | null; actor: string }
  | { type: 'report/status'; id: string; status: Status; actor: string }
  | { type: 'report/assign'; id: string; assigneeId: string | null; actor: string }
  | { type: 'report/duplicate'; id: string; duplicateOf: string | null; actor: string }
  | { type: 'report/comment'; id: string; text: string; actor: string }
  | { type: 'filters/set'; patch: Partial<Filters> }
  | { type: 'filters/clear' }
  | { type: 'build/set'; buildId: string }
  | { type: 'view/set'; view: ViewId }
  | { type: 'report/select'; id: string | null }
  | { type: 'form/open' }
  | { type: 'form/close' }
  | { type: 'toast/show'; message: string; tone?: ToastTone }
  | { type: 'toast/dismiss' }
  | { type: 'data/reset' };

function nowIso(): string {
  return new Date().toISOString();
}

function withHistory(
  report: Report,
  kind: 'status' | 'assignee' | 'duplicate' | 'comment',
  by: string,
  text: string
): Report {
  return {
    ...report,
    updatedAt: nowIso(),
    history: [...report.history, { id: uid(), at: nowIso(), kind, by, text }]
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'db/replace':
      return { ...state, db: action.db };

    case 'report/create': {
      const { draft, duplicateOf, actor } = action;
      const timestamp = nowIso();

      const report: Report = {
        id: uid(),
        ref: nextRef(state.db.reports),
        title: draft.title.trim(),
        buildId: draft.buildId,
        area: draft.area.trim(),
        category: draft.category,
        severity: draft.severity,
        status: 'new',
        platform: draft.platform,
        frequency: draft.frequency,
        expected: draft.expected.trim(),
        actual: draft.actual.trim(),
        steps: draft.steps.map((step) => step.trim()).filter(Boolean),
        screenshotUrl: draft.screenshotUrl.trim(),
        reporter: draft.reporter.trim() || actor,
        assigneeId: null,
        duplicateOf,
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [
          { id: uid(), at: timestamp, kind: 'created', by: actor, text: 'Report filed.' }
        ]
      };

      return {
        ...state,
        db: { ...state.db, reports: [report, ...state.db.reports] },
        selectedId: report.id,
        formOpen: false,
        toast: { id: state.toastSeq + 1, message: `${report.ref} created`, tone: 'ok' },
        toastSeq: state.toastSeq + 1
      };
    }

    case 'report/status': {
      const target = state.db.reports.find((report) => report.id === action.id);
      if (!target || target.status === action.status) return state;

      const label = action.status.replace('_', ' ');
      const next = withHistory(target, 'status', action.actor, `Moved to ${label}.`);

      return {
        ...state,
        db: {
          ...state.db,
          reports: state.db.reports.map((report) =>
            report.id === action.id ? { ...next, status: action.status } : report
          )
        },
        toast: {
          id: state.toastSeq + 1,
          message: `${target.ref} moved to ${label}`,
          tone: 'ok'
        },
        toastSeq: state.toastSeq + 1
      };
    }

    case 'report/assign': {
      const target = state.db.reports.find((report) => report.id === action.id);
      if (!target) return state;

      const member = state.db.members.find((m) => m.id === action.assigneeId);
      const name = member ? member.name : 'Unassigned';
      const next = withHistory(
        target,
        'assignee',
        action.actor,
        action.assigneeId ? `Assigned to ${name}.` : 'Unassigned.'
      );

      return {
        ...state,
        db: {
          ...state.db,
          reports: state.db.reports.map((report) =>
            report.id === action.id ? { ...next, assigneeId: action.assigneeId } : report
          )
        },
        toast: { id: state.toastSeq + 1, message: `Assigned to ${name}`, tone: 'ok' },
        toastSeq: state.toastSeq + 1
      };
    }

    case 'report/duplicate': {
      const target = state.db.reports.find((report) => report.id === action.id);
      if (!target) return state;

      const original = state.db.reports.find((report) => report.id === action.duplicateOf);
      const next = withHistory(
        target,
        'duplicate',
        action.actor,
        original ? `Marked as duplicate of ${original.ref}.` : 'Duplicate link cleared.'
      );

      return {
        ...state,
        db: {
          ...state.db,
          reports: state.db.reports.map((report) =>
            report.id === action.id ? { ...next, duplicateOf: action.duplicateOf } : report
          )
        }
      };
    }

    case 'report/comment': {
      const target = state.db.reports.find((report) => report.id === action.id);
      if (!target || action.text.trim() === '') return state;

      const next = withHistory(target, 'comment', action.actor, action.text.trim());

      return {
        ...state,
        db: {
          ...state.db,
          reports: state.db.reports.map((report) =>
            report.id === action.id ? next : report
          )
        }
      };
    }

    case 'filters/set':
      return { ...state, filters: { ...state.filters, ...action.patch } };

    case 'filters/clear':
      return { ...state, filters: { ...EMPTY_FILTERS } };

    case 'build/set':
      return { ...state, db: { ...state.db, activeBuildId: action.buildId } };

    case 'view/set':
      return { ...state, view: action.view };

    case 'report/select':
      return { ...state, selectedId: action.id };

    case 'form/open':
      return { ...state, formOpen: true };

    case 'form/close':
      return { ...state, formOpen: false };

    case 'toast/show':
      return {
        ...state,
        toast: {
          id: state.toastSeq + 1,
          message: action.message,
          tone: action.tone ?? 'ok'
        },
        toastSeq: state.toastSeq + 1
      };

    case 'toast/dismiss':
      return { ...state, toast: null };

    case 'data/reset':
      return {
        ...state,
        db: seedDatabase(),
        selectedId: null,
        filters: { ...EMPTY_FILTERS },
        toast: { id: state.toastSeq + 1, message: 'Demo data restored', tone: 'ok' },
        toastSeq: state.toastSeq + 1,
        storageError: null
      };

    default:
      return state;
  }
}
