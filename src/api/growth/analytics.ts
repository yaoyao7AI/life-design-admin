import request from '../request';

const API_BASE_URL = '/api/growth/cms/analytics';

export interface AnalyticsArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  memberArticles: number;
}

export interface AnalyticsReadingStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
}

export interface AnalyticsInteractionStats {
  likes: number;
  favorites: number;
  shares: number;
}

export interface AnalyticsMembershipStats {
  freeUsers: number;
  founderMembers: number;
  newMembersThisMonth: number;
}

export interface AnalyticsTopArticle {
  id: string;
  title: string;
  cover?: string;
  views: number;
  likes: number;
  shares: number;
  publishedAt?: string;
}

export interface AnalyticsTrendPoint {
  date: string;
  views: number;
  newMembers: number;
  publishedArticles: number;
}

export interface AnalyticsSummary {
  article: AnalyticsArticleStats;
  reading: AnalyticsReadingStats;
  interaction: AnalyticsInteractionStats;
  membership: AnalyticsMembershipStats;
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummary;
  topArticles: AnalyticsTopArticle[];
  trends: AnalyticsTrendPoint[];
}

export const getGrowthAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await request.get<AnalyticsSummary>(`${API_BASE_URL}/summary`);
  return response.data;
};

export const getGrowthAnalyticsTopArticles = async (): Promise<AnalyticsTopArticle[]> => {
  const response = await request.get<
    AnalyticsTopArticle[] | { list?: AnalyticsTopArticle[] }
  >(`${API_BASE_URL}/top-articles`);
  return Array.isArray(response.data) ? response.data : response.data.list ?? [];
};

export const getGrowthAnalyticsTrends = async (
  days = 7
): Promise<AnalyticsTrendPoint[]> => {
  const response = await request.get<
    AnalyticsTrendPoint[] | { list?: AnalyticsTrendPoint[] }
  >(`${API_BASE_URL}/trends`, {
    params: { days },
  });
  return Array.isArray(response.data) ? response.data : response.data.list ?? [];
};

export const getGrowthAnalyticsDashboard = async (): Promise<AnalyticsDashboardData> => {
  const [summary, topArticles, trends] = await Promise.all([
    getGrowthAnalyticsSummary(),
    getGrowthAnalyticsTopArticles(),
    getGrowthAnalyticsTrends(7),
  ]);
  return { summary, topArticles, trends };
};
