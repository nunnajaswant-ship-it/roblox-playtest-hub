import type { Filters, Report, Severity, Status } from './types';
import { SEVERITIES } from './severity';
import { STATUSES } from './status';

export const EMPTY_FILTERS: Filters = {
  search: '',
  severity: 'all',
  category: 'all',
  status: 'all',
  assignee: 'all'
};

export function filtersAreActive(filters: Filters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.severity !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.assignee !== 'all'
  );
}

export function applyFilters(
  reports: Report[],
  filters: Filters,
  buildId: string
): Report[] {
  const needle = filters.search.trim().toLowerCase();

  return reports.filter((report) => {
    if (buildId !== 'all' && report.buildId !== buildId) return false;
    if (filters.severity !== 'all' && report.severity !== filters.severity) return false;
    if (filters.category !== 'all' && report.category !== filters.category) return false;
    if (filters.status !== 'all' && report.status !== filters.status) return false;

    if (filters.assignee === 'unassigned' && report.assigneeId !== null) return false;
    if (
      filters.assignee !== 'all' &&
      filters.assignee !== 'unassigned' &&
      report.assigneeId !== filters.assignee
    ) {
      return false;
    }

    if (needle !== '') {
      const haystack = [
        report.title,
        report.area,
        report.ref,
        report.reporter,
        report.actual,
        report.expected
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

export function countsBySeverity(reports: Report[]): Record<Severity, number> {
  const counts = { blocker: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>;
  for (const report of reports) counts[report.severity] += 1;
  return counts;
}

export function countsByStatus(reports: Report[]): Record<Status, number> {
  const counts = {
    new: 0,
    triaged: 0,
    in_progress: 0,
    fixed: 0,
    verified: 0,
    wont_fix: 0
  } as Record<Status, number>;
  for (const report of reports) counts[report.status] += 1;
  return counts;
}

export function sortBySeverityThenAge(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    const severityDelta =
      SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);
    if (severityDelta !== 0) return severityDelta;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function sortByUpdated(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function statusColumnOrder(): Status[] {
  return STATUSES;
}
