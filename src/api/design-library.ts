import request from './request';
import type {
  CategoryInput,
  LibraryCategory,
  LibraryStatsSummary,
  LibraryStatus,
  LibraryTag,
  LibraryTemplate,
  ListQuery,
  Paginated,
  TagInput,
  TemplateInput,
} from '../types/design-library';

const CMS_BASE = '/api/design-library/cms';

type BackendRecord = Record<string, unknown>;

const toStr = (value: unknown, fallback = '') =>
  value == null ? fallback : String(value);

const toNum = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toStatus = (value: unknown): LibraryStatus =>
  String(value).toLowerCase() === 'inactive' ? 'inactive' : 'active';

const unwrap = <T>(raw: unknown): T => {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

const unwrapItems = (raw: unknown): BackendRecord[] => {
  const data = unwrap<unknown>(raw);
  if (Array.isArray(data)) return data as BackendRecord[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as BackendRecord[];
    if (Array.isArray(obj.list)) return obj.list as BackendRecord[];
  }
  return [];
};

const unwrapPagination = (raw: unknown, fallbackPage = 1, fallbackSize = 20) => {
  const data = unwrap<Record<string, unknown>>(raw);
  const pagination = (data?.pagination || {}) as Record<string, unknown>;
  return {
    total: toNum(pagination.total ?? data?.total, unwrapItems(raw).length),
    page: toNum(pagination.page, fallbackPage),
    pageSize: toNum(pagination.page_size ?? pagination.pageSize, fallbackSize),
  };
};

export const parseApiError = (error: unknown, fallback = '请求失败，请稍后重试。') => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  return error instanceof Error ? error.message : fallback;
};

const fromCategory = (raw: BackendRecord): LibraryCategory => ({
  id: toStr(raw.id),
  name: toStr(raw.name),
  icon: raw.icon == null ? null : toStr(raw.icon),
  description: raw.description == null ? null : toStr(raw.description),
  sort: toNum(raw.sort),
  status: toStatus(raw.status),
  templateCount: toNum(raw.template_count ?? raw.templateCount),
  createdAt: raw.created_at == null && raw.createdAt == null ? null : toStr(raw.created_at ?? raw.createdAt),
  updatedAt: raw.updated_at == null && raw.updatedAt == null ? null : toStr(raw.updated_at ?? raw.updatedAt),
});

const fromTag = (raw: BackendRecord): LibraryTag => ({
  id: toStr(raw.id),
  name: toStr(raw.name),
  sort: toNum(raw.sort),
  status: toStatus(raw.status),
  createdAt: raw.created_at == null && raw.createdAt == null ? null : toStr(raw.created_at ?? raw.createdAt),
  updatedAt: raw.updated_at == null && raw.updatedAt == null ? null : toStr(raw.updated_at ?? raw.updatedAt),
});

const parseImages = (raw: BackendRecord): string[] => {
  const source = raw.content_images ?? raw.images ?? raw.content_images_json;
  let values: unknown[] = [];
  if (Array.isArray(source)) {
    values = source;
  } else if (typeof source === 'string' && source.trim()) {
    try {
      const parsed = JSON.parse(source);
      values = Array.isArray(parsed) ? parsed : [];
    } catch {
      values = [];
    }
  }

  const items = values
    .map((item, index) => {
      if (typeof item === 'string') {
        const url = item.trim();
        return url ? { url, sort: index + 1 } : null;
      }
      if (item && typeof item === 'object' && 'url' in item) {
        const url = String((item as { url?: unknown }).url ?? '').trim();
        if (!url) return null;
        const sortRaw = Number((item as { sort?: unknown }).sort);
        return {
          url,
          sort: Number.isFinite(sortRaw) ? sortRaw : index + 1,
        };
      }
      return null;
    })
    .filter((item): item is { url: string; sort: number } => Boolean(item));

  return items
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.url);
};

const toContentImages = (urls: string[]) =>
  urls
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 15)
    .map((url, index) => ({ url, sort: index + 1 }));

