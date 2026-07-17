import { useAuth } from '../../auth/useAuth';
import { hasAnyCenterAccess, PERMISSIONS } from '../../auth/permissions';
import { Button } from '../../components/ui';
import WorkspaceCard from './WorkspaceCard';
import './console.css';

function avatarLetter(name?: string): string {
  if (!name) return '用';
  return name.trim().charAt(0).toUpperCase();
}

export default function ConsolePage() {
  const { currentUser, permissions, logout, hasPermission } = useAuth();
  const showGrowth = hasPermission(PERMISSIONS.GROWTH_ACCESS);
  const showEvents = hasPermission(PERMISSIONS.EVENTS_ACCESS);
  const hasCenter = hasAnyCenterAccess(permissions);

  return (
    <div className="console-page">
      <header className="console-page__header">
        <div className="console-page__user">
          <div className="console-page__avatar" title={currentUser?.name}>
            {avatarLetter(currentUser?.name)}
          </div>
          <div className="console-page__user-meta">
            <div className="console-page__user-name">
              {currentUser?.name || '用户'}
            </div>
            <div className="console-page__user-role">
              {currentUser?.role || ''}
            </div>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => void logout()}>
          退出登录
        </Button>
      </header>

      <main className="console-page__main">
        <div className="console-page__brand">Design Your Life 控制台</div>
        <h1 className="console-page__title">设计你的人生管理系统</h1>
        <p className="console-page__subtitle">选择要进入的工作台</p>

        {!hasCenter ? (
          <div className="console-page__empty">
            暂无可访问的工作台，请联系管理员分配权限。
          </div>
        ) : (
          <div className="console-page__grid">
            {showGrowth && (
              <WorkspaceCard
                title="成长运营中心"
                description="管理文章、主题、首页配置、课程、会员内容与肯定语。"
                icon="sparkles"
                href="/growth/articles"
              />
            )}
            {showEvents && (
              <WorkspaceCard
                title="探索运营中心"
                description="管理主办方、活动、报名、审核与活动运营数据。"
                icon="layers"
                href="/events"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
