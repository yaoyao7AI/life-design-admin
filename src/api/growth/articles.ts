import axios from 'axios';
import type { AccessLevel, Article, ArticleStatus, Block, TopicSlug } from '../../types/growth';
import { getGrowthTopics } from './topics';

const API_BASE_URL = '/api/growth/cms/articles';
const FALLBACK_API_BASE_URL = '/api/growth/articles';

export interface ArticleQuery {
  keyword?: string;
  topic?: TopicSlug | '';
  status?: ArticleStatus | '';
  access?: AccessLevel | '';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArticleInput {
  title: string;
  titleEn?: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  cover?: string;
  topic: TopicSlug;
  access: AccessLevel;
  status: ArticleStatus;
  author: string;
  tags: string[];
  readingTime: number;
  publishedAt: string | null;
  content: Block[];
}

export interface PublishArticleData {
  publishedAt?: string | null;
}

type BackendArticle = Record<string, any>;

const isNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as any).response?.status === 404;

const withArticlesFallback = async <T>(
  request: (base: string) => Promise<T>
): Promise<T> => {
  try {
    return await request(API_BASE_URL);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    return request(FALLBACK_API_BASE_URL);
  }
};

const VALID_TOPICS: TopicSlug[] = ['wealth', 'ai', 'growth', 'life-design'];

const normalizeTopic = (value: unknown): TopicSlug => {
  const v = String(value ?? '').trim();
  return VALID_TOPICS.includes(v as TopicSlug) ? (v as TopicSlug) : 'growth';
};

const normalizeStatus = (value: unknown, visibility?: unknown): ArticleStatus => {
  const status = String(value ?? '').toLowerCase();
  if (status === 'draft' || status === 'published') return status;
  const vis = String(visibility ?? '').toLowerCase();
  if (vis === 'private' || vis === 'draft') return 'draft';
  if (vis === 'public' || vis === 'published') return 'published';
  return 'draft';
};

const normalizeAccess = (value: unknown): AccessLevel => {
  const v = String(value ?? '').toLowerCase();
  if (v === 'vip' || v === 'founder' || v === 'founding') return 'vip';
  return 'free';
};

