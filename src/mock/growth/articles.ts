/* ============================================================
   文章 Mock API
   ------------------------------------------------------------
   仅用于前端开发。函数签名与返回结构按真实后端设计，
   未来只需把内部实现替换为 axios 调用即可无缝接入。

   替换示例：
     export async function fetchArticles(params) {
       const { data } = await axios.get('/api/growth/articles', { params });
       return data;
     }
   ============================================================ */

import type {
  AccessLevel,
  Article,
  ArticleStatus,
  TopicSlug,
} from '../../types/growth';

/** 模拟网络延迟 */
const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms));

let ARTICLES: Article[] = [
  {
    id: 'a-1001',
    slug: 'the-psychology-of-wealth',
    title: '财富的底层心理学',
    titleEn: 'The Psychology of Wealth',
    subtitle: '为什么有些人总能持续积累财富',
    summary: '从认知与习惯出发，重新理解金钱与自我价值的关系。',
    cover: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&q=60',
    topic: 'wealth',
    access: 'vip',
    status: 'published',
    author: '林清',
    tags: ['财商', '认知'],
    readingTime: 8,
    views: 12840,
    likes: 862,
    publishedAt: '2026-06-18',
    updatedAt: '2026-06-18',
  },
  {
    id: 'a-1002',
    slug: 'ai-as-your-cofounder',
    title: '把 AI 当作你的联合创始人',
    titleEn: 'AI as Your Co-founder',
    summary: '一套让个人生产力提升 10 倍的 AI 协作方法论。',
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&q=60',
    topic: 'ai',
    access: 'free',
    status: 'published',
    author: 'Kevin',
    tags: ['AI', '效率'],
    readingTime: 6,
    views: 20310,
    likes: 1450,
    publishedAt: '2026-06-22',
    updatedAt: '2026-06-23',
  },
  {
    id: 'a-1003',
    slug: 'design-your-life-framework',
    title: '人生设计：从迷茫到清晰的框架',
    titleEn: 'The Design Your Life Framework',
    summary: '用产品经理的思维，重新设计你的人生路线图。',
    cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=60',
    topic: 'life-design',
    access: 'vip',
    status: 'published',
    author: '苏晴',
    tags: ['人生设计', '目标'],
    readingTime: 10,
    views: 9820,
    likes: 640,
    publishedAt: '2026-06-10',
    updatedAt: '2026-06-12',
  },
  {
    id: 'a-1004',
    slug: 'micro-habits-that-compound',
    title: '会复利的微习惯',
    titleEn: 'Micro Habits That Compound',
    summary: '每天 1% 的改变，一年后带来 37 倍的成长。',
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&q=60',
    topic: 'growth',
    access: 'free',
    status: 'published',
    author: '林清',
    tags: ['习惯', '自律'],
    readingTime: 5,
    views: 15600,
    likes: 990,
    publishedAt: '2026-05-28',
    updatedAt: '2026-05-28',
  },
  {
    id: 'a-1005',
    slug: 'money-scripts',
    title: '重写你的金钱剧本',
    titleEn: 'Rewrite Your Money Scripts',
    summary: '识别并改写限制你财富的潜意识信念。',
    cover: '',
    topic: 'wealth',
    access: 'free',
    status: 'draft',
    author: 'Kevin',
    tags: ['财富', '信念'],
    readingTime: 7,
    views: 0,
    likes: 0,
    publishedAt: null,
    updatedAt: '2026-06-28',
  },
  {
    id: 'a-1006',
    slug: 'prompt-engineering-basics',
    title: '提示词工程入门',
    titleEn: 'Prompt Engineering Basics',
    summary: '写出好提示词的 6 个核心原则。',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&q=60',
    topic: 'ai',
    access: 'vip',
    status: 'draft',
    author: '苏晴',
    tags: ['AI', '提示词'],
    readingTime: 9,
    views: 0,
    likes: 0,
    publishedAt: null,
    updatedAt: '2026-06-30',
  },
  {
    id: 'a-1007',
    slug: 'deep-work-guide',
    title: '深度工作实操指南',
    titleEn: 'A Practical Guide to Deep Work',
    summary: '在注意力稀缺的时代，重建专注的能力。',
    cover: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=200&q=60',
    topic: 'growth',
    access: 'vip',
    status: 'published',
    author: '林清',
    tags: ['专注', '效率'],
    readingTime: 12,
    views: 7420,
    likes: 512,
    publishedAt: '2026-06-05',
    updatedAt: '2026-06-06',
  },
  {
    id: 'a-1008',
    slug: 'financial-freedom-math',
    title: '财务自由的数学',
    titleEn: 'The Math of Financial Freedom',
    summary: '用一个公式算出你的自由数字。',
    cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&q=60',
    topic: 'wealth',
    access: 'vip',
    status: 'published',
    author: 'Kevin',
    tags: ['财务', '自由'],
    readingTime: 8,
    views: 18240,
    likes: 1203,
    publishedAt: '2026-06-15',
    updatedAt: '2026-06-15',
  },
  {
    id: 'a-1009',
    slug: 'ai-tools-2026',
    title: '2026 值得长期使用的 AI 工具',
    titleEn: 'AI Tools Worth Keeping in 2026',
    summary: '一份经过实测的高价值 AI 工具清单。',
    cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&q=60',
    topic: 'ai',
    access: 'free',
    status: 'published',
    author: '苏晴',
    tags: ['AI', '工具'],
    readingTime: 6,
    views: 26700,
    likes: 1980,
    publishedAt: '2026-06-25',
    updatedAt: '2026-06-26',
  },
  {
    id: 'a-1010',
    slug: 'identity-based-goals',
    title: '基于身份的目标设定',
    titleEn: 'Identity-Based Goals',
    summary: '与其追逐结果，不如成为那样的人。',
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=60',
    topic: 'growth',
    access: 'free',
    status: 'published',
    author: '林清',
    tags: ['目标', '身份'],
    readingTime: 7,
    views: 11230,
    likes: 745,
    publishedAt: '2026-05-20',
    updatedAt: '2026-05-21',
  },
  {
    id: 'a-1011',
    slug: 'life-portfolio',
    title: '像管理投资组合一样管理人生',
    titleEn: 'Manage Life Like a Portfolio',
    summary: '用资产配置的思路平衡事业、健康与关系。',
    cover: '',
    topic: 'life-design',
    access: 'vip',
    status: 'draft',
    author: 'Kevin',
    tags: ['人生设计', '平衡'],
    readingTime: 9,
    views: 0,
    likes: 0,
    publishedAt: null,
    updatedAt: '2026-07-01',
  },
  {
    id: 'a-1012',
    slug: 'weekly-review-system',
    title: '每周复盘系统',
    titleEn: 'A Weekly Review System',
    summary: '30 分钟让你的一周不再失控。',
    cover: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=200&q=60',
    topic: 'growth',
    access: 'free',
    status: 'published',
    author: '苏晴',
    tags: ['复盘', '系统'],
    readingTime: 5,
    views: 8930,
    likes: 601,
    publishedAt: '2026-06-02',
    updatedAt: '2026-06-02',
  },
];

