import { useMemo, useState } from 'react';
import { useApp } from '../state/context';
import { analyze } from '../pipeline/triage';
import { SEVERITY_COLOR_VAR, SEVERITY_LABEL } from '../domain/severity';
import { CATEGORY_LABEL } from '../domain/category';
import { StatusPill } from '../components/StatusPill';
import { SeverityBadge } from '../components/SeverityBadge';

export function PipelineView() {
  const { db } = useApp();
  const [reportId, setReportId] = useState(db.reports[0]?.id ?? '');

  const report = db.reports.find((item) => item.id === reportId) ?? db.reports[0];
  const build = db.builds.find((item) => item.id === report?.buildId);

  const triage = useMemo(
    () => (report ? analyze(report, build) : null),
    [report, build]
  );

  if (!report || !triage) {
    return (
      <div className="view">
        <h1 className="view-title">Pipeline</h1>
        <p className="view-sub">No reports yet.</p>
      </div>
    );
  }

  const download = () => {
    const blob = new Blob([triage.workOrder], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${report.ref}-work-order.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const color = `var(${SEVERITY_COLOR_VAR[triage.suggested]})`;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Pipeline</h1>
          <p className="view-sub">
            Intake to release. Deterministic scoring, explicit routing, no hidden model.
          </p>
        </div>
        <select
          className="select"
          style={{ maxWidth: 380 }}
          aria-label="Choose a report to run through the pipeline"
          value={report.id}
          onChange={(event) => setReportId(event.target.value)}
        >
          {db.reports.map((item) => (
            <option key={item.id} value={item.id}>
              {item.ref} - {item.title.slice(0, 52)}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">
            {report.ref} - {report.title}
          </span>
          <span className="row" style={{ gap: 8 }}>
            <SeverityBadge severity={report.severity} />
            <StatusPill status={report.status} />
          </span>
        </div>
        <div className="panel-body">
          <dl className="kv">
            <dt>Build</dt>
            <dd>{build ? `${build.version} ${build.name}` : 'unknown'}</dd>
            <dt>Area</dt>
            <dd>{report.area}</dd>
            <dt>Category</dt>
            <dd>{CATEGORY_LABEL[report.category]}</dd>
            <dt>Reporter</dt>
            <dd>{report.reporter}</dd>
          </dl>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        <div className="stat">
          <span className="stat-label">Pipeline score</span>
          <span className="stat-value" style={{ color }}>{triage.score}</span>
          <span className="stat-hint">out of 100</span>
        </div>
        <div className="stat">
          <span className="stat-label">Suggested severity</span>
          <span className="stat-value" style={{ color, fontSize: 22 }}>
            {SEVERITY_LABEL[triage.suggested]}
          </span>
          <span className="stat-hint">tester said {SEVERITY_LABEL[report.severity]}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Confidence</span>
          <span className="stat-value">{triage.confidence}%</span>
          <span className="stat-hint">evidence quality</span>
        </div>
      </div>

      <div className={`banner${triage.route === 'human_required' ? ' banner-danger' : ''}`}>
        <div>
          <strong>{triage.routeLabel}</strong>
          <div style={{ marginTop: 4 }}>{triage.routeDetail}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Why this score</span>
        </div>
        <div className="panel-body">
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.9 }}>
            {triage.rationale.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Stages</span>
          <span className="hint">branch {triage.branch}</span>
        </div>
        <div className="panel-body">
          <div className="timeline">
            {triage.stages.map((stage) => (
              <div className="timeline-item" key={stage.id}>
                <span
                  className={`timeline-dot is-${
                    stage.state === 'complete' ? 'created' : stage.state === 'blocked' ? 'status' : 'assignee'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <div className="timeline-text">
                    <strong>{stage.label}</strong>
                    <span className="chip" style={{ marginLeft: 8 }}>{stage.state}</span>
                    <span className="chip" style={{ marginLeft: 4 }}>{stage.owner}</span>
                  </div>
                  <div className="timeline-at">{stage.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="section-title">Work order</span>
          <button type="button" className="btn btn-sm" onClick={download}>
            Download .md
          </button>
        </div>
        <div className="panel-body">
          <pre
            className="formula"
            style={{ whiteSpace: 'pre-wrap', maxHeight: 320, overflow: 'auto', margin: 0 }}
          >
            {triage.workOrder}
          </pre>
        </div>
      </div>
    </div>
  );
}
