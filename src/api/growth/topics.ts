import axios from 'axios';

const API_BASE_URL = '/api/growth/topics';

export interface GrowthTopic {
  id: string;
  slug: string;
  name: string;
  order: number;
  articleCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGrowthTopicData {
  slug: string;
  name: string;
  order?: number;
}

export interface UpdateGrowthTopicData {
  slug: string;
  name: string;
  order?: number;
}

export interface SortGrowthTopicItem {
  id: string;
  order: number;
}

export interface SortGrowthTopicsPayload {
  topics: SortGrowthTopicItem[];
}

export const getGrowthTopics = async (): Promise<GrowthTopic[]> => {
  const response = await axios.get<GrowthTopic[] | { list: GrowthTopic[] }>(
    API_BASE_URL
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.list ?? [];
};

export const createGrowthTopic = async (
  data: CreateGrowthTopicData
): Promise<GrowthTopic> => {
  const response = await axios.post<GrowthTopic>(API_BASE_URL, data);
  return response.data;
};

export const updateGrowthTopic = async (
  id: string,
  data: UpdateGrowthTopicData
): Promise<GrowthTopic> => {
  const response = await axios.put<GrowthTopic>(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteGrowthTopic = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};

export const sortGrowthTopics = async (
  payload: SortGrowthTopicsPayload
): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/sort`, payload);
};
