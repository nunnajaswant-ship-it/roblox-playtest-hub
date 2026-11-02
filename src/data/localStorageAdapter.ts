import { StorageWriteError, type StorageAdapter } from './adapter';

/**
 * localStorage wrapper. Every browser failure mode is turned into a typed error
 * with a sentence a human can act on.
 */
export class LocalStorageAdapter implements StorageAdapter {
  read(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  write(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      const isQuota =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      throw new StorageWriteError(
        isQuota
          ? 'Browser storage is full. Export your data now, then reset.'
          : 'Browser storage is blocked, likely by a privacy setting. Data stays in this tab only.'
      );
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Removing is best effort; a blocked remove cannot corrupt anything.
    }
  }
}

export function isStorageAvailable(): boolean {
  try {
    const probe = '__playtest_hub_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
