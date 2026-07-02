import type { ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon">
        <Icon name={icon} size={26} />
      </div>
      <div className="ui-empty__title">{title}</div>
      {description && <div className="ui-empty__desc">{description}</div>}
      {action && <div className="ui-empty__actions">{action}</div>}
    </div>
  );
}
