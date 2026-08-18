export type LibraryStatus = 'active' | 'inactive';

export const STATUS_LABELS: Record<LibraryStatus, string> = {
  active: '启用',
  inactive: '停用',
};

export const PUBLISH_LABELS: Record<LibraryStatus, string> = {
  active: '已上架',
  inactive: '已下架',
};

export const STATUS_TONE: Record<LibraryStatus, 'success' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
};

export const STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' },
];

export const PUBLISH_OPTIONS = [
  { value: 'active', label: '已上架' },
  { value: 'inactive', label: '已下架' },
];

export const DIFFICULTY_OPTIONS = [
  { value: '简单', label: '简单' },
  { value: '中等', label: '中等' },
  { value: '困难', label: '困难' },
];

export interface LibraryCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  sort: number;
  status: LibraryStatus;
  templateCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LibraryTag {
  id: string;
  name: string;
  sort: number;
  status: LibraryStatus;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LibraryTemplate {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  subtitle: string;
  cover: string;
  description: string;
  content: string;
  steps: string[];
  duration: number | null;
  durationLabel: string;
  difficulty: string;
  tags: string[];
  status: LibraryStatus;
  isRecommend: boolean;
  sort: number;
  viewCount: number;
  favoriteCount: number;
  addToTodoCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LibraryStatsSummary {
  templateCount: number;
  viewCount: number;
  addToTodoCount: number;
  favoriteCount: number;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CategoryInput {
  name: string;
  description?: string;
  sort?: number;
  status?: LibraryStatus;
}

export interface TagInput {
  name: string;
  sort?: number;
  status?: LibraryStatus;
}

export interface TemplateInput {
  categoryId: string;
  title: string;
  subtitle?: string;
  cover?: string;
  description?: string;
  content?: string;
  steps: string[];
  duration?: number | null;
  difficulty?: string;
  tags: string[];
  status: LibraryStatus;
  isRecommend: boolean;
  sort?: number;
}

export interface ListQuery {
  keyword?: string;
  status?: LibraryStatus | '';
  categoryId?: string;
  isRecommend?: boolean | '';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
