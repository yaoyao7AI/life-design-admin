import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import { AUTH_MESSAGES, ApiClientError, getLoginPath } from '../api/errors';
import { hasPermission as checkPermission } from './permissions';
import { clearStoredToken, getStoredToken, setStoredToken } from './token';
import type { AdminUser, LoginPayload } from './types';

export interface AuthContextValue {
  token: string | null;
  currentUser: AdminUser | null;
  permissions: string[];
  permissionsLoaded: boolean;
  isAuthenticated: boolean;
  /** 若已跳转外部主办方后台则返回 null */
  login: (payload: LoginPayload) => Promise<AdminUser | null>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function redirectOrganizerIfNeeded(role: string | undefined): Promise<boolean> {
  if (role !== 'organizer') return false;
  const url = import.meta.env.VITE_ORGANIZER_ADMIN_URL as string | undefined;
  if (url) {
    window.location.href = url;
    return true;
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const resetAuth = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setCurrentUser(null);
    setPermissions([]);
    setPermissionsLoaded(true);
  }, []);

  const refreshMe = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setToken(null);
      setCurrentUser(null);
      setPermissions([]);
      setPermissionsLoaded(true);
      return;
    }

    // /me 完成前保持 permissionsLoaded=false，避免菜单闪烁
    setPermissionsLoaded(false);

    try {
      const me = await authApi.getMe();
      setToken(stored);
      setCurrentUser(me.user);
      setPermissions(me.permissions ?? []);
      setPermissionsLoaded(true);
      await redirectOrganizerIfNeeded(me.user.role);
    } catch (err) {
      resetAuth();
      // 401/403 已由 request 拦截器跳转；此处兜底确保登录页可见
      if (
        err instanceof ApiClientError &&
        (err.status === 401 || err.status === 403)
      ) {
        return;
      }
    }
  }, [resetAuth]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setCurrentUser(null);
      setPermissions([]);
      setPermissionsLoaded(true);
    };
    window.addEventListener('lda:unauthorized', onUnauthorized);
    return () => window.removeEventListener('lda:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    setStoredToken(result.token);
    setToken(result.token);
    setCurrentUser(result.user);
    setPermissions(result.permissions ?? []);
    setPermissionsLoaded(true);

    const redirected = await redirectOrganizerIfNeeded(result.user.role);
    if (redirected) return null;
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      resetAuth();
      if (typeof window !== 'undefined') {
        window.location.assign(getLoginPath());
      }
    }
  }, [resetAuth]);

  const hasPermission = useCallback(
    (code: string) => checkPermission(permissions, code),
    [permissions]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      currentUser,
      permissions,
      permissionsLoaded,
      isAuthenticated: Boolean(token && currentUser),
      login,
      logout,
      hasPermission,
      refreshMe,
    }),
    [
      token,
      currentUser,
      permissions,
      permissionsLoaded,
      login,
      logout,
      hasPermission,
      refreshMe,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AUTH_MESSAGES };
