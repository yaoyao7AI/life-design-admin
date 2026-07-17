import eventsRequest from '../eventsRequest';
import { toApiClientError } from '../errors';

export type OrganizationStatus =
  | 'pending'
  | 'approved'
  | 'expired'
  | 'disabled'
  | string;

export interface Organization {
  id: number | string;
  name: string;
  status: OrganizationStatus;
  address?: string | null;
  admin_name?: string | null;
  admin_phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrganizationQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

export interface OrganizationInput {
  name: string;
  status: string;
  address?: string;
  admin_name?: string;
  admin_phone?: string;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

const API_BASE = '/api/organizations';

function normalizeOrganization(raw: Record<string, unknown>): Organization {
  return {
    id: (raw.id as number | string) ?? '',
    name: String(raw.name ?? ''),
    status: String(raw.status ?? '') as OrganizationStatus,
    address: (raw.address as string | null) ?? null,
    admin_name: (raw.admin_name as string | null) ?? null,
    admin_phone: (raw.admin_phone as string | null) ?? null,
    created_at: (raw.created_at as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  };
}

export async function getOrganizations(
  params: OrganizationQuery = {}
): Promise<Paginated<Organization>> {
  try {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };
    if (params.status) query.status = params.status;
    if (params.keyword?.trim()) query.keyword = params.keyword.trim();

    const { data } = await eventsRequest.get(API_BASE, { params: query });
    const payload = (data?.data ?? {}) as Record<string, unknown>;
    const list = Array.isArray(payload.list)
      ? (payload.list as Record<string, unknown>[]).map(normalizeOrganization)
      : [];

    return {
      list,
      total: Number(payload.total) || 0,
      page: Number(payload.page) || params.page || 1,
      pageSize: Number(payload.pageSize) || params.pageSize || 10,
    };
  } catch (err) {
    throw toApiClientError(err);
  }
}

export async function getOrganizationById(
  id: number | string
): Promise<Organization> {
  try {
    const { data } = await eventsRequest.get(`${API_BASE}/${id}`);
    return normalizeOrganization((data?.data ?? {}) as Record<string, unknown>);
  } catch (err) {
    throw toApiClientError(err);
  }
}

export async function createOrganization(
  input: OrganizationInput
): Promise<Organization> {
  try {
    const { data } = await eventsRequest.post(API_BASE, input);
    return normalizeOrganization((data?.data ?? {}) as Record<string, unknown>);
  } catch (err) {
    throw toApiClientError(err);
  }
}

export async function updateOrganization(
  id: number | string,
  input: OrganizationInput
): Promise<Organization> {
  try {
    const { data } = await eventsRequest.put(`${API_BASE}/${id}`, input);
    return normalizeOrganization((data?.data ?? {}) as Record<string, unknown>);
  } catch (err) {
    throw toApiClientError(err);
  }
}

export async function deleteOrganization(id: number | string): Promise<void> {
  try {
    await eventsRequest.delete(`${API_BASE}/${id}`);
  } catch (err) {
    throw toApiClientError(err);
  }
}
