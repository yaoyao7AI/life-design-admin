import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../auth/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

/** 未登录 → /login；权限加载中 → Loading；organizer → 外部后台或提示 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { token, currentUser, permissionsLoaded, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!permissionsLoaded) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-loading__spinner" />
        <p>正在验证登录状态…</p>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentUser?.role === 'organizer') {
    const url = import.meta.env.VITE_ORGANIZER_ADMIN_URL as string | undefined;
    if (url) {
      window.location.href = url;
      return (
        <div className="auth-loading" role="status">
          <p>正在跳转主办方工作台…</p>
        </div>
      );
    }
    return (
      <div className="auth-organizer-hint">
        <h1>主办方账号</h1>
        <p>请前往主办方工作台登录。</p>
        <p className="auth-organizer-hint__sub">
          内部运营后台不提供主办方工作台。请配置环境变量{' '}
          <code>VITE_ORGANIZER_ADMIN_URL</code>。
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
