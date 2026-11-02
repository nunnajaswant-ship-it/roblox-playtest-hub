import type { Status } from './types';

/** Board order, left to right. */
export const STATUSES: Status[] = [
  'new',
  'triaged',
  'in_progress',
  'fixed',
  'verified',
  'wont_fix'
];

export const STATUS_LABEL: Record<Status, string> = {
  new: 'New',
  triaged: 'Triaged',
  in_progress: 'In progress',
  fixed: 'Fixed',
  verified: 'Verified',
  wont_fix: "Won't fix"
};

export const STATUS_HINT: Record<Status, string> = {
  new: 'Reported, nobody has looked yet.',
  triaged: 'Someone confirmed it and decided it matters.',
  in_progress: 'A developer is working on it.',
  fixed: 'A fix exists but nobody has confirmed it on a build.',
  verified: 'Confirmed fixed on the build. No longer counted against readiness.',
  wont_fix: 'Deliberately not fixing. No longer counted against readiness.'
};

/** A fix only counts once it is verified. `fixed` still weighs on readiness. */
export const TERMINAL_STATUSES: Status[] = ['verified', 'wont_fix'];

export function isTerminal(status: Status): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function statusIndex(status: Status): number {
  return STATUSES.indexOf(status);
}

export function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (STATUSES as string[]).includes(value);
}

/** Next status to the right, or null at the end. Used by the board buttons. */
export function nextStatus(status: Status): Status | null {
  const index = statusIndex(status);
  if (index < 0 || index >= STATUSES.length - 1) return null;
  return STATUSES[index + 1];
}

export function previousStatus(status: Status): Status | null {
  const index = statusIndex(status);
  if (index <= 0) return null;
  return STATUSES[index - 1];
}
