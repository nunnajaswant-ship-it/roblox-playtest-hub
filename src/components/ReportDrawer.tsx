import { useEffect, useRef, useState } from 'react';
import type { Status } from '../domain/types';
import { STATUSES, STATUS_LABEL } from '../domain/status';
import { CATEGORY_LABEL, FREQUENCY_LABEL, PLATFORM_LABEL } from '../domain/category';
import { useApp, useDispatch } from '../state/context';
import { ACTOR } from '../config';
import { SeverityBadge } from './SeverityBadge';
import { StatusPill } from './StatusPill';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ReportDrawer() {
  const { db, selectedId } = useApp();
  const dispatch = useDispatch();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [comment, setComment] = useState('');

  const report = db.reports.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (report && !el.open) {
      setComment('');
      el.showModal();
    } else if (!report && el.open) {
      el.close();
    }
  }, [report]);

  if (!report) {
    return <dialog ref={dialogRef} onClose={() => dispatch({ type: 'report/select', id: null })} />;
  }

  const build = db.builds.find((item) => item.id === report.buildId);
  const assignee = db.members.find((item) => item.id === report.assigneeId) ?? null;
  const duplicate = db.reports.find((item) => item.id === report.duplicateOf) ?? null;

  const close = () => dispatch({ type: 'report/select', id: null });

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => {
        if (selectedId) close();
      }}
      aria-labelledby="drawer-title"
    >
      <div className="drawer-head">
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <span className="ref">{report.ref}</span>
            <SeverityBadge severity={report.severity} />
            <StatusPill status={report.status} />
          </div>
          <h2 id="drawer-title" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 620 }}>
            {report.title}
          </h2>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={close}
          aria-label="Close report"
        >
          x
        </button>
      </div>

      <div className="drawer-body">
        {duplicate ? (
          <div className="banner">
            Filed as a duplicate of{' '}
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => dispatch({ type: 'report/select', id: duplicate.id })}
            >
              {duplicate.ref} - {duplicate.title}
            </button>
          </div>
        ) : null}

        <div className="panel">
          <div className="panel-head">
            <span className="section-title">Triage</span>
          </div>
          <div className="panel-body stack">
            <div className="form-grid">
              <div className="field">
                <label className="field-label" htmlFor="d-status">
                  Status
                </label>
                <select
                  id="d-status"
                  className="select"
                  value={report.status}
                  onChange={(event) =>
                    dispatch({
                      type: 'report/status',
                      id: report.id,
                      status: event.target.value as Status,
                      actor: ACTOR
                    })
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="d-assignee">
                  Assignee
                </label>
                <select
                  id="d-assignee"
                  className="select"
                  value={report.assigneeId ?? ''}
                  onChange={(event) =>
                    dispatch({
                      type: 'report/assign',
                      id: report.id,
                      assigneeId: event.target.value === '' ? null : event.target.value,
                      actor: ACTOR
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {db.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field span-2">
                <label className="field-label" htmlFor="d-duplicate">
                  Duplicate of
                </label>
                <select
                  id="d-duplicate"
                  className="select"
                  value={report.duplicateOf ?? ''}
                  onChange={(event) =>
                    dispatch({
                      type: 'report/duplicate',
                      id: report.id,
                      duplicateOf: event.target.value === '' ? null : event.target.value,
                      actor: ACTOR
                    })
                  }
                >
                  <option value="">Not a duplicate</option>
                  {db.reports
                    .filter((item) => item.id !== report.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.ref} - {item.title.slice(0, 60)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="section-title">Details</span>
          </div>
          <div className="panel-body stack">
            <dl className="kv">
              <dt>Build</dt>
              <dd>
                {build ? `${build.version} ${build.name}` : 'Unknown'}
                {build?.isLive ? ' (live)' : ''}
              </dd>
              <dt>Area</dt>
              <dd>{report.area}</dd>
              <dt>Category</dt>
              <dd>{CATEGORY_LABEL[report.category]}</dd>
              <dt>Device</dt>
              <dd>{PLATFORM_LABEL[report.platform]}</dd>
              <dt>Frequency</dt>
              <dd>{FREQUENCY_LABEL[report.frequency]}</dd>
              <dt>Reporter</dt>
              <dd>{report.reporter}</dd>
              <dt>Assignee</dt>
              <dd>{assignee ? `${assignee.name} - ${assignee.role}` : 'Unassigned'}</dd>
              <dt>Filed</dt>
              <dd>{formatDate(report.createdAt)}</dd>
            </dl>

            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>
                Expected
              </div>
              <p className="prose">{report.expected}</p>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>
                Actual
              </div>
              <p className="prose">{report.actual}</p>
            </div>

            {report.steps.length > 0 ? (
              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>
                  Steps to reproduce
                </div>
                <ol className="steps-view">
                  {report.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {report.screenshotUrl ? (
              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>
                  Evidence
                </div>
                <a href={report.screenshotUrl} target="_blank" rel="noreferrer noopener">
                  Open screenshot or clip
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="section-title">Activity</span>
            <span className="hint">{report.history.length} entries</span>
          </div>
          <div className="panel-body stack">
            <div className="timeline">
              {[...report.history].reverse().map((entry) => (
                <div className="timeline-item" key={entry.id}>
                  <span className={`timeline-dot is-${entry.kind}`} aria-hidden="true" />
                  <div>
                    <div className="timeline-text">{entry.text}</div>
                    <div className="timeline-at">
                      {entry.by} - {formatDate(entry.at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="d-comment">
                Add a note
              </label>
              <textarea
                id="d-comment"
                className="textarea"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Reproduced on mobile, happens after a rejoin."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="drawer-foot">
        <button type="button" className="btn btn-ghost" onClick={close}>
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={comment.trim() === ''}
          onClick={() => {
            dispatch({
              type: 'report/comment',
              id: report.id,
              text: comment,
              actor: ACTOR
            });
            setComment('');
          }}
        >
          Add note
        </button>
      </div>
    </dialog>
  );
}
