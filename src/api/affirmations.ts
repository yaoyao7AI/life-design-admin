import axios from 'axios';

const API_BASE_URL = '/api/affirmations';

export interface Affirmation {
  id: number;
  title: string;  // 后端可能返回空字符串，前端会显示为"无标题"
  text: string;
  audio_url: string;  // 后端可能返回空字符串
  code?: string;  // 编号，如 001, 002
  short_url?: string;  // 短链接，如 http://localhost:5173/play?a=001
}

export interface CreateAffirmationData {
  title?: string;  // 可选，如果不提供，后端会使用 text 前50字符
  text: string;
  audio_url?: string;
}

// 获取所有肯定语
export const getAffirmations = async (): Promise<Affirmation[]> => {
  const response = await axios.get<Affirmation[]>(API_BASE_URL);
  return response.data;
};

// 根据 ID 获取单个肯定语
export const getAffirmationById = async (id: number): Promise<Affirmation> => {
  const response = await axios.get<Affirmation>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// 根据 code 获取单个肯定语（用于播放页面）
export const getAffirmationByCode = async (code: string): Promise<Affirmation> => {
  const response = await axios.get<Affirmation>(`${API_BASE_URL}/${code}`);
  return response.data;
};

// 创建肯定语
export const createAffirmation = async (data: CreateAffirmationData): Promise<Affirmation> => {
  const response = await axios.post<Affirmation>(API_BASE_URL, data);
  return response.data;
};

// 更新肯定语
export const updateAffirmation = async (
  id: number,
  data: Partial<CreateAffirmationData>
): Promise<Affirmation> => {
  const response = await axios.put<Affirmation>(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

// 删除肯定语
export const deleteAffirmation = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};

// 上传音频文件
export const uploadAudio = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<{ url: string }>(
    `${API_BASE_URL}/upload-audio`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

