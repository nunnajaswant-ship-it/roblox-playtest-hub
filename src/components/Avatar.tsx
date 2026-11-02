import type { Member } from '../domain/types';

interface Props {
  member: Member | null;
  size?: 'sm' | 'lg';
}

export function Avatar({ member, size = 'sm' }: Props) {
  if (!member) {
    return (
      <span
        className={`avatar${size === 'lg' ? ' avatar-lg' : ''}`}
        style={{ background: 'var(--ink-500)', color: 'var(--ink-300)' }}
        title="Unassigned"
        aria-label="Unassigned"
      >
        --
      </span>
    );
  }

  return (
    <span
      className={`avatar${size === 'lg' ? ' avatar-lg' : ''}`}
      style={{ background: `var(${member.tint})` }}
      title={`${member.name} - ${member.role}`}
      aria-label={member.name}
    >
      {member.initials}
    </span>
  );
}
