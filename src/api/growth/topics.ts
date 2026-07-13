import axios from 'axios';

const API_BASE_URL = '/api/growth/cms/topics';
const FALLBACK_API_BASE_URL = '/api/growth/topics';

export interface GrowthTopic {
  id: string;
  slug: string;
  name: string;
  order: number;
  articleCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGrowthTopicData {
  slug: string;
  name: string;
  order?: number;
}

export interface UpdateGrowthTopicData {
  slug: string;
  name: string;
  order?: number;
}

export interface SortGrowthTopicItem {
  id: string;
  order: number;
}

export interface SortGrowthTopicsPayload {
  topics: SortGrowthTopicItem[];
}

type BackendTopic = Record<string, unknown>;

const fromBackendTopic = (raw: BackendTopic): GrowthTopic => ({
  id: String(raw.id ?? ''),
  slug: String(raw.slug ?? ''),
  name: String(raw.name ?? ''),
  order: Number(raw.sort_order ?? raw.order ?? 0),
  articleCount: Number(raw.article_count ?? raw.articleCount ?? 0),
  createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  updatedAt: raw.updated_at != null ? String(raw.updated_at) : undefined,
});

const unwrapTopicItems = (raw: unknown): BackendTopic[] => {
  if (Array.isArray(raw)) return raw as BackendTopic[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data as BackendTopic[];
    if (data && typeof data === 'object') {
      const nested = data as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items as BackendTopic[];
      if (Array.isArray(nested.list)) return nested.list as BackendTopic[];
    }
    if (Array.isArray(obj.items)) return obj.items as BackendTopic[];
    if (Array.isArray(obj.list)) return obj.list as BackendTopic[];
  }
  return [];
};

const unwrapTopic = (raw: unknown): GrowthTopic => {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return fromBackendTopic((raw as { data: BackendTopic }).data);
  }
  return fromBackendTopic((raw as BackendTopic) ?? {});
};

const withTopicsFallback = async <T>(request: (base: string) => Promise<T>): Promise<T> => {
  try {
    return await request(API_BASE_URL);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return request(FALLBACK_API_BASE_URL);
    }
    throw error;
  }
};

export const getGrowthTopics = async (): Promise<GrowthTopic[]> => {
  const response = await withTopicsFallback((base) => axios.get(base));
  return unwrapTopicItems(response.data).map(fromBackendTopic);
};

export const createGrowthTopic = async (
  data: CreateGrowthTopicData
): Promise<GrowthTopic> => {
  const response = await withTopicsFallback((base) =>
    axios.post(base, {
      name: data.name,
      slug: data.slug,
      sort_order: data.order ?? 0,
      status: 'active',
    })
  );
  return unwrapTopic(response.data);
};

export const updateGrowthTopic = async (
  id: string,
  data: UpdateGrowthTopicData
): Promise<GrowthTopic> => {
  const response = await withTopicsFallback((base) =>
    axios.put(`${base}/${id}`, {
      name: data.name,
      slug: data.slug,
      sort_order: data.order,
      status: 'active',
    })
  );
  return unwrapTopic(response.data);
};

export const deleteGrowthTopic = async (id: string): Promise<void> => {
  await withTopicsFallback((base) => axios.delete(`${base}/${id}`));
};

export const sortGrowthTopics = async (
  payload: SortGrowthTopicsPayload
): Promise<void> => {
  await withTopicsFallback((base) =>
    axios.patch(`${base}/sort`, {
      items: payload.topics.map((item) => ({
        id: Number(item.id),
        sort_order: item.order,
      })),
    })
  );
};
