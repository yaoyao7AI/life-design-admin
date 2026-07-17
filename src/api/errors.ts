import type { AxiosError } from 'axios';

/** 面向用户的鉴权 / 权限错误，不透传服务器内部原文 */
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

export const AUTH_MESSAGES = {
  unauthorized: '登录状态已失效，请重新登录',
  forbidden: '当前账号没有该操作权限',
  forbiddenAccount: '当前账号无权访问或已被禁用，请重新登录',
  loginFailed: '账号或密码错误',
  network: '网络异常，请稍后重试',
} as const;

const AUTH_NOTICE_KEY = 'lda_auth_notice';

export function setAuthNotice(message: string): void {
  try {
    sessionStorage.setItem(AUTH_NOTICE_KEY, message);
  } catch {
    // ignore
  }
}

export function consumeAuthNotice(): string | null {
  try {
    const msg = sessionStorage.getItem(AUTH_NOTICE_KEY);
    if (msg) sessionStorage.removeItem(AUTH_NOTICE_KEY);
    return msg;
  } catch {
    return null;
  }
}

function pickSafeClientMessage(
  status: number,
  bodyMessage?: string
): string {
  if (status === 401) return AUTH_MESSAGES.unauthorized;
  if (status === 403) return AUTH_MESSAGES.forbidden;
  if (status === 400 || status === 422) {
    if (
      bodyMessage &&
      bodyMessage.length < 80 &&
      !/sql|stack|error:|exception/i.test(bodyMessage)
    ) {
      return bodyMessage;
    }
  }
  return AUTH_MESSAGES.network;
}

export function toApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error;

  const ax = error as AxiosError<{ message?: string; code?: string }>;
  if (ax?.isAxiosError) {
    if (!ax.response) {
      return new ApiClientError(AUTH_MESSAGES.network, 0);
    }
    const status = ax.response.status;
    const bodyMessage = ax.response.data?.message;
    const code = ax.response.data?.code;
    return new ApiClientError(
      pickSafeClientMessage(status, bodyMessage),
      status,
      code
    );
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message || AUTH_MESSAGES.network, 0);
  }

  return new ApiClientError(AUTH_MESSAGES.network, 0);
}

export function getLoginPath(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/login`;
}
