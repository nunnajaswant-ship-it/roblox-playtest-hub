import { useMemo, useState } from 'react';
import { applyFilters, filtersAreActive, sortBySeverityThenAge, sortByUpdated } from '../domain/filters';
import { CATEGORIES, CATEGORY_LABEL } from '../domain/category';
import { SEVERITIES, SEVERITY_LABEL } from '../domain/severity';
import { STATUSES, STATUS_LABEL } from '../domain/status';
import { useApp, useDispatch } from '../state/context';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusPill } from '../components/StatusPill';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';

type SortMode = 'updated' | 'severity';

export function ReportsView() {
  const { db, filters } = useApp();
  const dispatch = useDispatch();
  const [sort, setSort] = useState<SortMode>('updated');

  const visible = useMemo(() => {
    const filtered = applyFilters(db.reports, filters, db.activeBuildId);
    return sort === 'severity' ? sortBySeverityThenAge(filtered) : sortByUpdated(filtered);
  }, [db.reports, filters, db.activeBuildId, sort]);

  const shortDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Reports</h1>
          <p className="view-sub">
            Every filed report for this build. Click a row to triage it.
          </p>
        </div>
        <span className="chip">{visible.length} shown</span>
      </div>

      <div className="toolbar">
        <input
          className="input"
          data-search
          type="search"
          placeholder="Search title, area, ref, reporter"
          aria-label="Search reports"
          value={filters.search}
          onChange={(event) => dispatch({ type: 'filters/set', patch: { search: event.target.value } })}
        />

        <select
          className="select"
          aria-label="Filter by severity"
          value={filters.severity}
          onChange={(event) =>
            dispatch({
              type: 'filters/set',
              patch: { severity: event.target.value as typeof filters.severity }
            })
          }
        >
          <option value="all">All severities</option>
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {SEVERITY_LABEL[severity]}
            </option>
          ))}
        </select>

        <select
          className="select"
          aria-label="Filter by category"
          value={filters.category}
          onChange={(event) =>
            dispatch({
              type: 'filters/set',
              patch: { category: event.target.value as typeof filters.category }
            })
          }
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABEL[category]}
            </option>
          ))}
        </select>

        <select
          className="select"
          aria-label="Filter by status"
          value={filters.status}
          onChange={(event) =>
            dispatch({
              type: 'filters/set',
              patch: { status: event.target.value as typeof filters.status }
            })
          }
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        <select
          className="select"
          aria-label="Sort reports"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
        >
          <option value="updated">Recently updated</option>
          <option value="severity">Severity first</option>
        </select>

        <div className="spacer" />

        {filtersAreActive(filters) ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => dispatch({ type: 'filters/clear' })}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No reports match"
          action={
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => dispatch({ type: 'filters/clear' })}
            >
              Clear filters
            </button>
          }
        >
          Nothing matches the current filters on this build.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="reports">
            <thead>
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Report</th>
                <th scope="col">Build</th>
                <th scope="col">Area</th>
                <th scope="col">Severity</th>
                <th scope="col">Status</th>
                <th scope="col">Assignee</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((report) => {
                const build = db.builds.find((item) => item.id === report.buildId);
                const member = db.members.find((item) => item.id === report.assigneeId) ?? null;

                return (
                  <tr
                    key={report.id}
                    onClick={() => dispatch({ type: 'report/select', id: report.id })}
                  >
                    <td className="mono" style={{ color: 'var(--ink-300)', fontSize: 11 }}>
                      {report.ref}
                    </td>
                    <td className="title-cell">
                      <button
                        type="button"
                        className="linkish"
                        onClick={(event) => {
                          event.stopPropagation();
                          dispatch({ type: 'report/select', id: report.id });
                        }}
                      >
                        {report.title}
                      </button>
                      <div className="s">
                        {CATEGORY_LABEL[report.category]} / {report.reporter}
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--ink-300)' }}>
                      {build ? build.version : '-'}
                    </td>
                    <td>{report.area}</td>
                    <td>
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td>
                      <StatusPill status={report.status} />
                    </td>
                    <td>
                      <span className="row" style={{ gap: 6 }}>
                        <Avatar member={member} />
                        <span style={{ fontSize: 12 }}>{member ? member.name : 'Unassigned'}</span>
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--ink-300)' }}>
                      {shortDate(report.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
