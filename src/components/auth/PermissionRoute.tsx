import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../auth/useAuth';

interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
  /** 无权限时跳转目标，默认 /console */
  fallback?: string;
}

/**
 * 已登录前提下校验中心权限。
 * 权限未加载完时显示 Loading，避免短暂露出无权限内容。
 */
export default function PermissionRoute({
  permission,
  children,
  fallback = '/console',
}: PermissionRouteProps) {
  const { permissionsLoaded, hasPermission } = useAuth();

  if (!permissionsLoaded) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-loading__spinner" />
        <p>正在加载权限…</p>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
