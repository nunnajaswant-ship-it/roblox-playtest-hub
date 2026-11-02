import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { EMPTY_FILTERS } from '../domain/filters';
import { LocalStorageAdapter } from '../data/localStorageAdapter';
import { loadDatabase, saveDatabase } from '../data/repository';
import { reducer, type AppState } from './reducer';
import { StoreContext } from './context';

const adapter = new LocalStorageAdapter();

function createInitialState(): AppState {
  const loaded = loadDatabase(adapter);

  return {
    db: loaded.error
      ? { ...loaded.db, settings: { ...loaded.db.settings, lastLoadError: loaded.error } }
      : loaded.db,
    filters: { ...EMPTY_FILTERS },
    view: loaded.db.settings.onboarded ? 'overview' : 'playtest',
    selectedId: null,
    runId: null,
    formOpen: false,
    toast: loaded.error ? { id: 1, message: loaded.error, tone: 'warn' } : null,
    toastSeq: 1,
    storageError: null
  };
}

/** The only component that owns the store. Hooks live in ./context. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const timer = setTimeout(() => {
      try {
        saveDatabase(adapter, state.db);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not save to browser storage.';
        dispatch({ type: 'toast/show', message, tone: 'error' });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [state.db]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
