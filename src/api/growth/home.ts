import axios from 'axios';

const API_BASE_URL = '/api/growth/cms/home';

export type HomeLinkType = 'article' | 'external' | 'course';

export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetType: HomeLinkType;
  targetValue: string;
  order: number;
  enabled: boolean;
}

export interface HomeCourse {
  id: string;
  title: string;
  coverUrl: string;
  link: string;
  order: number;
}

export interface MostPopularConfig {
  enabled: boolean;
  limit: number;
  articleIds: string[];
}

export interface LatestConfig {
  limit: number;
  sortRule: 'publishedAt' | 'updatedAt' | 'views';
  autoLatest: boolean;
}

export interface MembershipCtaConfig {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface BannerInput {
  title: string;
  imageUrl: string;
  targetType: HomeLinkType;
  targetValue: string;
  order?: number;
  enabled?: boolean;
}

export interface CourseInput {
  title: string;
  coverUrl: string;
  link: string;
  order?: number;
}

const DEFAULT_POPULAR: MostPopularConfig = {
  enabled: true,
  limit: 5,
  articleIds: [],
};

const DEFAULT_LATEST: LatestConfig = {
  limit: 8,
  sortRule: 'publishedAt',
  autoLatest: true,
};

const DEFAULT_CTA: MembershipCtaConfig = {
  enabled: true,
  title: '加入创始会员',
  description: '解锁完整成长内容与专属课程。',
  buttonText: '立即加入',
  buttonLink: '/membership',
};

const unwrapData = <T>(raw: unknown): T => {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

const isNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as { response?: { status?: number } }).response?.status === 404;

const parseLinkType = (link: string): { targetType: HomeLinkType; targetValue: string } => {
  const value = (link || '').trim();
  if (!value) return { targetType: 'article', targetValue: '' };
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    return { targetType: 'external', targetValue: value };
  }
  if (value.startsWith('course:')) {
    return { targetType: 'course', targetValue: value.slice('course:'.length) };
  }
  if (value.startsWith('article:')) {
    return { targetType: 'article', targetValue: value.slice('article:'.length) };
  }
  return { targetType: 'article', targetValue: value };
};

const encodeLink = (targetType: HomeLinkType, targetValue: string) => {
  const value = targetValue.trim();
  if (targetType === 'course') return value ? `course:${value}` : '';
  if (targetType === 'article') return value;
  return value;
};

const fromBackendBanner = (raw: Record<string, any>): HomeBanner => {
  const link = String(raw.link_url ?? raw.linkUrl ?? raw.targetValue ?? '');
  const parsed = parseLinkType(link);
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    imageUrl: String(raw.image_url ?? raw.imageUrl ?? ''),
    targetType: (raw.targetType as HomeLinkType) || parsed.targetType,
    targetValue: String(raw.targetValue ?? parsed.targetValue),
    order: Number(raw.sort_order ?? raw.order ?? 0),
    enabled:
      raw.enabled != null
        ? Boolean(raw.enabled)
        : String(raw.status ?? 'active').toLowerCase() !== 'inactive',
  };
};

const fromBackendCourse = (raw: Record<string, any>): HomeCourse => ({
  id: String(raw.id ?? ''),
  title: String(raw.title ?? ''),
  coverUrl: String(raw.cover_url ?? raw.coverUrl ?? ''),
  link: String(raw.link_url ?? raw.link ?? ''),
  order: Number(raw.sort_order ?? raw.order ?? 0),
});

const fromBackendSectionPopular = (raw: Record<string, any> | null): MostPopularConfig => {
  if (!raw) return { ...DEFAULT_POPULAR };
  return {
    enabled: String(raw.status ?? 'active').toLowerCase() !== 'inactive',
    limit: Number(raw.article_limit ?? raw.limit ?? DEFAULT_POPULAR.limit),
    articleIds: Array.isArray(raw.articleIds ?? raw.article_ids)
      ? (raw.articleIds ?? raw.article_ids).map(String)
      : [],
  };
};

const fromBackendSectionLatest = (raw: Record<string, any> | null): LatestConfig => {
  if (!raw) return { ...DEFAULT_LATEST };
  const sortRule = String(raw.subtitle ?? raw.sortRule ?? raw.sort_rule ?? 'publishedAt');
  return {
    limit: Number(raw.article_limit ?? raw.limit ?? DEFAULT_LATEST.limit),
    sortRule: (['publishedAt', 'updatedAt', 'views'].includes(sortRule)
      ? sortRule
      : 'publishedAt') as LatestConfig['sortRule'],
    autoLatest: Boolean(raw.autoLatest ?? raw.auto_latest ?? true),
  };
};

const fromBackendCta = (raw: Record<string, any> | null): MembershipCtaConfig => {
  if (!raw) return { ...DEFAULT_CTA };
  return {
    enabled: String(raw.status ?? 'active').toLowerCase() !== 'inactive',
    title: String(raw.title ?? DEFAULT_CTA.title),
    description: String(raw.subtitle ?? raw.description ?? DEFAULT_CTA.description),
    buttonText: String(raw.button_text ?? raw.buttonText ?? DEFAULT_CTA.buttonText),
    buttonLink: String(raw.button_link ?? raw.buttonLink ?? DEFAULT_CTA.buttonLink),
  };
};

