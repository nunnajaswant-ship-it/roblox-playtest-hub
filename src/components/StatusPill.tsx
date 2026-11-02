import type { Status } from '../domain/types';
import { STATUS_LABEL } from '../domain/status';

const STATUS_COLOR: Record<Status, string> = {
  new: 'var(--status-new)',
  triaged: 'var(--status-triaged)',
  in_progress: 'var(--status-progress)',
  fixed: 'var(--status-fixed)',
  verified: 'var(--status-verified)',
  wont_fix: 'var(--status-wontfix)'
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className="status-pill" style={{ color: STATUS_COLOR[status] }}>
      {STATUS_LABEL[status]}
    </span>
  );
}
