import type { Category, Frequency, Platform } from './types';

export const CATEGORIES: Category[] = [
  'obby',
  'shop',
  'gameplay',
  'ui',
  'performance',
  'audio',
  'data',
  'other'
];

export const CATEGORY_LABEL: Record<Category, string> = {
  obby: 'Obby / Level',
  shop: 'Shop / Economy',
  gameplay: 'Gameplay',
  ui: 'UI / Controls',
  performance: 'Performance',
  audio: 'Audio',
  data: 'Data / Saving',
  other: 'Other'
};

export const CATEGORY_HINT: Record<Category, string> = {
  obby: 'Checkpoints, killbricks, stage geometry, stage transitions.',
  shop: 'Purchases, Robux, inventory, prices, item delivery.',
  gameplay: 'Core mechanics, scoring, respawn, match rules.',
  ui: 'Buttons, layout, overlapping controls, mobile HUD.',
  performance: 'Lag, low frame rate, long loads, memory.',
  audio: 'Missing, doubled, or mistimed sound and music.',
  data: 'Progress not saving, leaderboard wrong, lost inventory.',
  other: 'Anything that fits nothing else.'
};

export const PLATFORMS: Platform[] = ['pc', 'mobile', 'console', 'vr'];

export const PLATFORM_LABEL: Record<Platform, string> = {
  pc: 'PC',
  mobile: 'Mobile',
  console: 'Console',
  vr: 'VR'
};

export const FREQUENCIES: Frequency[] = ['always', 'often', 'sometimes', 'once'];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  always: 'Every time',
  often: 'Most of the time',
  sometimes: 'Sometimes',
  once: 'Once, could not repeat'
};

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value);
}

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as string[]).includes(value);
}

export function isFrequency(value: unknown): value is Frequency {
  return typeof value === 'string' && (FREQUENCIES as string[]).includes(value);
}
