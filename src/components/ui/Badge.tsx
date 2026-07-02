import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

export default function Badge({
  tone = 'neutral',
  dot = false,
  children,
}: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${tone}`}>
      {dot && <span className="ui-badge__dot" />}
      {children}
    </span>
  );
}
