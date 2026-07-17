/** 探索活动系统（huodongxing-backend）鉴权相关类型 */

/** Events Token 权限码 */
export const EVENTS_PERMISSIONS = {
  ORGANIZATIONS_READ: 'events.organizations.read',
  ORGANIZATIONS_WRITE: 'events.organizations.write',
  ACTIVITIES_READ: 'events.activities.read',
  ACTIVITIES_WRITE: 'events.activities.write',
  REGISTRATIONS_READ: 'events.registrations.read',
  REGISTRATIONS_WRITE: 'events.registrations.write',
} as const;

export type EventsPermissionCode =
  (typeof EVENTS_PERMISSIONS)[keyof typeof EVENTS_PERMISSIONS];

/** 换票返回的活动系统用户信息 */
export interface EventsUser {
  externalAdminId: string;
  role: string;
}

/** exchange-token 接口原始结果 */
export interface EventsExchangeResult {
  token: string;
  expiresIn: number;
  user: EventsUser;
  permissions: string[];
}

/** 内存中保存的活动系统会话 */
export interface EventsSession {
  token: string;
  permissions: string[];
  user: EventsUser;
  /** 绝对过期时间戳（毫秒），由 expiresIn 计算得出 */
  expiresAt: number;
}

/** EventsAuthContext 对外暴露的状态与方法 */
export interface EventsAuthContextValue {
  eventsToken: string | null;
  eventsPermissions: string[];
  eventsUser: EventsUser | null;
  expiresAt: number | null;
  loading: boolean;
  error: string | null;
  hasEventsPermission: (code: string) => boolean;
  /** 手动重新换票（用于错误页重试） */
  retry: () => void;
}
