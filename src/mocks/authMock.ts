import type { AuthMeData, LoginResult } from '../auth/types';
import { PERMISSIONS } from '../auth/permissions';

/**
 * 仅当 VITE_AUTH_MOCK=true 时启用。
 * 生产构建默认不会走 Mock（环境变量未设或为 false）。
 *
 * 登录 identifier 对照：
 * - super_admin / admin  → super_admin
 * - content_admin / content → content_admin
 * - event_admin / event → event_admin
 * - organizer → organizer（应跳转外部主办方后台）
 * - no_permission / none → 无任何中心权限
 * 任意其他账号密码（密码非空）→ super_admin
 */
export function isAuthMockEnabled(): boolean {
  return import.meta.env.VITE_AUTH_MOCK === 'true';
}

const MOCK_USERS: Record<
  string,
  { user: AuthMeData['user']; permissions: string[]; password: string }
> = {
  super_admin: {
    password: '123456',
    user: {
      id: 1,
      name: 'Alice',
      identifier: 'super_admin',
      role: 'super_admin',
    },
    permissions: [
      PERMISSIONS.GROWTH_ACCESS,
      PERMISSIONS.EVENTS_ACCESS,
      PERMISSIONS.SYSTEM_ACCESS,
    ],
  },
  admin: {
    password: '123456',
    user: {
      id: 1,
      name: 'Alice',
      identifier: 'admin',
      role: 'super_admin',
    },
    permissions: [
      PERMISSIONS.GROWTH_ACCESS,
      PERMISSIONS.EVENTS_ACCESS,
      PERMISSIONS.SYSTEM_ACCESS,
    ],
  },
  content_admin: {
    password: '123456',
    user: {
      id: 2,
      name: 'Content Admin',
      identifier: 'content_admin',
      role: 'content_admin',
    },
    permissions: [PERMISSIONS.GROWTH_ACCESS],
  },
  content: {
    password: '123456',
    user: {
      id: 2,
      name: 'Content Admin',
      identifier: 'content',
      role: 'content_admin',
    },
    permissions: [PERMISSIONS.GROWTH_ACCESS],
  },
  event_admin: {
    password: '123456',
    user: {
      id: 3,
      name: 'Event Admin',
      identifier: 'event_admin',
      role: 'event_admin',
    },
    permissions: [PERMISSIONS.EVENTS_ACCESS],
  },
  event: {
    password: '123456',
    user: {
      id: 3,
      name: 'Event Admin',
      identifier: 'event',
      role: 'event_admin',
    },
    permissions: [PERMISSIONS.EVENTS_ACCESS],
  },
  organizer: {
    password: '123456',
    user: {
      id: 4,
      name: 'Organizer',
      identifier: 'organizer',
      role: 'organizer',
    },
    permissions: [],
  },
  no_permission: {
    password: '123456',
    user: {
      id: 5,
      name: 'No Access',
      identifier: 'no_permission',
      role: 'content_admin',
    },
    permissions: [],
  },
  none: {
    password: '123456',
    user: {
      id: 5,
      name: 'No Access',
      identifier: 'none',
      role: 'content_admin',
    },
    permissions: [],
  },
};

const MOCK_SESSION_KEY = 'lda_admin_mock_session';

function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveMockProfile(identifier: string) {
  const key = identifier.trim().toLowerCase();
  return MOCK_USERS[key] ?? null;
}

export async function mockLogin(
  identifier: string,
  password: string
): Promise<LoginResult> {
  await delay();
  if (!identifier.trim() || !password) {
    throw new Error('请输入账号和密码');
  }

  const profile = resolveMockProfile(identifier);
  if (profile) {
    if (profile.password !== password) {
      throw new Error('账号或密码错误');
    }
    const token = `mock-token-${profile.user.role}-${profile.user.id}`;
    sessionStorage.setItem(
      MOCK_SESSION_KEY,
      JSON.stringify({ token, ...profile })
    );
    return {
      token,
      user: profile.user,
      permissions: profile.permissions,
    };
  }

  // 未映射账号：任意非空密码视为 super_admin，便于本地快速登录
  const fallback = MOCK_USERS.super_admin;
  const token = `mock-token-fallback-${Date.now()}`;
  const data = {
    token,
    user: {
      ...fallback.user,
      id: 99,
      name: identifier.trim(),
      identifier: identifier.trim(),
    },
    permissions: fallback.permissions,
  };
  sessionStorage.setItem(
    MOCK_SESSION_KEY,
    JSON.stringify({
      token,
      user: data.user,
      permissions: data.permissions,
      password: '',
    })
  );
  return data;
}

export async function mockGetMe(token: string): Promise<AuthMeData> {
  await delay(150);
  const raw = sessionStorage.getItem(MOCK_SESSION_KEY);
  if (raw) {
    const session = JSON.parse(raw) as {
      token: string;
      user: AuthMeData['user'];
      permissions: string[];
    };
    if (session.token === token) {
      return { user: session.user, permissions: session.permissions };
    }
  }

  // 刷新后 sessionStorage 可能仍在；若 token 形如 mock-token-{role}-{id}
  const match = /^mock-token-([a-z_]+)-(\d+)$/.exec(token);
  if (match) {
    const role = match[1];
    const byRole = Object.values(MOCK_USERS).find((u) => u.user.role === role);
    if (byRole) {
      return { user: byRole.user, permissions: byRole.permissions };
    }
  }

  if (token.startsWith('mock-token-fallback-')) {
    return {
      user: MOCK_USERS.super_admin.user,
      permissions: MOCK_USERS.super_admin.permissions,
    };
  }

  throw new Error('登录已失效，请重新登录');
}

export async function mockLogout(): Promise<void> {
  await delay(80);
  sessionStorage.removeItem(MOCK_SESSION_KEY);
}