const fromTemplate = (raw: BackendRecord): LibraryTemplate => {
  const category = (raw.category || {}) as BackendRecord;
  return {
    id: toStr(raw.id),
    categoryId: toStr(raw.category_id ?? raw.categoryId ?? category.id),
    categoryName: toStr(category.name ?? raw.category_name ?? raw.categoryName),
    title: toStr(raw.title),
    subtitle: toStr(raw.subtitle),
    cover: toStr(raw.cover ?? raw.cover_url),
    images: parseImages(raw),
    description: toStr(raw.description),
    content: toStr(raw.content),
    steps: Array.isArray(raw.steps) ? raw.steps.map(String) : [],
    duration: raw.duration == null || raw.duration === '' ? null : toNum(raw.duration),
    durationLabel: toStr(raw.duration_label ?? raw.durationLabel),
    difficulty: toStr(raw.difficulty),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    status: toStatus(raw.status),
    isRecommend: Boolean(raw.is_recommend ?? raw.isRecommend),
    sort: toNum(raw.sort),
    viewCount: toNum(raw.view_count ?? raw.viewCount),
    favoriteCount: toNum(raw.favorite_count ?? raw.favoriteCount),
    addToTodoCount: toNum(raw.add_to_todo_count ?? raw.addToTodoCount),
    createdAt: raw.created_at == null && raw.createdAt == null ? null : toStr(raw.created_at ?? raw.createdAt),
    updatedAt: raw.updated_at == null && raw.updatedAt == null ? null : toStr(raw.updated_at ?? raw.updatedAt),
  };
};

const listParams = (query: ListQuery = {}) => ({
  keyword: query.keyword || undefined,
  status: query.status || undefined,
  categoryId: query.categoryId || undefined,
  isRecommend:
    query.isRecommend === '' || query.isRecommend === undefined
      ? undefined
      : query.isRecommend
        ? 1
        : 0,
  page: query.page,
  pageSize: query.pageSize,
  sortBy: query.sortBy,
  order: query.order,
});

