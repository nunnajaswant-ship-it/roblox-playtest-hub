import type { Database, FieldErrors, ReportDraft } from './types';
import { CATEGORIES, FREQUENCIES, PLATFORMS } from './category';
import { SEVERITIES } from './severity';
import { STATUSES } from './status';

const MIN_TITLE = 8;
const MAX_TITLE = 100;
const MIN_BODY = 10;
const MAX_BODY = 600;
const MAX_STEPS = 12;

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * The single source of validation truth. Runs in the form and on import.
 * Never throws, always returns field messages.
 */
export function validateReport(draft: ReportDraft): FieldErrors {
  const errors: FieldErrors = {};

  const title = clean(draft.title);
  if (title.length === 0) {
    errors.title = 'A title is required.';
  } else if (title.length < MIN_TITLE) {
    errors.title = `Give it at least ${MIN_TITLE} characters so it can be recognised later.`;
  } else if (title.length > MAX_TITLE) {
    errors.title = `Keep the title under ${MAX_TITLE} characters.`;
  }

  if (clean(draft.buildId) === '') {
    errors.buildId = 'Choose the build you tested.';
  }

  const area = clean(draft.area);
  if (area.length < 2) {
    errors.area = 'Name the stage or feature, for example "Stage 4" or "Checkout".';
  } else if (area.length > 60) {
    errors.area = 'Keep the area under 60 characters.';
  }

  if (!CATEGORIES.includes(draft.category)) {
    errors.category = 'Choose a category.';
  }

  if (!SEVERITIES.includes(draft.severity)) {
    errors.severity = 'Choose a severity.';
  }

  if (!PLATFORMS.includes(draft.platform)) {
    errors.platform = 'Choose a platform.';
  }

  if (!FREQUENCIES.includes(draft.frequency)) {
    errors.frequency = 'Choose how often it happens.';
  }

  const expected = clean(draft.expected);
  if (expected.length < MIN_BODY) {
    errors.expected = 'Describe what should have happened.';
  } else if (expected.length > MAX_BODY) {
    errors.expected = `Keep it under ${MAX_BODY} characters.`;
  }

  const actual = clean(draft.actual);
  if (actual.length < MIN_BODY) {
    errors.actual = 'Describe what actually happened.';
  } else if (actual.length > MAX_BODY) {
    errors.actual = `Keep it under ${MAX_BODY} characters.`;
  }

  if (draft.steps.length > MAX_STEPS) {
    errors.steps = `At most ${MAX_STEPS} steps. Link a video if it needs more.`;
  } else if (draft.steps.some((step) => step.trim().length === 0 && draft.steps.length > 1)) {
    errors.steps = 'Remove empty steps, or leave the list empty.';
  }

  const screenshot = draft.screenshotUrl.trim();
  if (screenshot !== '' && !isHttpUrl(screenshot)) {
    errors.screenshotUrl = 'Must start with http:// or https://';
  }

  if (clean(draft.reporter).length < 2) {
    errors.reporter = 'Put a name so a developer can follow up.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function emptyDraft(buildId: string): ReportDraft {
  return {
    title: '',
    buildId,
    area: '',
    category: 'gameplay',
    severity: 'medium',
    platform: 'pc',
    frequency: 'always',
    expected: '',
    actual: '',
    steps: [],
    screenshotUrl: '',
    reporter: ''
  };
}

/**
 * Structural validation for imported or stored data. Rejects anything that would
 * make the UI throw; it does not try to be a full schema language.
 */
export function validateDatabase(value: unknown): { ok: true; db: Database } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    return { ok: false, errors: ['File is not an object.'] };
  }

  const candidate = value as Partial<Database>;

  if (candidate.schemaVersion !== 1) {
    errors.push('schemaVersion must be 1.');
  }

  const isString = (v: unknown): v is string => typeof v === 'string';

  if (!Array.isArray(candidate.builds)) {
    errors.push('builds must be an array.');
  } else {
    candidate.builds.forEach((build, index) => {
      if (!build || !isString(build.id) || !isString(build.version) || !isString(build.name)) {
        errors.push(`builds[${index}] is missing id, version, or name.`);
      }
    });
  }

  if (!Array.isArray(candidate.members)) {
    errors.push('members must be an array.');
  }

  if (!Array.isArray(candidate.reports)) {
    errors.push('reports must be an array.');
  } else {
    candidate.reports.forEach((report, index) => {
      if (!report || typeof report !== 'object') {
        errors.push(`reports[${index}] is not an object.`);
        return;
      }
      if (!isString(report.id) || !isString(report.ref) || !isString(report.title)) {
        errors.push(`reports[${index}] is missing id, ref, or title.`);
      }
      if (!SEVERITIES.includes(report.severity)) {
        errors.push(`reports[${index}] has an unknown severity.`);
      }
      if (!STATUSES.includes(report.status)) {
        errors.push(`reports[${index}] has an unknown status.`);
      }
      if (!CATEGORIES.includes(report.category)) {
        errors.push(`reports[${index}] has an unknown category.`);
      }
      if (!Array.isArray(report.steps)) {
        errors.push(`reports[${index}] steps must be an array.`);
      }
      if (!Array.isArray(report.history)) {
        errors.push(`reports[${index}] history must be an array.`);
      }
    });
  }

  if (!isString(candidate.activeBuildId)) {
    errors.push('activeBuildId must be a string.');
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors.slice(0, 8) };
  }

  return { ok: true, db: value as Database };
}
