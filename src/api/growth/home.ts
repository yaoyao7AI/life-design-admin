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

export const getHomeBanners = async (): Promise<HomeBanner[]> => {
  const response = await axios.get<HomeBanner[]>(`${API_BASE_URL}/banners`);
  return response.data;
};

export const createHomeBanner = async (data: BannerInput): Promise<HomeBanner> => {
  const response = await axios.post<HomeBanner>(`${API_BASE_URL}/banners`, data);
  return response.data;
};

export const updateHomeBanner = async (
  id: string,
  data: BannerInput
): Promise<HomeBanner> => {
  const response = await axios.put<HomeBanner>(`${API_BASE_URL}/banners/${id}`, data);
  return response.data;
};

export const deleteHomeBanner = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/banners/${id}`);
};

export const sortHomeBanners = async (
  items: Array<{ id: string; order: number }>
): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/banners/sort`, { items });
};

export const getMostPopularConfig = async (): Promise<MostPopularConfig> => {
  const response = await axios.get<MostPopularConfig>(`${API_BASE_URL}/most-popular`);
  return response.data;
};

export const updateMostPopularConfig = async (
  data: MostPopularConfig
): Promise<MostPopularConfig> => {
  const response = await axios.put<MostPopularConfig>(
    `${API_BASE_URL}/most-popular`,
    data
  );
  return response.data;
};

export const getLatestConfig = async (): Promise<LatestConfig> => {
  const response = await axios.get<LatestConfig>(`${API_BASE_URL}/latest`);
  return response.data;
};

export const updateLatestConfig = async (data: LatestConfig): Promise<LatestConfig> => {
  const response = await axios.put<LatestConfig>(`${API_BASE_URL}/latest`, data);
  return response.data;
};

export const getHomeCourses = async (): Promise<HomeCourse[]> => {
  const response = await axios.get<HomeCourse[]>(`${API_BASE_URL}/courses`);
  return response.data;
};

export const createHomeCourse = async (data: CourseInput): Promise<HomeCourse> => {
  const response = await axios.post<HomeCourse>(`${API_BASE_URL}/courses`, data);
  return response.data;
};

export const updateHomeCourse = async (
  id: string,
  data: CourseInput
): Promise<HomeCourse> => {
  const response = await axios.put<HomeCourse>(`${API_BASE_URL}/courses/${id}`, data);
  return response.data;
};

export const deleteHomeCourse = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/courses/${id}`);
};

export const sortHomeCourses = async (
  items: Array<{ id: string; order: number }>
): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/courses/sort`, { items });
};

export const getMembershipCtaConfig = async (): Promise<MembershipCtaConfig> => {
  const response = await axios.get<MembershipCtaConfig>(`${API_BASE_URL}/membership-cta`);
  return response.data;
};

export const updateMembershipCtaConfig = async (
  data: MembershipCtaConfig
): Promise<MembershipCtaConfig> => {
  const response = await axios.put<MembershipCtaConfig>(
    `${API_BASE_URL}/membership-cta`,
    data
  );
  return response.data;
};
