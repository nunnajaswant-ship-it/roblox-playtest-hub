import { useApp, useDispatch } from '../state/context';
import { APP_NAME } from '../config';

export function AppHeader() {
  const { db } = useApp();
  const dispatch = useDispatch();

  const active = db.builds.find((build) => build.id === db.activeBuildId);

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">PH</div>
        <div>
          <div className="brand-name">{APP_NAME}</div>
          <div className="brand-sub">Roblox QA</div>
        </div>
      </div>

      <div className="header-spacer" />

      <div className="build-picker">
        <label className="build-picker-label" htmlFor="build-select">
          Build
        </label>
        <span className="live-dot" aria-hidden="true" title={active?.isLive ? 'Live build' : undefined} />
        <select
          id="build-select"
          value={db.activeBuildId}
          onChange={(event) =>
            dispatch({ type: 'build/set', buildId: event.target.value })
          }
        >
          <option value="all">All builds</option>
          {db.builds.map((build) => (
            <option key={build.id} value={build.id}>
              {build.version} {build.name}
              {build.isLive ? ' (live)' : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => dispatch({ type: 'form/open' })}
      >
        <span aria-hidden="true">+</span> New report
      </button>
    </header>
  );
}
