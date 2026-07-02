import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { navGroups, standaloneNav } from '../../config/nav';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export default function Sidebar({ open, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}>
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">
          <Icon name="sparkles" size={18} />
        </div>
        <div className="admin-sidebar__brand-text">
          <span className="admin-sidebar__brand-title">Design Your Life</span>
          <span className="admin-sidebar__brand-sub">内容操作中心</span>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        {navGroups.map((group) => {
          const isOpen = !collapsed[group.key];
          return (
            <div className="admin-nav-group" key={group.key}>
              <button
                type="button"
                className="admin-nav-group__header"
                onClick={() => toggleGroup(group.key)}
              >
                <Icon name={group.icon} size={14} />
                <span>{group.label}</span>
                <Icon
                  name="chevron-down"
                  size={14}
                  className={`admin-nav-group__chevron ${
                    isOpen ? 'admin-nav-group__chevron--open' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="admin-nav-group__items">
                  {group.children.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `admin-nav-link ${
                          isActive ? 'admin-nav-link--active' : ''
                        }`
                      }
                    >
                      {item.icon && (
                        <Icon
                          name={item.icon}
                          size={17}
                          className="admin-nav-link__icon"
                        />
                      )}
                      <span className="admin-nav-link__label">
                        {item.label}
                      </span>
                      {item.placeholder && (
                        <span className="admin-nav-link__tag">Soon</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {standaloneNav.length > 0 && (
          <div className="admin-nav-group">
            <div className="admin-sidebar__section-label">其他模块</div>
            <div className="admin-nav-group__items">
              {standaloneNav.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`
                  }
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={17}
                      className="admin-nav-link__icon"
                    />
                  )}
                  <span className="admin-nav-link__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
