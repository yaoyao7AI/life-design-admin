/* ============================================================
   成长模块（Growth CMS）数据类型
   ============================================================ */

/** 内容权限：免费 / 创始会员 */
export type AccessLevel = 'free' | 'vip';

/** 发布状态：草稿 / 已发布 */
export type ArticleStatus = 'draft' | 'published';

/** 主题分类标识（动态主题以 slug 为准） */
export type TopicSlug = string;

/* ---------- 正文 Block 结构 ---------- */

/** 内容块类型 */
export type BlockType = 'h1' | 'h2' | 'p' | 'quote' | 'list' | 'image' | 'divider';

/**
 * 正文内容块。
 * - list：text 以换行分隔每一项
 * - image：text 存放图片 URL
 * - divider：忽略 text
 */
export interface Block {
  id: string;
  type: BlockType;
  text: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  h1: '大标题 H1',
  h2: '小标题 H2',
  p: '段落',
  quote: '引用',
  list: '列表',
  image: '图片',
  divider: '分割线',
};

export interface Topic {
  id: string;
  slug: TopicSlug;
  name: string;
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
  topicName?: string;
  access: AccessLevel;
  status: ArticleStatus;
  author: string;
  tags: string[];
  readingTime: number; // 分钟
  views: number;
  likes: number;
  publishedAt: string | null; // 草稿为 null
  updatedAt: string;
  content?: Block[]; // 正文内容块
}

/* ---------- 标签映射（UI 展示，兼容旧数据） ---------- */

export const TOPIC_LABELS: Record<string, string> = {
  wealth: '财富',
  ai: 'AI',
  growth: '成长',
  'life-design': '人生设计',
};

export const resolveTopicLabel = (slug: string, name?: string) =>
  name?.trim() || TOPIC_LABELS[slug] || slug || '未分类';

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

/** 仅作无主题数据时的兜底；正常应使用 getGrowthTopics 动态选项 */
export const TOPIC_OPTIONS = Object.keys(TOPIC_LABELS).map((slug) => ({
  value: slug,
  label: TOPIC_LABELS[slug],
}));

export const ACCESS_OPTIONS = (Object.keys(ACCESS_LABELS) as AccessLevel[]).map(
  (value) => ({ value, label: ACCESS_LABELS[value] })
);

export const STATUS_OPTIONS = (
  Object.keys(STATUS_LABELS) as ArticleStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));
