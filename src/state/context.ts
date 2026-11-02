import { createContext, useContext, type Dispatch } from 'react';
import type { Action, AppState } from './reducer';

export interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

/**
 * Context and hooks only. No components live here on purpose: keeping the
 * provider in its own module lets React Fast Refresh hot-swap it without
 * invalidating every consumer.
 */
export const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}

export function useApp(): AppState {
  return useStore().state;
}

export function useDispatch(): Dispatch<Action> {
  return useStore().dispatch;
}
