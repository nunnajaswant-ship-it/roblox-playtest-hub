import { useMemo } from 'react';
import { applyFilters, filtersAreActive } from '../domain/filters';
import { CATEGORIES, CATEGORY_LABEL } from '../domain/category';
import { SEVERITIES, SEVERITY_LABEL } from '../domain/severity';
import { useApp, useDispatch } from '../state/context';
import { Board } from '../components/Board';
import { EmptyState } from '../components/EmptyState';

export function TriageView() {
  const { db, filters } = useApp();
  const dispatch = useDispatch();

  const visible = useMemo(
    () => applyFilters(db.reports, filters, db.activeBuildId),
    [db.reports, filters, db.activeBuildId]
  );

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Triage board</h1>
          <p className="view-sub">
            Drag a card, or use the arrows on it. Every move is written to the report history.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
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
          aria-label="Filter by assignee"
          value={filters.assignee}
          onChange={(event) =>
            dispatch({ type: 'filters/set', patch: { assignee: event.target.value } })
          }
        >
          <option value="all">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {db.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
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
          Nothing matches the current filters on this build. Clear them, or file a new report.
        </EmptyState>
      ) : (
        <Board reports={visible} />
      )}
    </div>
  );
}