export const getLibraryCategories = async (
  query: ListQuery = {}
): Promise<Paginated<LibraryCategory>> => {
  const response = await request.get(`${CMS_BASE}/categories`, { params: listParams(query) });
  const pagination = unwrapPagination(response.data, query.page, query.pageSize);
  return {
    list: unwrapItems(response.data).map(fromCategory),
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
};

export const createLibraryCategory = async (data: CategoryInput): Promise<LibraryCategory> => {
  const response = await request.post(`${CMS_BASE}/categories`, {
    name: data.name,
    description: data.description ?? null,
    sort: data.sort,
    status: data.status ?? 'active',
  });
  return fromCategory(unwrap<BackendRecord>(response.data));
};

export const updateLibraryCategory = async (
  id: string,
  data: CategoryInput
): Promise<LibraryCategory> => {
  const response = await request.put(`${CMS_BASE}/categories/${id}`, {
    name: data.name,
    description: data.description ?? null,
    sort: data.sort,
    status: data.status,
  });
  return fromCategory(unwrap<BackendRecord>(response.data));
};

export const updateLibraryCategoryStatus = async (
  id: string,
  status: LibraryStatus
): Promise<LibraryCategory> => {
  const response = await request.patch(`${CMS_BASE}/categories/${id}/status`, { status });
  return fromCategory(unwrap<BackendRecord>(response.data));
};

export const deleteLibraryCategory = async (id: string): Promise<void> => {
  await request.delete(`${CMS_BASE}/categories/${id}`);
};

export const sortLibraryCategories = async (
  items: Array<{ id: string; sort: number }>
): Promise<void> => {
  await request.patch(`${CMS_BASE}/categories/sort`, {
    items: items.map((item) => ({ id: Number(item.id), sort: item.sort })),
  });
};

export const getLibraryTags = async (query: ListQuery = {}): Promise<Paginated<LibraryTag>> => {
  const response = await request.get(`${CMS_BASE}/tags`, { params: listParams(query) });
  const pagination = unwrapPagination(response.data, query.page, query.pageSize);
  return {
    list: unwrapItems(response.data).map(fromTag),
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
};

export const getActiveLibraryTags = async (): Promise<LibraryTag[]> => {
  const response = await request.get(`${CMS_BASE}/tags/active`);
  const data = unwrap<unknown>(response.data);
  const items = Array.isArray(data) ? data : unwrapItems(response.data);
  return (items as BackendRecord[]).map(fromTag);
};

export const createLibraryTag = async (data: TagInput): Promise<LibraryTag> => {
  const response = await request.post(`${CMS_BASE}/tags`, {
    name: data.name,
    sort: data.sort,
    status: data.status ?? 'active',
  });
  return fromTag(unwrap<BackendRecord>(response.data));
};

export const updateLibraryTag = async (id: string, data: TagInput): Promise<LibraryTag> => {
  const response = await request.put(`${CMS_BASE}/tags/${id}`, {
    name: data.name,
    sort: data.sort,
    status: data.status,
  });
  return fromTag(unwrap<BackendRecord>(response.data));
};

export const deleteLibraryTag = async (id: string): Promise<void> => {
  await request.delete(`${CMS_BASE}/tags/${id}`);
};

export const sortLibraryTags = async (
  items: Array<{ id: string; sort: number }>
): Promise<void> => {
  await request.patch(`${CMS_BASE}/tags/sort`, {
    items: items.map((item) => ({ id: Number(item.id), sort: item.sort })),
  });
};

export const getLibraryTemplates = async (
  query: ListQuery = {}
): Promise<Paginated<LibraryTemplate>> => {
  const response = await request.get(`${CMS_BASE}/templates`, { params: listParams(query) });
  const pagination = unwrapPagination(response.data, query.page, query.pageSize);
  return {
    list: unwrapItems(response.data).map(fromTemplate),
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
};

export const getLibraryTemplate = async (id: string): Promise<LibraryTemplate> => {
  const response = await request.get(`${CMS_BASE}/templates/${id}`);
  return fromTemplate(unwrap<BackendRecord>(response.data));
};

export const createLibraryTemplate = async (data: TemplateInput): Promise<LibraryTemplate> => {
  const response = await request.post(`${CMS_BASE}/templates`, {
    category_id: Number(data.categoryId),
    title: data.title,
    subtitle: data.subtitle || null,
    cover_url: data.cover || null,
    content_images: toContentImages(data.images ?? []),
    description: data.description || null,
    content: data.content || null,
    steps: data.steps,
    duration: data.duration ?? null,
    difficulty: data.difficulty || null,
    tags: data.tags,
    status: data.status,
    is_recommend: data.isRecommend,
    sort: data.sort,
  });
  return fromTemplate(unwrap<BackendRecord>(response.data));
};

export const updateLibraryTemplate = async (
  id: string,
  data: TemplateInput
): Promise<LibraryTemplate> => {
  const response = await request.put(`${CMS_BASE}/templates/${id}`, {
    category_id: Number(data.categoryId),
    title: data.title,
    subtitle: data.subtitle || null,
    cover_url: data.cover || null,
    content_images: toContentImages(data.images ?? []),
    description: data.description || null,
    content: data.content || null,
    steps: data.steps,
    duration: data.duration ?? null,
    difficulty: data.difficulty || null,
    tags: data.tags,
    status: data.status,
    is_recommend: data.isRecommend,
    sort: data.sort,
  });
  return fromTemplate(unwrap<BackendRecord>(response.data));
};

export const updateLibraryTemplateStatus = async (
  id: string,
  status: LibraryStatus
): Promise<LibraryTemplate> => {
  const response = await request.patch(`${CMS_BASE}/templates/${id}/status`, { status });
  return fromTemplate(unwrap<BackendRecord>(response.data));
};

export const deleteLibraryTemplate = async (id: string): Promise<void> => {
  await request.delete(`${CMS_BASE}/templates/${id}`);
};

export const sortLibraryTemplates = async (
  items: Array<{ id: string; sort: number }>
): Promise<void> => {
  await request.patch(`${CMS_BASE}/templates/sort`, {
    items: items.map((item) => ({ id: Number(item.id), sort: item.sort })),
  });
};

export const getLibraryStats = async (
  query: ListQuery = {}
): Promise<Paginated<LibraryTemplate> & { summary: LibraryStatsSummary }> => {
  const response = await request.get(`${CMS_BASE}/stats`, {
    params: {
      ...listParams(query),
      sortBy: query.sortBy || 'view_count',
      order: query.order || 'desc',
    },
  });
  const data = unwrap<Record<string, unknown>>(response.data);
  const pagination = unwrapPagination(response.data, query.page, query.pageSize);
  const summary = (data?.summary || {}) as Record<string, unknown>;
  return {
    list: unwrapItems(response.data).map(fromTemplate),
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    summary: {
      templateCount: toNum(summary.template_count ?? summary.templateCount),
      viewCount: toNum(summary.view_count ?? summary.viewCount),
      addToTodoCount: toNum(summary.add_to_todo_count ?? summary.addToTodoCount),
      favoriteCount: toNum(summary.favorite_count ?? summary.favoriteCount),
    },
  };
};
