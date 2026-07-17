import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Button } from '../../components/ui';
import { eventsNavItems, findEventsNavByPath } from '../../config/eventsNav';
import { useEventsAuth } from '../../events-auth/useEventsAuth';
import './events.css';

/** 换票门禁：完成前显示 Loading，失败时展示错误且不进入业务页 */
function EventsAuthGate({ children }: { children: ReactNode }) {
  const { loading, error, retry } = useEventsAuth();

  if (loading) {
    return (
      <div className="events-gate" role="status" aria-live="polite">
        <div className="events-gate__spinner" />
        <p className="events-gate__text">正在接入探索活动服务…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-gate events-gate--error" role="alert">
        <div className="events-gate__title">无法接入探索活动服务</div>
        <p className="events-gate__text">{error}</p>
        <Button variant="primary" onClick={retry}>
          重新接入
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function EventsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const current = findEventsNavByPath(pathname);

  return (
    <div className="events-shell">
      <aside
        className={`events-sidebar ${
          sidebarOpen ? 'events-sidebar--open' : ''
        }`}
      >
        <div className="events-sidebar__brand">
          <div className="events-sidebar__logo">
            <Icon name="layers" size={16} />
          </div>
          <div className="events-sidebar__brand-text">
            <div className="events-sidebar__brand-title">探索运营中心</div>
            <div className="events-sidebar__brand-sub">Design Your Life</div>
          </div>
        </div>

        <nav className="events-sidebar__nav">
          {eventsNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/events'}
              className={({ isActive }) =>
                `events-nav-item ${isActive ? 'events-nav-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              <span>{item.label}</span>
              {item.comingSoon && (
                <span className="events-nav-item__soon">开发中</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="events-sidebar__footer">
          <Link to="/console" className="events-sidebar__back">
            ← 返回控制台
          </Link>
        </div>
      </aside>

      <div
        className={`events-backdrop ${
          sidebarOpen ? 'events-backdrop--show' : ''
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="events-main">
        <header className="events-header">
          <button
            type="button"
            className="events-header__menu"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="切换菜单"
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="events-header__title">
            {current?.label || '探索运营中心'}
          </div>
        </header>
        <main className="events-content">
          <div className="events-content__inner dyl-fade-in">
            <EventsAuthGate>
              <Outlet />
            </EventsAuthGate>
          </div>
        </main>
      </div>
    </div>
  );
}