/* ---------- 查询参数与返回结构 ---------- */

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

/** 获取文章列表（支持筛选 + 分页） */
export async function fetchArticles(
  params: ArticleQuery = {}
): Promise<Paginated<Article>> {
  await delay();
  const {
    keyword = '',
    topic = '',
    status = '',
    access = '',
    page = 1,
    pageSize = 8,
  } = params;

  const kw = keyword.trim().toLowerCase();
  let filtered = ARTICLES.filter((a) => {
    if (kw) {
      const hit =
        a.title.toLowerCase().includes(kw) ||
        (a.titleEn ?? '').toLowerCase().includes(kw);
      if (!hit) return false;
    }
    if (topic && a.topic !== topic) return false;
    if (status && a.status !== status) return false;
    if (access && a.access !== access) return false;
    return true;
  });

  // 已发布优先、按更新时间倒序
  filtered = filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total, page, pageSize };
}

/** 获取单篇文章（编辑页使用） */
export async function fetchArticleById(
  id: string
): Promise<Article | undefined> {
  await delay(200);
  return ARTICLES.find((a) => a.id === id);
}

/** 删除文章（Mock） */
export async function deleteArticle(id: string): Promise<{ success: boolean }> {
  await delay(200);
  ARTICLES = ARTICLES.filter((a) => a.id !== id);
  return { success: true };
}
