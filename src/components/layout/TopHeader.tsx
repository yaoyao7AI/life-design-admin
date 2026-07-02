import { useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Breadcrumb from './Breadcrumb';
import { findNavByPath } from '../../config/nav';

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export default function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const { pathname } = useLocation();
  const nav = findNavByPath(pathname);

  const crumbs = [
    { label: '首页' },
    ...(nav?.groupLabel ? [{ label: nav.groupLabel }] : []),
    ...(nav ? [{ label: nav.label }] : []),
  ];

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
        <button className="admin-header__icon-btn" aria-label="通知">
          <Icon name="bell" size={18} />
        </button>
        <button className="admin-header__icon-btn" aria-label="设置">
          <Icon name="settings" size={18} />
        </button>
        <div className="admin-header__avatar" title="运营">
          运
        </div>
      </div>
    </header>
  );
}
