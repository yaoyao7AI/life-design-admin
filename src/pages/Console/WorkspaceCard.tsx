import { useNavigate } from 'react-router-dom';
import { Button, Icon, type IconName } from '../../components/ui';

export interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: IconName;
  href: string;
  /** Phase 3 前探索中心可暂禁进，但 V1 有权限就展示可点击卡 */
  disabled?: boolean;
  disabledHint?: string;
}

export default function WorkspaceCard({
  title,
  description,
  icon,
  href,
  disabled,
  disabledHint,
}: WorkspaceCardProps) {
  const navigate = useNavigate();

  return (
    <article className="workspace-card">
      <div className="workspace-card__icon" aria-hidden>
        <Icon name={icon} size={22} />
      </div>
      <h2 className="workspace-card__title">{title}</h2>
      <p className="workspace-card__desc">{description}</p>
      {disabled ? (
        <p className="workspace-card__soon">{disabledHint || '即将开通'}</p>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate(href)}
        >
          进入工作台
        </Button>
      )}
    </article>
  );
}
