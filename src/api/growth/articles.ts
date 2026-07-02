import axios from 'axios';
import type { AccessLevel, Article, ArticleStatus, Block, TopicSlug } from '../../types/growth';

const API_BASE_URL = '/api/growth/articles';

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

export const getGrowthArticles = async (
  params: ArticleQuery = {}
): Promise<Paginated<Article>> => {
  const response = await axios.get<Paginated<Article>>(API_BASE_URL, { params });
  return response.data;
};

export const getGrowthArticleById = async (id: string): Promise<Article> => {
  const response = await axios.get<Article>(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const createGrowthArticle = async (data: ArticleInput): Promise<Article> => {
  const response = await axios.post<Article>(API_BASE_URL, data);
  return response.data;
};

export const updateGrowthArticle = async (
  id: string,
  data: ArticleInput
): Promise<Article> => {
  const response = await axios.put<Article>(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteGrowthArticle = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};

export const publishGrowthArticle = async (
  id: string,
  data: PublishArticleData = {}
): Promise<Article> => {
  const response = await axios.patch<Article>(`${API_BASE_URL}/${id}/publish`, data);
  return response.data;
};
