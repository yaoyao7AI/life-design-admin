import { exchangeEventsToken } from '../api/events/exchangeToken';
import type { EventsSession } from './types';

/**
 * Events Token 仅存内存（V1）：
 * - 不写 localStorage / sessionStorage
 * - 页面刷新后清空，由 EventsAuthProvider 重新换票
 * - 作为 React 状态与 axios 拦截器之间的桥梁（拦截器无法读 React 状态）
 */
let session: EventsSession | null = null;
let inflight: Promise<EventsSession> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeEvents(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** useSyncExternalStore 快照：仅在 session 引用变化时更新 */
export function getEventsSnapshot(): EventsSession | null {
  return session;
}

export function getEventsToken(): string | null {
  return session?.token ?? null;
}

export function setEventsSession(next: EventsSession | null): void {
  session = next;
  emit();
}

export function clearEventsToken(): void {
  if (session === null) return;
  session = null;
  emit();
}

/**
 * 换票（去重并发调用）。成功后写入内存并通知订阅者。
 * expiresAt = now + expiresIn * 1000。
 */
export async function exchangeEventsSession(): Promise<EventsSession> {
  if (inflight) return inflight;

  inflight = (async () => {
    const result = await exchangeEventsToken();
    const next: EventsSession = {
      token: result.token,
      permissions: result.permissions,
      user: result.user,
      expiresAt: Date.now() + result.expiresIn * 1000,
    };
    setEventsSession(next);
    return next;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
