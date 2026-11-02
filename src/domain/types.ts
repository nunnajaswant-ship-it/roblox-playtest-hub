export type Severity = 'blocker' | 'high' | 'medium' | 'low';

export type Category =
  | 'gameplay'
  | 'obby'
  | 'shop'
  | 'ui'
  | 'performance'
  | 'audio'
  | 'data'
  | 'other';

export type Status =
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'fixed'
  | 'verified'
  | 'wont_fix';

export type Platform = 'pc' | 'mobile' | 'console' | 'vr';

export type Frequency = 'always' | 'often' | 'sometimes' | 'once';

export type HistoryKind = 'created' | 'status' | 'assignee' | 'comment' | 'duplicate';

export type ViewId =
  | 'run'
  | 'overview'
  | 'playtest'
  | 'triage'
  | 'reports'
  | 'pipeline'
  | 'readiness'
  | 'data';

export interface Build {
  id: string;
  version: string;
  name: string;
  releasedAt: string;
  isLive: boolean;
  notes: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** CSS colour token name, resolved in components. */
  tint: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  kind: HistoryKind;
  by: string;
  text: string;
}

export interface Report {
  id: string;
  /** Human handle, for example PH-104. */
  ref: string;
  title: string;
  buildId: string;
  area: string;
  category: Category;
  severity: Severity;
  status: Status;
  platform: Platform;
  frequency: Frequency;
  expected: string;
  actual: string;
  steps: string[];
  screenshotUrl: string;
  reporter: string;
  assigneeId: string | null;
  duplicateOf: string | null;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
}

export interface Database {
  schemaVersion: 1;
  builds: Build[];
  members: Member[];
  reports: Report[];
  activeBuildId: string;
  settings: {
    lastLoadError: string | null;
    /** False until the user has been through the game + pipeline walkthrough. */
    onboarded: boolean;
  };
}

export interface ReportDraft {
  title: string;
  buildId: string;
  area: string;
  category: Category;
  severity: Severity;
  platform: Platform;
  frequency: Frequency;
  expected: string;
  actual: string;
  steps: string[];
  screenshotUrl: string;
  reporter: string;
}

export interface Filters {
  search: string;
  severity: Severity | 'all';
  category: Category | 'all';
  status: Status | 'all';
  assignee: string | 'all' | 'unassigned';
}

export type FieldErrors = Partial<Record<keyof ReportDraft, string>>;

export interface DuplicateMatch {
  report: Report;
  score: number;
  reason: string;
}

export type Verdict = 'ready' | 'watch' | 'at_risk' | 'not_ready';

export interface Readiness {
  buildId: string;
  score: number;
  verdict: Verdict;
  openWeight: number;
  totalWeight: number;
  openCount: number;
  totalCount: number;
  blockers: Report[];
  highs: Report[];
  explanation: string;
}
