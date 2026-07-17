import request from '../request';
import { ApiClientError, toApiClientError } from '../errors';
import type { EventsExchangeResult } from '../../events-auth/types';

/**
 * 使用现有 Admin Token 向 life-design-backend 换取 Events Token。
 * 走 Admin request 实例（自动携带 Admin Bearer Token），
 * 换回的 Events Token 仅供 huodongxing-backend 使用，不覆盖 Admin Token。
 */
const EXCHANGE_URL = '/api/admin/events/exchange-token';

export async function exchangeEventsToken(): Promise<EventsExchangeResult> {
  try {
    const { data } = await request.post<{
      success: boolean;
      message?: string;
      data?: {
        token: string;
        expiresIn: number;
        user?: { externalAdminId?: string | number; role?: string };
        permissions?: string[];
      };
    }>(EXCHANGE_URL);

    if (!data?.success || !data.data?.token) {
      throw new ApiClientError(data?.message || '换取活动系统令牌失败', 400);
    }

    const payload = data.data;
    return {
      token: payload.token,
      expiresIn: Number(payload.expiresIn) > 0 ? Number(payload.expiresIn) : 1800,
      user: {
        externalAdminId: String(payload.user?.externalAdminId ?? ''),
        role: String(payload.user?.role ?? ''),
      },
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : [],
    };
  } catch (err) {
    throw toApiClientError(err);
  }
}
