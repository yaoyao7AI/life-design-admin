import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './layout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div
        className={`admin-backdrop ${
          sidebarOpen ? 'admin-backdrop--show' : ''
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <TopHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="admin-content">
          <div className="admin-content__inner dyl-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
