import axios from 'axios';

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

const normalizeList = <T>(data: T[] | { list?: T[] } | { data?: T[] }): T[] => {
  if (Array.isArray(data)) return data;
  if ('list' in data && Array.isArray(data.list)) return data.list;
  if ('data' in data && Array.isArray(data.data)) return data.data;
  return [];
};

export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const response = await axios.get<MembershipPlan[] | { list?: MembershipPlan[] }>(
    API_BASE_URL
  );
  return normalizeList(response.data);
};

export const createMembershipPlan = async (
  data: MembershipPlanInput
): Promise<MembershipPlan> => {
  const response = await axios.post<MembershipPlan>(API_BASE_URL, data);
  return response.data;
};

export const updateMembershipPlan = async (
  id: string,
  data: MembershipPlanInput
): Promise<MembershipPlan> => {
  const response = await axios.put<MembershipPlan>(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const getUserMemberships = async (
  params: UserMembershipQuery = {}
): Promise<UserMembership[]> => {
  const response = await axios.get<UserMembership[] | { list?: UserMembership[] }>(
    `${API_BASE_URL}/user-membership`,
    { params }
  );
  return normalizeList(response.data);
};

export const createUserMembership = async (
  data: UserMembershipInput
): Promise<UserMembership> => {
  const response = await axios.post<UserMembership>(
    `${API_BASE_URL}/user-membership`,
    data
  );
  return response.data;
};

export const updateUserMembership = async (
  id: string,
  data: UserMembershipInput
): Promise<UserMembership> => {
  const response = await axios.put<UserMembership>(
    `${API_BASE_URL}/user-membership/${id}`,
    data
  );
  return response.data;
};
