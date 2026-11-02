import type { ViewId } from '../domain/types';
import { isTerminal } from '../domain/status';
import { useApp, useDispatch } from '../state/context';

const ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '\u25A6' },
  { id: 'playtest', label: 'Test build', icon: '\u25B6' },
  { id: 'triage', label: 'Triage', icon: '\u25A4' },
  { id: 'reports', label: 'Reports', icon: '\u2261' },
  { id: 'pipeline', label: 'Pipeline', icon: '\u2933' },
  { id: 'readiness', label: 'Readiness', icon: '\u25D4' },
  { id: 'data', label: 'Data', icon: '\u2699' }
];

export function Nav() {
  const { db, view } = useApp();
  const dispatch = useDispatch();

  const openCount = db.reports.filter((report) => !isTerminal(report.status)).length;

  const countFor = (id: ViewId): number | null => {
    if (id === 'triage') return openCount;
    if (id === 'reports') return db.reports.length;
    return null;
  };

  return (
    <nav className="nav" aria-label="Sections">
      <div className="nav-heading">Workspace</div>

      {ITEMS.map((item) => {
        const count = countFor(item.id);

        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item${view === item.id ? ' is-active' : ''}`}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => dispatch({ type: 'view/set', view: item.id })}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
            {count !== null ? <span className="nav-count">{count}</span> : null}
          </button>
        );
      })}

      <div className="nav-foot">
        Press <span className="mono">N</span> for a new report,
        <br />
        <span className="mono">/</span> to search.
        <br />
        <a href="/pitch.html" target="_blank" rel="noreferrer">Pitch deck</a>
      </div>
    </nav>
  );
}
