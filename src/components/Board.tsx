import { useState } from 'react';
import type { Report, Status } from '../domain/types';
import { STATUSES, STATUS_LABEL } from '../domain/status';
import { useApp, useDispatch } from '../state/context';
import { ACTOR } from '../config';
import { ReportCard } from './ReportCard';

interface Props {
  reports: Report[];
}

export function Board({ reports }: Props) {
  const { db } = useApp();
  const dispatch = useDispatch();
  const [overColumn, setOverColumn] = useState<Status | null>(null);

  const move = (id: string, status: Status) => {
    dispatch({ type: 'report/status', id, status, actor: ACTOR });
  };

  return (
    <div className="board-wrap">
      <div className="board">
        {STATUSES.map((status) => {
          const columnReports = reports.filter((report) => report.status === status);

          return (
            <section
              key={status}
              className={`board-col${overColumn === status ? ' is-over' : ''}`}
              aria-label={`${STATUS_LABEL[status]} column, ${columnReports.length} reports`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (overColumn !== status) setOverColumn(status);
              }}
              onDragLeave={() => setOverColumn(null)}
              onDrop={(event) => {
                event.preventDefault();
                setOverColumn(null);
                const id = event.dataTransfer.getData('text/plain');
                if (id) move(id, status);
              }}
            >
              <header className="board-col-head">
                <span className="board-col-name">{STATUS_LABEL[status]}</span>
                <span className="board-col-count">{columnReports.length}</span>
              </header>

              <div className="col-body">
                {columnReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    member={db.members.find((m) => m.id === report.assigneeId) ?? null}
                    build={db.builds.find((b) => b.id === report.buildId)}
                    duplicateRef={
                      report.duplicateOf
                        ? db.reports.find((r) => r.id === report.duplicateOf)?.ref ?? null
                        : null
                    }
                    onOpen={(id) => dispatch({ type: 'report/select', id })}
                    onMove={move}
                  />
                ))}

                {columnReports.length === 0 ? (
                  <p className="hint" style={{ padding: '10px 6px', textAlign: 'center' }}>
                    Drop a card here
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
