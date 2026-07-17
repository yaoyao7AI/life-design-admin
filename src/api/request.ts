import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearStoredToken, getStoredToken } from '../auth/token';
import {
  AUTH_MESSAGES,
  getLoginPath,
  setAuthNotice,
  toApiClientError,
} from './errors';

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const baseURL = rawBase.replace(/\/$/, '');

/** 统一后台请求实例。业务 API 应使用此实例以自动附带 Admin Bearer Token。 */
export const request = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isAuthLoginRequest(config?: InternalAxiosRequestConfig): boolean {
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  return /\/api\/admin\/auth\/login\b/.test(url);
}

let handlingSessionExpired = false;

function redirectToLogin(notice?: string): void {
  if (typeof window === 'undefined') return;
  if (notice) setAuthNotice(notice);
  if (handlingSessionExpired) return;
  handlingSessionExpired = true;
  window.dispatchEvent(new CustomEvent('lda:unauthorized'));
  const current = window.location.pathname;
  if (!current.endsWith('/login')) {
    window.location.assign(getLoginPath());
  }
  setTimeout(() => {
    handlingSessionExpired = false;
  }, 800);
}

request.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const clientError = toApiClientError(error);

    // 登录接口的 401 表示凭据错误，不视为会话失效
    if (isAuthLoginRequest(error.config)) {
      return Promise.reject(clientError);
    }

    if (status === 401) {
      clearStoredToken();
      redirectToLogin(AUTH_MESSAGES.unauthorized);
      return Promise.reject(clientError);
    }

    if (status === 403 && /\/api\/admin\/auth\/me\b/.test(
      `${error.config?.baseURL || ''}${error.config?.url || ''}`
    )) {
      clearStoredToken();
      redirectToLogin(AUTH_MESSAGES.forbiddenAccount);
      return Promise.reject(clientError);
    }

    if (status === 403) {
      return Promise.reject(clientError);
    }

    // 其它错误保留 axios 形态，以便 CMS fallback 的 404 检测等逻辑继续工作
    return Promise.reject(error);
  }
);

export default request;
