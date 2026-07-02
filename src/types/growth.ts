/* ============================================================
   成长模块（Growth CMS）数据类型
   ============================================================ */

/** 内容权限：免费 / 创始会员 */
export type AccessLevel = 'free' | 'vip';

/** 发布状态：草稿 / 已发布 */
export type ArticleStatus = 'draft' | 'published';

/** 主题分类标识 */
export type TopicSlug = 'wealth' | 'ai' | 'growth' | 'life-design';

export interface Topic {
  id: string;
  slug: TopicSlug;
  name: string; // 财富 / AI / 成长 / 人生设计
  order: number;
  articleCount: number;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string; // 用户端预览用
  title: string; // 中文标题
  titleEn?: string; // 英文标题
  subtitle?: string;
  summary?: string;
  cover?: string; // 封面缩略图 URL
  topic: TopicSlug;
  access: AccessLevel;
  status: ArticleStatus;
  author: string;
  tags: string[];
  readingTime: number; // 分钟
  views: number;
  likes: number;
  publishedAt: string | null; // 草稿为 null
  updatedAt: string;
}

/* ---------- 标签映射（UI 展示） ---------- */

export const TOPIC_LABELS: Record<TopicSlug, string> = {
  wealth: '财富',
  ai: 'AI',
  growth: '成长',
  'life-design': '人生设计',
};

export const ACCESS_LABELS: Record<AccessLevel, string> = {
  free: '免费',
  vip: '创始会员',
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: '草稿',
  published: '已发布',
};

/** Badge 色调映射（对应 ui Badge 的 tone） */
export const ACCESS_TONE: Record<AccessLevel, 'neutral' | 'warning'> = {
  free: 'neutral',
  vip: 'warning',
};

export const STATUS_TONE: Record<ArticleStatus, 'neutral' | 'success'> = {
  draft: 'neutral',
  published: 'success',
};

/* ---------- 下拉选项 ---------- */

export const TOPIC_OPTIONS = (Object.keys(TOPIC_LABELS) as TopicSlug[]).map(
  (slug) => ({ value: slug, label: TOPIC_LABELS[slug] })
);

export const ACCESS_OPTIONS = (Object.keys(ACCESS_LABELS) as AccessLevel[]).map(
  (value) => ({ value, label: ACCESS_LABELS[value] })
);

export const STATUS_OPTIONS = (
  Object.keys(STATUS_LABELS) as ArticleStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));