const unwrapItems = (raw: unknown): Record<string, any>[] => {
  const data = unwrapData<any>(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  return [];
};

export const getHomeBanners = async (): Promise<HomeBanner[]> => {
  const response = await axios.get(`${API_BASE_URL}/banners`);
  return unwrapItems(response.data).map(fromBackendBanner);
};

export const createHomeBanner = async (data: BannerInput): Promise<HomeBanner> => {
  const response = await axios.post(`${API_BASE_URL}/banners`, {
    title: data.title,
    image_url: data.imageUrl,
    link_url: encodeLink(data.targetType, data.targetValue),
    status: data.enabled === false ? 'inactive' : 'active',
    sort_order: data.order ?? 0,
  });
  const items = unwrapItems(response.data).map(fromBackendBanner);
  return items[items.length - 1] ?? fromBackendBanner(unwrapData(response.data) as any);
};

export const updateHomeBanner = async (
  id: string,
  data: BannerInput
): Promise<HomeBanner> => {
  const response = await axios.put(`${API_BASE_URL}/banners/${id}`, {
    title: data.title,
    image_url: data.imageUrl,
    link_url: encodeLink(data.targetType, data.targetValue),
    status: data.enabled === false ? 'inactive' : 'active',
    sort_order: data.order,
  });
  const items = unwrapItems(response.data).map(fromBackendBanner);
  return items.find((item) => item.id === id) ?? items[0] ?? fromBackendBanner({ id });
};

export const deleteHomeBanner = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/banners/${id}`);
};

export const sortHomeBanners = async (
  items: Array<{ id: string; order: number }>
): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/banners/sort`, {
    items: items.map((item) => ({ id: Number(item.id), sort_order: item.order })),
  });
};

export const getMostPopularConfig = async (): Promise<MostPopularConfig> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/most-popular`);
    return fromBackendSectionPopular(unwrapData(response.data));
  } catch (error) {
    if (isNotFound(error)) return { ...DEFAULT_POPULAR };
    throw error;
  }
};

export const updateMostPopularConfig = async (
  data: MostPopularConfig
): Promise<MostPopularConfig> => {
  const response = await axios.put(`${API_BASE_URL}/most-popular`, {
    title: 'Most Popular',
    article_limit: data.limit,
    article_ids: data.articleIds,
    status: data.enabled ? 'active' : 'inactive',
  });
  return fromBackendSectionPopular(unwrapData(response.data));
};

export const getLatestConfig = async (): Promise<LatestConfig> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest`);
    return fromBackendSectionLatest(unwrapData(response.data));
  } catch (error) {
    if (isNotFound(error)) return { ...DEFAULT_LATEST };
    throw error;
  }
};

export const updateLatestConfig = async (data: LatestConfig): Promise<LatestConfig> => {
  const response = await axios.put(`${API_BASE_URL}/latest`, {
    title: 'Latest',
    article_limit: data.limit,
    subtitle: data.sortRule,
    status: 'active',
  });
  return fromBackendSectionLatest(unwrapData(response.data));
};

export const getHomeCourses = async (): Promise<HomeCourse[]> => {
  const response = await axios.get(`${API_BASE_URL}/courses`);
  return unwrapItems(response.data).map(fromBackendCourse);
};

export const createHomeCourse = async (data: CourseInput): Promise<HomeCourse> => {
  const response = await axios.post(`${API_BASE_URL}/courses`, {
    title: data.title,
    cover_url: data.coverUrl,
    link_url: data.link,
    status: 'active',
    sort_order: data.order ?? 0,
  });
  const items = unwrapItems(response.data).map(fromBackendCourse);
  return items[items.length - 1] ?? fromBackendCourse(unwrapData(response.data) as any);
};

export const updateHomeCourse = async (
  id: string,
  data: CourseInput
): Promise<HomeCourse> => {
  const response = await axios.put(`${API_BASE_URL}/courses/${id}`, {
    title: data.title,
    cover_url: data.coverUrl,
    link_url: data.link,
    sort_order: data.order,
  });
  const items = unwrapItems(response.data).map(fromBackendCourse);
  return items.find((item) => item.id === id) ?? items[0] ?? fromBackendCourse({ id });
};

export const deleteHomeCourse = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/courses/${id}`);
};

export const sortHomeCourses = async (
  items: Array<{ id: string; order: number }>
): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/courses/sort`, {
    items: items.map((item) => ({ id: Number(item.id), sort_order: item.order })),
  });
};

export const getMembershipCtaConfig = async (): Promise<MembershipCtaConfig> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/membership-cta`);
    return fromBackendCta(unwrapData(response.data));
  } catch (error) {
    if (isNotFound(error)) return { ...DEFAULT_CTA };
    throw error;
  }
};

export const updateMembershipCtaConfig = async (
  data: MembershipCtaConfig
): Promise<MembershipCtaConfig> => {
  const response = await axios.put(`${API_BASE_URL}/membership-cta`, {
    title: data.title,
    subtitle: data.description,
    button_text: data.buttonText,
    button_link: data.buttonLink,
    status: data.enabled ? 'active' : 'inactive',
  });
  return fromBackendCta(unwrapData(response.data));
};
