import type { ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: Props) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {children ? <div className="empty-body">{children}</div> : null}
      {action}
    </div>
  );
}