const toNum = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toBlocks = (value: unknown): Block[] | undefined => {
  if (Array.isArray(value)) return value as Block[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as Block[]) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

let topicSlugToIdCache: Map<string, number> | null = null;

const unwrapApiData = <T>(raw: unknown): T => {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

const loadTopicSlugToIdMap = async (): Promise<Map<string, number>> => {
  if (topicSlugToIdCache) return topicSlugToIdCache;
  const topics = await getGrowthTopics();
  topicSlugToIdCache = new Map(
    topics
      .map((topic) => [topic.slug, Number(topic.id)] as const)
      .filter(([, id]) => Number.isFinite(id) && id > 0)
  );
  return topicSlugToIdCache;
};

const resolveTopicId = async (slug: TopicSlug): Promise<number | null> => {
  const map = await loadTopicSlugToIdMap();
  const id = map.get(slug);
  return id && id > 0 ? id : null;
};

const fromBackendArticle = (raw: BackendArticle): Article => ({
  id: String(raw.id ?? raw.article_id ?? ''),
  slug: String(raw.slug ?? ''),
  title: String(raw.title ?? ''),
  titleEn: raw.titleEn ?? raw.title_en ?? undefined,
  subtitle: raw.subtitle ?? undefined,
  summary: raw.summary ?? undefined,
  cover: raw.cover ?? raw.cover_url ?? undefined,
  topic: normalizeTopic(raw.topic ?? raw.topic_slug ?? raw.topic_id),
  access: normalizeAccess(raw.access ?? raw.membership_tier),
  status: normalizeStatus(raw.status, raw.visibility),
  author: String(raw.author ?? raw.author_name ?? raw.author_id ?? '未署名'),
  tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
  readingTime: toNum(raw.readingTime ?? raw.reading_time_minutes, 1),
  views: toNum(raw.views),
  likes: toNum(raw.likes),
  publishedAt: raw.publishedAt ?? raw.published_at ?? null,
  updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  content: toBlocks(raw.content),
});

const toBackendPayload = async (data: ArticleInput) => {
  const membershipTier = data.access === 'vip' ? 'founder' : 'free';
  const visibility = data.access === 'vip' ? 'members_only' : 'public';
  const topicId = await resolveTopicId(data.topic);

  return {
    title: data.title,
    title_en: data.titleEn,
    slug: data.slug,
    subtitle: data.subtitle,
    summary: data.summary,
    cover_url: data.cover,
    topic_id: topicId,
    reading_time_minutes: data.readingTime,
    author_id: data.author,
    status: data.status,
    visibility,
    membership_tier: membershipTier,
    published_at: data.publishedAt,
    tags: data.tags,
    content: data.content,
  };
};

const normalizePaginated = (raw: any): Paginated<Article> => {
  const payload = unwrapApiData<any>(raw);
  const listSource =
    payload?.items ??
    payload?.list ??
    payload?.data?.items ??
    payload?.data?.list ??
    payload?.data ??
    raw?.list ??
    raw?.items ??
    raw?.data?.items ??
    raw?.data?.list ??
    raw?.data ??
    [];
  const pagination = payload?.pagination ?? raw?.pagination ?? payload?.data?.pagination;
  const list = Array.isArray(listSource) ? listSource.map(fromBackendArticle) : [];
  const total = toNum(
    pagination?.total ?? payload?.total ?? raw?.total ?? raw?.count ?? payload?.count,
    list.length
  );
  const page = toNum(pagination?.page ?? payload?.page ?? raw?.page, 1);
  const pageSize = toNum(
    pagination?.page_size ?? pagination?.pageSize ?? payload?.page_size ?? raw?.page_size,
    8
  );
  return { list, total, page, pageSize };
};

export const getGrowthArticles = async (
  params: ArticleQuery = {}
): Promise<Paginated<Article>> => {
  const topicId = params.topic ? await resolveTopicId(params.topic) : null;
  const query = {
    keyword: params.keyword,
    topic_id: topicId ?? undefined,
    status: params.status || undefined,
    membership_tier:
      params.access === 'vip' ? 'founder' : params.access === 'free' ? 'free' : undefined,
    page: params.page,
    pageSize: params.pageSize,
    page_size: params.pageSize,
  };
  const response = await withArticlesFallback((base) => axios.get(base, { params: query }));
  return normalizePaginated(response.data);
};

export const getGrowthArticleById = async (id: string): Promise<Article> => {
  const response = await withArticlesFallback((base) => axios.get(`${base}/${id}`));
  return fromBackendArticle(unwrapApiData(response.data));
};

export const createGrowthArticle = async (data: ArticleInput): Promise<Article> => {
  const payload = await toBackendPayload(data);
  const response = await withArticlesFallback((base) => axios.post(base, payload));
  return fromBackendArticle(unwrapApiData(response.data));
};

export const updateGrowthArticle = async (
  id: string,
  data: ArticleInput
): Promise<Article> => {
  const payload = await toBackendPayload(data);
  const response = await withArticlesFallback((base) =>
    axios.put(`${base}/${id}`, payload)
  );
  return fromBackendArticle(unwrapApiData(response.data));
};

export const deleteGrowthArticle = async (id: string): Promise<void> => {
  await withArticlesFallback((base) => axios.delete(`${base}/${id}`));
};

export const publishGrowthArticle = async (
  id: string,
  data: PublishArticleData = {}
): Promise<Article> => {
  const payload = {
    published_at: data.publishedAt ?? null,
    publishedAt: data.publishedAt ?? null,
    status: 'published',
    visibility: 'public',
  };
  const response = await withArticlesFallback((base) =>
    axios.patch(`${base}/${id}/publish`, payload)
  );
  return fromBackendArticle(unwrapApiData(response.data));
};
