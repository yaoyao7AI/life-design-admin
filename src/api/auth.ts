import request from './request';
import type {
  AuthApiResponse,
  AuthMeData,
  LoginPayload,
  LoginResult,
} from '../auth/types';
import { getStoredToken } from '../auth/token';
import {
  AUTH_MESSAGES,
  ApiClientError,
  toApiClientError,
} from './errors';
import {
  isAuthMockEnabled,
  mockGetMe,
  mockLogin,
  mockLogout,
} from '../mocks/authMock';

const AUTH_BASE = '/api/admin/auth';

/**
 * 登录参数集中在此模块。页面只传 LoginPayload，不散落字段名。
 * 成功响应一律按 data.token / data.user / data.permissions 读取。
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  if (isAuthMockEnabled()) {
    return mockLogin(payload.identifier, payload.password);
  }

  try {
    const { data } = await request.post<
      AuthApiResponse<{
        token: string;
        user: LoginResult['user'];
        permissions: string[];
      }>
    >(`${AUTH_BASE}/login`, {
      identifier: payload.identifier,
      password: payload.password,
    });

    if (!data?.success || !data.data?.token) {
      throw new ApiClientError(
        data?.message || AUTH_MESSAGES.loginFailed,
        400
      );
    }

    return {
      token: data.data.token,
      user: data.data.user,
      permissions: data.data.permissions ?? [],
    };
  } catch (err) {
    const client = toApiClientError(err);
    if (client.status === 401 || client.status === 400) {
      throw new ApiClientError(
        client.message === AUTH_MESSAGES.unauthorized
          ? AUTH_MESSAGES.loginFailed
          : client.message || AUTH_MESSAGES.loginFailed,
        client.status
      );
    }
    throw client;
  }
}

export async function getMe(): Promise<AuthMeData> {
  if (isAuthMockEnabled()) {
    const token = getStoredToken();
    if (!token) throw new ApiClientError(AUTH_MESSAGES.unauthorized, 401);
    return mockGetMe(token);
  }

  try {
    const { data } = await request.get<AuthApiResponse<AuthMeData>>(
      `${AUTH_BASE}/me`
    );

    if (!data?.success || !data.data?.user) {
      throw new ApiClientError(
        data?.message || AUTH_MESSAGES.unauthorized,
        401
      );
    }

    return {
      user: data.data.user,
      permissions: data.data.permissions ?? [],
    };
  } catch (err) {
    throw toApiClientError(err);
  }
}

/**
 * 无论后端是否成功，调用方必须清理本地态并跳转登录页。
 */
export async function logout(): Promise<void> {
  if (isAuthMockEnabled()) {
    await mockLogout();
    return;
  }

  try {
    await request.post(`${AUTH_BASE}/logout`);
  } catch {
    // 后端失败仍由调用方清理本地 token
  }
}
