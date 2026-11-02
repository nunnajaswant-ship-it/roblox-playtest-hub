import { useRef, useState } from 'react';
import { useApp, useDispatch } from '../state/context';
import { exportDatabase, importDatabase, STORAGE_KEY } from '../data/repository';
import { isStorageAvailable } from '../data/localStorageAdapter';
import { DEMO_HINT } from '../config';

export function DataView() {
  const { db } = useApp();
  const dispatch = useDispatch();

  const fileRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  const available = isStorageAvailable();

  const doExport = () => {
    const blob = new Blob([exportDatabase(db)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `playtest-hub-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    dispatch({ type: 'toast/show', message: 'Exported as JSON', tone: 'ok' });
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const result = importDatabase(text);

    if (!result.ok) {
      setImportErrors(result.errors);
      dispatch({ type: 'toast/show', message: 'Import rejected, nothing changed', tone: 'error' });
      return;
    }

    setImportErrors([]);
    dispatch({ type: 'db/replace', db: result.db });
    dispatch({ type: 'toast/show', message: 'Data imported', tone: 'ok' });
  };

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Data</h1>
          <p className="view-sub">{DEMO_HINT}</p>
        </div>
      </div>

      {!available ? (
        <div className="banner banner-danger">
          Browser storage is blocked in this context. The app works, but nothing survives a reload.
        </div>
      ) : null}

      {db.settings.lastLoadError ? (
        <div className="banner">
          <span>
            <strong>Last load problem:</strong> {db.settings.lastLoadError}
          </span>
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Export</span>
        </div>
        <div className="panel-body stack">
          <p className="hint">
            Downloads every build, member, and report as one JSON file. This is the only backup
            that survives clearing browser data.
          </p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={doExport}>
              Export JSON
            </button>
            <span className="hint">
              {db.reports.length} reports, {db.builds.length} builds, {db.members.length} members
            </span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Import</span>
        </div>
        <div className="panel-body stack">
          <p className="hint">
            A file is validated before it replaces anything. A rejected file changes nothing.
          </p>
          <div className="row">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="input"
              style={{ maxWidth: 320 }}
              aria-label="Choose a JSON file to import"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void doImport(file);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => fileRef.current?.click()}
            >
              Choose file
            </button>
          </div>

          {importErrors.length > 0 ? (
            <div className="banner banner-danger">
              <div>
                <strong>Import rejected</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  {importErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Storage</span>
        </div>
        <div className="panel-body">
          <dl className="kv">
            <dt>Adapter</dt>
            <dd>Browser localStorage</dd>
            <dt>Key</dt>
            <dd className="mono">{STORAGE_KEY}</dd>
            <dt>Schema</dt>
            <dd className="mono">v{db.schemaVersion}</dd>
            <dt>Persistence</dt>
            <dd>{available ? 'Saving on change' : 'Blocked, memory only'}</dd>
          </dl>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Reset</span>
        </div>
        <div className="panel-body stack">
          <p className="hint">
            Replaces everything with the demo data: three builds, three people, six reports.
            Export first if you have anything worth keeping.
          </p>

          {confirmReset ? (
            <div className="banner banner-danger">
              <div className="spread" style={{ width: '100%' }}>
                <span>This deletes your current reports. There is no undo.</span>
                <span className="row">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      dispatch({ type: 'data/reset' });
                      setConfirmReset(false);
                      setImportErrors([]);
                    }}
                  >
                    Reset to demo data
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <div className="row">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirmReset(true)}
              >
                Reset to demo data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
