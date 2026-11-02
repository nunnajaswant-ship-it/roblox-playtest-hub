import type { CSSProperties } from 'react';
import type { Build, Member, Report, Status } from '../domain/types';
import { SEVERITY_COLOR_VAR } from '../domain/severity';
import { CATEGORY_LABEL } from '../domain/category';
import { nextStatus, previousStatus, STATUS_LABEL } from '../domain/status';
import { SeverityBadge } from './SeverityBadge';
import { Avatar } from './Avatar';

interface Props {
  report: Report;
  member: Member | null;
  build: Build | undefined;
  duplicateRef?: string | null;
  onOpen: (id: string) => void;
  onMove: (id: string, status: Status) => void;
}

export function ReportCard({ report, member, build, duplicateRef, onOpen, onMove }: Props) {
  const previous = previousStatus(report.status);
  const next = nextStatus(report.status);

  const style = {
    '--card-sev': `var(${SEVERITY_COLOR_VAR[report.severity]})`
  } as CSSProperties;

  return (
    <article
      className="card"
      style={style}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', report.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="card-top">
        <SeverityBadge severity={report.severity} />
        <span className="ref">{report.ref}</span>
      </div>

      <button type="button" className="card-title" onClick={() => onOpen(report.id)}>
        {report.title}
      </button>

      <div className="card-meta">
        <span>{build ? build.version : 'Unknown build'}</span>
        <span aria-hidden="true">/</span>
        <span>{report.area}</span>
        <span aria-hidden="true">/</span>
        <span>{CATEGORY_LABEL[report.category]}</span>
        {duplicateRef ? (
          <span className="chip" style={{ color: 'var(--verdict-watch)' }}>
            dup of {duplicateRef}
          </span>
        ) : null}
        <span style={{ marginLeft: 'auto' }}>
          <Avatar member={member} />
        </span>
      </div>

      <div className="card-actions">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={!previous}
          onClick={() => previous && onMove(report.id, previous)}
          aria-label={`Move ${report.ref} to ${previous ? STATUS_LABEL[previous] : 'nothing'}`}
        >
          &larr;
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onOpen(report.id)}
        >
          Open
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={!next}
          onClick={() => next && onMove(report.id, next)}
          aria-label={`Move ${report.ref} to ${next ? STATUS_LABEL[next] : 'nothing'}`}
        >
          &rarr;
        </button>
      </div>
    </article>
  );
}
