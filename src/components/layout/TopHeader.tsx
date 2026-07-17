import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Breadcrumb from './Breadcrumb';
import { findNavByPath } from '../../config/nav';
import { useAuth } from '../../auth/useAuth';

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export default function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const { pathname } = useLocation();
  const nav = findNavByPath(pathname);
  const { currentUser, logout } = useAuth();

  const crumbs = [
    { label: '控制台' },
    ...(nav?.groupLabel ? [{ label: nav.groupLabel }] : []),
    ...(nav ? [{ label: nav.label }] : []),
  ];

  const letter = (currentUser?.name || '运').trim().charAt(0);

  return (
    <header className="admin-header">
      <button
        type="button"
        className="admin-header__menu-btn"
        onClick={onToggleSidebar}
        aria-label="切换菜单"
      >
        <Icon name="menu" size={18} />
      </button>

      <Breadcrumb items={crumbs} />

      <div className="admin-header__spacer" />

      <div className="admin-header__actions">
        <Link to="/console" className="admin-header__console-link">
          控制台
        </Link>
        <button
          type="button"
          className="admin-header__text-btn"
          onClick={() => void logout()}
        >
          退出
        </button>
        <div
          className="admin-header__avatar"
          title={currentUser?.name || '运营'}
        >
          {letter}
        </div>
      </div>
    </header>
  );
}
