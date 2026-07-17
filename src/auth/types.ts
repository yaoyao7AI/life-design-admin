/** 后台管理员角色（与 /api/admin/auth/me 对齐） */
export type AdminRole =
  | 'super_admin'
  | 'content_admin'
  | 'event_admin'
  | 'organizer'
  | string;

export interface AdminUser {
  id: number;
  name: string;
  identifier?: string;
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  role: AdminRole;
}

export interface AuthMeData {
  user: AdminUser;
  permissions: string[];
}

export interface AuthApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AdminUser;
  permissions: string[];
}
