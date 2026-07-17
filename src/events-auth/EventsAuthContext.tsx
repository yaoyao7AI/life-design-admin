import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/useAuth';
import { PERMISSIONS, hasPermission as checkPermission } from '../auth/permissions';
import { ApiClientError } from '../api/errors';
import {
  clearEventsToken,
  exchangeEventsSession,
  getEventsSnapshot,
  subscribeEvents,
} from './eventsTokenStore';
import type { EventsAuthContextValue } from './types';

export const EventsAuthContext = createContext<EventsAuthContextValue | null>(
  null
);

/**
 * 进入 /events/* 时自动换票：
 * 1. 确认当前用户具有 center.events.access（路由已守卫，此处双保险）
 * 2. 使用现有 Admin request 调用 exchange-token
 * 3. 保存 token/permissions/user，并按 expiresIn 计算 expiresAt
 * 4. 换票完成前 loading=true；失败时 error 有值，均由门禁组件拦截业务页
 * 5. content_admin 等无 events 权限不触发换票
 * 6. Provider 卸载（离开 /events）时清空内存 Events Token
 */
export function EventsAuthProvider({ children }: { children: ReactNode }) {
  const { permissionsLoaded, hasPermission } = useAuth();
  const session = useSyncExternalStore(
    subscribeEvents,
    getEventsSnapshot,
    getEventsSnapshot
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const runExchange = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await exchangeEventsSession();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : '接入探索活动服务失败，请稍后重试。';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!permissionsLoaded) return;
    if (startedRef.current) return;

    // 无 events 权限不触发换票（content_admin 已被路由守卫拦截）
    if (!hasPermission(PERMISSIONS.EVENTS_ACCESS)) {
      setLoading(false);
      setError(null);
      return;
    }

    startedRef.current = true;
    void runExchange();
  }, [permissionsLoaded, hasPermission, runExchange]);

  // 离开探索运营中心时清空内存 Token
  useEffect(() => {
    return () => {
      clearEventsToken();
    };
  }, []);

  const retry = useCallback(() => {
    startedRef.current = true;
    void runExchange();
  }, [runExchange]);

  const value = useMemo<EventsAuthContextValue>(
    () => ({
      eventsToken: session?.token ?? null,
      eventsPermissions: session?.permissions ?? [],
      eventsUser: session?.user ?? null,
      expiresAt: session?.expiresAt ?? null,
      loading,
      error,
      hasEventsPermission: (code: string) =>
        checkPermission(session?.permissions ?? [], code),
      retry,
    }),
    [session, loading, error, retry]
  );

  return (
    <EventsAuthContext.Provider value={value}>
      {children}
    </EventsAuthContext.Provider>
  );
}
