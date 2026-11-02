/**
 * The only thing the repository knows about storage. Swap this for an HTTP client
 * and the UI does not change. See docs/ARCHITECTURE.md section 4.
 */
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export class StorageWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageWriteError';
  }
}

/** Used by tests and by the app when localStorage is unavailable. */
export class MemoryAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  read(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  write(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}
