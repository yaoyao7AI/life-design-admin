import request from '../request';

const API_BASE_URL = '/api/growth/cms/membership';

export interface MembershipPlan {
  id: string;
  name: string;
  level: string;
  description?: string;
  price?: number;
  durationDays?: number;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserMembership {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  membershipId?: string;
  membershipLevel?: string;
  membershipName?: string;
  expiresAt?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MembershipPlanInput {
  name: string;
  level: string;
  description?: string;
  price?: number;
  durationDays?: number;
  isActive?: boolean;
  status?: string;
}

export interface UserMembershipInput {
  userId: string;
  membershipId: string;
  membershipLevel?: string;
  expiresAt?: string | null;
  status?: string;
}

export interface UserMembershipQuery {
  keyword?: string;
}

const unwrap = (payload: any): any => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
};

const normalizeList = <T>(input: any): T[] => {
  const data = unwrap(input);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.plans)) return data.plans;
    if (Array.isArray(data.list)) return data.list;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
};

// 后端仅支持 free / founder 两种 tier，这里把前端等级映射过去。
const levelToTier = (level?: string): 'free' | 'founder' => {
  const value = String(level ?? '').trim().toLowerCase();
  return value === '' || value === 'free' ? 'free' : 'founder';
};

// 生成满足后端唯一约束的 code。
const buildPlanCode = (input: MembershipPlanInput): string => {
  const base = String(input.level || input.name || 'plan')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return `${base || 'PLAN'}_${suffix}`;
};

// 后端套餐没有 level / price / durationDays / description 字段，
// 因此把这些信息编码进 benefits（JSON）以便读取时还原。
const buildBenefits = (input: MembershipPlanInput) => ({
  level: input.level ?? '',
  durationDays:
    input.durationDays === undefined || Number.isNaN(input.durationDays)
      ? null
      : input.durationDays,
  description: input.description ?? '',
});

const toCreatePayload = (input: MembershipPlanInput) => ({
  code: buildPlanCode(input),
  name: input.name,
  tier: levelToTier(input.level),
  billing_cycle: 'lifetime',
  price_cents:
    input.price === undefined || Number.isNaN(input.price)
      ? 0
      : Math.round(Number(input.price) * 100),
  benefits: buildBenefits(input),
  status: input.status === 'inactive' ? 'inactive' : 'active',
});

// 更新时不改动 code（避免唯一约束冲突并保持稳定）。
const toUpdatePayload = (input: MembershipPlanInput) => {
  const { code: _code, ...rest } = toCreatePayload(input);
  return rest;
};

const parseBenefits = (benefits: unknown): Record<string, any> | null => {
  if (benefits == null) return null;
  let value: any = benefits;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) return { features: value };
  if (typeof value === 'object') return value as Record<string, any>;
  return null;
};

const fromBackendPlan = (raw: any): MembershipPlan => {
  const meta = parseBenefits(raw?.benefits);
  const tier = raw?.tier === 'founder' ? 'founder' : raw?.tier;
  const status = raw?.status;
  const priceCents = Number(raw?.price_cents ?? raw?.priceCents ?? 0);
  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? '',
    level: meta?.level || (tier === 'founder' ? 'vip' : tier || 'free'),
    description: meta?.description ?? raw?.description ?? '',
    price:
      raw?.price !== undefined && raw?.price !== null
        ? Number(raw.price)
        : Number.isFinite(priceCents)
        ? priceCents / 100
        : 0,
    durationDays:
      meta?.durationDays != null
        ? Number(meta.durationDays)
        : Number(raw?.durationDays ?? raw?.duration_days ?? 0),
    isActive: status ? status === 'active' : true,
    status,
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  };
};

export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const response = await request.get(API_BASE_URL);
  return normalizeList<any>(response.data).map(fromBackendPlan);
};

export const createMembershipPlan = async (
  data: MembershipPlanInput
): Promise<MembershipPlan> => {
  const response = await request.post(API_BASE_URL, toCreatePayload(data));
  return fromBackendPlan(unwrap(response.data));
};

export const updateMembershipPlan = async (
  id: string,
  data: MembershipPlanInput
): Promise<MembershipPlan> => {
  const response = await request.put(`${API_BASE_URL}/${id}`, toUpdatePayload(data));
  return fromBackendPlan(unwrap(response.data));
};

export const getUserMemberships = async (
  params: UserMembershipQuery = {}
): Promise<UserMembership[]> => {
  const response = await request.get(`${API_BASE_URL}/user-membership`, { params });
  return normalizeList<UserMembership>(response.data);
};

export const createUserMembership = async (
  data: UserMembershipInput
): Promise<UserMembership> => {
  const response = await request.post(`${API_BASE_URL}/user-membership`, {
    user_id: data.userId,
    tier: levelToTier(data.membershipLevel),
    status: data.status === 'active' || !data.status ? 'active' : data.status,
    end_at: data.expiresAt || null,
    auto_renew: false,
  });
  return unwrap(response.data);
};

export const updateUserMembership = async (
  id: string,
  data: UserMembershipInput
): Promise<UserMembership> => {
  const response = await request.put(`${API_BASE_URL}/user-membership/${id}`, {
    tier: levelToTier(data.membershipLevel),
    status: data.status,
    end_at: data.expiresAt ?? undefined,
  });
  return unwrap(response.data);
};
