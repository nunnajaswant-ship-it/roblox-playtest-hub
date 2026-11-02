import { describe, expect, it } from 'vitest';
import { MemoryAdapter } from './adapter';
import { exportDatabase, importDatabase, loadDatabase, saveDatabase, STORAGE_KEY } from './repository';
import { seedDatabase } from './seed';

describe('repository', () => {
  it('seeds when storage is empty', () => {
    const adapter = new MemoryAdapter();
    const result = loadDatabase(adapter);

    expect(result.source).toBe('seed');
    expect(result.error).toBeNull();
    expect(result.db.reports.length).toBeGreaterThanOrEqual(3);
  });

  it('round-trips through storage', () => {
    const adapter = new MemoryAdapter();
    const db = seedDatabase();
    db.reports[0].title = 'Edited title for round trip';

    saveDatabase(adapter, db);
    const result = loadDatabase(adapter);

    expect(result.source).toBe('storage');
    expect(result.db.reports[0].title).toBe('Edited title for round trip');
  });

  it('falls back to seed data on corrupt JSON and explains why', () => {
    const adapter = new MemoryAdapter();
    adapter.write(STORAGE_KEY, '{"schemaVersion": 1, reports: [');

    const result = loadDatabase(adapter);

    expect(result.source).toBe('seed');
    expect(result.error).toContain('JSON');
  });

  it('falls back when the stored shape is wrong', () => {
    const adapter = new MemoryAdapter();
    adapter.write(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, reports: 'nope' }));

    const result = loadDatabase(adapter);

    expect(result.source).toBe('seed');
    expect(result.error).toContain('unusable');
  });

  it('exports valid JSON that re-imports unchanged', () => {
    const db = seedDatabase();
    const text = exportDatabase(db);
    const result = importDatabase(text);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.db.reports.length).toBe(db.reports.length);
      expect(result.db.builds.length).toBe(db.builds.length);
    }
  });

  it('rejects invalid JSON without touching anything', () => {
    const result = importDatabase('definitely not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain('JSON');
  });

  it('rejects a database with an unknown status', () => {
    const db = JSON.parse(exportDatabase(seedDatabase())) as {
      reports: { status: string }[];
    };
    db.reports[0].status = 'archived';

    const result = importDatabase(JSON.stringify(db));
    expect(result.ok).toBe(false);
  });
});
