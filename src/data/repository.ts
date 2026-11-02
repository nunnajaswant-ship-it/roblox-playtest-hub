import type { Database } from '../domain/types';
import { validateDatabase } from '../domain/validation';
import type { StorageAdapter } from './adapter';
import { seedDatabase } from './seed';

export const STORAGE_KEY = 'playtest-hub.db.v1';

export interface LoadResult {
  db: Database;
  source: 'storage' | 'seed';
  error: string | null;
}

/**
 * Never throws. A corrupt or partial database falls back to demo data and says
 * why, instead of leaving the user with a blank screen and no explanation.
 */
export function loadDatabase(adapter: StorageAdapter): LoadResult {
  const raw = adapter.read(STORAGE_KEY);

  if (raw === null || raw === '') {
    return { db: seedDatabase(), source: 'seed', error: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      db: seedDatabase(),
      source: 'seed',
      error: 'Saved data was not valid JSON. Demo data loaded instead.'
    };
  }

  const check = validateDatabase(parsed);
  if (!check.ok) {
    return {
      db: seedDatabase(),
      source: 'seed',
      error: `Saved data was unusable (${check.errors[0]}). Demo data loaded instead.`
    };
  }

  const db: Database = {
    ...check.db,
    settings: check.db.settings ?? { lastLoadError: null }
  };

  return { db, source: 'storage', error: null };
}

export function saveDatabase(adapter: StorageAdapter, db: Database): void {
  adapter.write(STORAGE_KEY, JSON.stringify(db));
}

export function exportDatabase(db: Database): string {
  return JSON.stringify(db, null, 2);
}

export function importDatabase(
  text: string
): { ok: true; db: Database } | { ok: false; errors: string[] } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['That file is not valid JSON.'] };
  }

  const check = validateDatabase(parsed);
  if (!check.ok) {
    return { ok: false, errors: check.errors };
  }

  return {
    ok: true,
    db: {
      ...check.db,
      settings: { lastLoadError: null }
    }
  };
}
