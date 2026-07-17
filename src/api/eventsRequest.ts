import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiClientError, toApiClientError } from './errors';
import {
  clearEventsToken,
  exchangeEventsSession,
  getEventsToken,
} from '../events-auth/eventsTokenStore';

/**
 * 探索活动系统（huodongxing-backend）专用请求实例。
 * - baseURL 使用 VITE_EVENTS_API_BASE_URL
 * - 仅携带 Events Token，绝不使用 Admin Token，也不读取 Admin Token 的 localStorage
 * - 401 自动重新换票一次并重试原请求一次，最多一次，禁止无限循环
 */
export const EVENTS_MESSAGES = {
  sessionExpired: '探索活动服务登录状态已失效，请重新进入探索运营中心。',
  forbidden: '当前账号没有该操作权限。',
} as const;

const rawBase =
  (import.meta.env.VITE_EVENTS_API_BASE_URL as string | undefined) || '';
const baseURL = rawBase.replace(/\/$/, '');

type RetriableConfig = InternalAxiosRequestConfig & {
  __eventsRetried?: boolean;
};

export const eventsRequest = axios.create({
  baseURL: baseURL || undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

eventsRequest.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getEventsToken();
  config.headers = config.headers ?? {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

eventsRequest.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;

    if (status === 401) {
      // 首次 401：清空 Events Token → 重新换票 → 用新 Token 重试原请求一次
      // （__eventsRetried 保证最多重试一次，二次 401 直接落到会话失效提示，杜绝无限循环）
      if (config && !config.__eventsRetried) {
        config.__eventsRetried = true;
        clearEventsToken();
        let next;
        try {
          next = await exchangeEventsSession();
        } catch {
          // 换票失败 → 会话失效
          clearEventsToken();
          return Promise.reject(
            new ApiClientError(EVENTS_MESSAGES.sessionExpired, 401)
          );
        }
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${next.token}`;
        // 重试请求：透传其真实结果与错误（如再次 401/403/500），不吞掉
        return eventsRequest(config);
      }
      clearEventsToken();
      return Promise.reject(
        new ApiClientError(EVENTS_MESSAGES.sessionExpired, 401)
      );
    }

    if (status === 403) {
      return Promise.reject(new ApiClientError(EVENTS_MESSAGES.forbidden, 403));
    }

    // 其它错误统一转成 ApiClientError，保留 status 供页面按状态映射文案
    return Promise.reject(toApiClientError(error));
  }
);

export default eventsRequest;
