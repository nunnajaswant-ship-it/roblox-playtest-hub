import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReportDraft } from '../domain/types';
import {
  CATEGORIES,
  CATEGORY_HINT,
  CATEGORY_LABEL,
  FREQUENCIES,
  FREQUENCY_LABEL,
  PLATFORMS,
  PLATFORM_LABEL
} from '../domain/category';
import {
  SEVERITIES,
  SEVERITY_COLOR_VAR,
  SEVERITY_DEFINITION,
  SEVERITY_GLYPH,
  SEVERITY_LABEL
} from '../domain/severity';
import { emptyDraft, hasErrors, validateReport } from '../domain/validation';
import { findDuplicates } from '../domain/similarity';
import { useApp, useDispatch } from '../state/context';
import { ACTOR } from '../config';

const FIELD_ORDER: (keyof ReportDraft)[] = [
  'title',
  'buildId',
  'area',
  'category',
  'severity',
  'expected',
  'actual',
  'screenshotUrl',
  'reporter'
];

export function ReportForm() {
  const { db, formOpen } = useApp();
  const dispatch = useDispatch();

  const defaultBuildId =
    db.activeBuildId !== 'all'
      ? db.activeBuildId
      : (db.builds.find((build) => build.isLive)?.id ?? db.builds[0]?.id ?? '');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ReportDraft>(() => emptyDraft(defaultBuildId));
  const [errors, setErrors] = useState<ReturnType<typeof validateReport>>({});
  const [submitted, setSubmitted] = useState(false);
  const [duplicateOf, setDuplicateOf] = useState<string | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (formOpen && !el.open) {
      setDraft(emptyDraft(defaultBuildId));
      setErrors({});
      setSubmitted(false);
      setDuplicateOf(null);
      el.showModal();
    } else if (!formOpen && el.open) {
      el.close();
    }
  }, [formOpen, defaultBuildId]);

  const duplicates = useMemo(() => {
    if (draft.title.trim().length < 4) return [];
    return findDuplicates(
      { title: draft.title, category: draft.category, area: draft.area },
      db.reports,
      { limit: 3 }
    );
  }, [draft.title, draft.category, draft.area, db.reports]);

  const duplicateTarget = duplicateOf
    ? db.reports.find((report) => report.id === duplicateOf) ?? null
    : null;

  const set = <K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateReport(draft);
    setErrors(nextErrors);
    setSubmitted(true);

    if (hasErrors(nextErrors)) {
      const firstBad = FIELD_ORDER.find((key) => nextErrors[key]);
      if (firstBad) {
        document.getElementById(`f-${firstBad}`)?.focus();
      }
      return;
    }

    dispatch({
      type: 'report/create',
      draft,
      duplicateOf,
      actor: ACTOR
    });
  };

  const errorFor = (key: keyof ReportDraft): string | undefined =>
    submitted ? errors[key] : undefined;

  const fieldClass = (key: keyof ReportDraft, base = 'input'): string =>
    `${base}${errorFor(key) ? ' is-invalid' : ''}`;

  const addStep = () => {
    setDraft((current) => ({ ...current, steps: [...current.steps, ''] }));
  };

  const removeStep = (index: number) => {
    setDraft((current) => ({
      ...current,
      steps: current.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step, i) => (i === index ? value : step))
    }));
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        dispatch({ type: 'form/close' });
      }}
      onClose={() => {
        if (formOpen) dispatch({ type: 'form/close' });
      }}
      aria-labelledby="form-title"
    >
      <form className="modal" onSubmit={submit} noValidate>
        <div className="modal-head">
          <div>
            <h2 id="form-title" className="view-title" style={{ fontSize: 20 }}>
              New bug report
            </h2>
            <p className="hint" style={{ marginTop: 4 }}>
              A developer should be able to reproduce this without asking you a question.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => dispatch({ type: 'form/close' })}
            aria-label="Close form"
          >
            x
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="field span-2">
              <label className="field-label" htmlFor="f-title">
                Title<span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-title"
                className={fieldClass('title')}
                value={draft.title}
                onChange={(event) => set('title', event.target.value)}
                placeholder="Shop purchase deducts Robux but grants no item"
                aria-invalid={Boolean(errorFor('title'))}
                aria-describedby="e-title"
                autoComplete="off"
              />
              <div id="e-title" className="field-error" role="alert">
                {errorFor('title') ?? ''}
              </div>
            </div>

            {duplicates.length > 0 ? (
              <div className="span-2 dup-box">
                <div className="dup-head">
                  Possible duplicates ({duplicates.length})
                </div>
                {duplicates.map((match) => (
                  <div key={match.report.id} className="dup-item">
                    <span className="dup-score">{Math.round(match.score * 100)}%</span>
                    <span className="mono" style={{ color: 'var(--ink-300)' }}>
                      {match.report.ref}
                    </span>
                    <span style={{ flex: 1 }}>{match.report.title}</span>
                    <span className="hint">{match.reason}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setDuplicateOf(match.report.id)}
                    >
                      Mark duplicate
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {duplicateTarget ? (
              <div className="span-2 banner">
                <span>
                  This report will be filed as a duplicate of{' '}
                  <strong className="mono">{duplicateTarget.ref}</strong> - {duplicateTarget.title}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setDuplicateOf(null)}
                >
                  Undo
                </button>
              </div>
            ) : null}

            <div className="field">
              <label className="field-label" htmlFor="f-buildId">
                Build<span className="req" aria-hidden="true">*</span>
              </label>
              <select
                id="f-buildId"
                className={fieldClass('buildId', 'select')}
                value={draft.buildId}
                onChange={(event) => set('buildId', event.target.value)}
                aria-invalid={Boolean(errorFor('buildId'))}
              >
                {db.builds.map((build) => (
                  <option key={build.id} value={build.id}>
                    {build.version} {build.name}
                  </option>
                ))}
              </select>
              <div className="field-error">{errorFor('buildId') ?? ''}</div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="f-area">
                Stage or feature<span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-area"
                className={fieldClass('area')}
                value={draft.area}
                onChange={(event) => set('area', event.target.value)}
                placeholder="Stage 4 checkpoint"
                aria-invalid={Boolean(errorFor('area'))}
              />
              <div className="field-error">{errorFor('area') ?? ''}</div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="f-category">
                Category<span className="req" aria-hidden="true">*</span>
              </label>
              <select
                id="f-category"
                className={fieldClass('category', 'select')}
                value={draft.category}
                onChange={(event) =>
                  set('category', event.target.value as ReportDraft['category'])
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABEL[category]}
                  </option>
                ))}
              </select>
              <div className="hint">{CATEGORY_HINT[draft.category]}</div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="f-platform">
                Device
              </label>
              <select
                id="f-platform"
                className="select"
                value={draft.platform}
                onChange={(event) =>
                  set('platform', event.target.value as ReportDraft['platform'])
                }
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {PLATFORM_LABEL[platform]}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="span-2" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field-label" style={{ padding: 0, marginBottom: 6 }}>
                Severity<span className="req" aria-hidden="true">*</span>
              </legend>
              <div className="seg" id="f-severity">
                {SEVERITIES.map((severity) => (
                  <label
                    key={severity}
                    className={`seg-option${draft.severity === severity ? ' is-checked' : ''}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={severity}
                      checked={draft.severity === severity}
                      onChange={() => set('severity', severity)}
                    />
                    <span className="seg-top">
                      <span
                        className="sev-dot"
                        style={{ background: `var(${SEVERITY_COLOR_VAR[severity]})` }}
                        aria-hidden="true"
                      />
                      {SEVERITY_GLYPH[severity]} {SEVERITY_LABEL[severity]}
                    </span>
                    <span className="seg-desc">{SEVERITY_DEFINITION[severity]}</span>
                  </label>
                ))}
              </div>
              <div className="field-error">{errorFor('severity') ?? ''}</div>
            </fieldset>

            <div className="field">
              <label className="field-label" htmlFor="f-frequency">
                How often
              </label>
              <select
                id="f-frequency"
                className="select"
                value={draft.frequency}
                onChange={(event) =>
                  set('frequency', event.target.value as ReportDraft['frequency'])
                }
              >
                {FREQUENCIES.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {FREQUENCY_LABEL[frequency]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="f-reporter">
                Your name<span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-reporter"
                className={fieldClass('reporter')}
                value={draft.reporter}
                onChange={(event) => set('reporter', event.target.value)}
                placeholder="Nunna"
                aria-invalid={Boolean(errorFor('reporter'))}
              />
              <div className="field-error">{errorFor('reporter') ?? ''}</div>
            </div>

            <div className="field span-2">
              <label className="field-label" htmlFor="f-expected">
                Expected<span className="req" aria-hidden="true">*</span>
              </label>
              <textarea
                id="f-expected"
                className={fieldClass('expected', 'textarea')}
                value={draft.expected}
                onChange={(event) => set('expected', event.target.value)}
                placeholder="What should have happened?"
                aria-invalid={Boolean(errorFor('expected'))}
              />
              <div className="field-error">{errorFor('expected') ?? ''}</div>
            </div>

            <div className="field span-2">
              <label className="field-label" htmlFor="f-actual">
                Actual<span className="req" aria-hidden="true">*</span>
              </label>
              <textarea
                id="f-actual"
                className={fieldClass('actual', 'textarea')}
                value={draft.actual}
                onChange={(event) => set('actual', event.target.value)}
                placeholder="What actually happened?"
                aria-invalid={Boolean(errorFor('actual'))}
              />
              <div className="field-error">{errorFor('actual') ?? ''}</div>
            </div>

            <div className="field span-2">
              <div className="spread">
                <span className="field-label">Steps to reproduce</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={addStep}>
                  + Add step
                </button>
              </div>

              {draft.steps.length === 0 ? (
                <p className="hint">
                  Optional, but a numbered list is what makes a report reproducible.
                </p>
              ) : (
                <div className="steps">
                  {draft.steps.map((step, index) => (
                    <div className="step-row" key={index}>
                      <span className="step-index" aria-hidden="true">
                        {index + 1}.
                      </span>
                      <input
                        className="input"
                        value={step}
                        onChange={(event) => updateStep(index, event.target.value)}
                        placeholder="Join the experience on the current build"
                        aria-label={`Step ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => removeStep(index)}
                        aria-label={`Remove step ${index + 1}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="field-error">{errorFor('steps') ?? ''}</div>
            </div>

            <div className="field span-2">
              <label className="field-label" htmlFor="f-screenshotUrl">
                Screenshot or clip link
              </label>
              <input
                id="f-screenshotUrl"
                className={fieldClass('screenshotUrl')}
                value={draft.screenshotUrl}
                onChange={(event) => set('screenshotUrl', event.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errorFor('screenshotUrl'))}
                inputMode="url"
              />
              <div className="field-error">{errorFor('screenshotUrl') ?? ''}</div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dispatch({ type: 'form/close' })}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            File report
          </button>
        </div>
      </form>
    </dialog>
  );
}
