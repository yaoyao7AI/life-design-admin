import axios from 'axios';

const API_BASE_URL = '/api/upload';

export interface UploadAsset {
  id: string;
  url: string;
  width: number;
  height: number;
}

const buildFormData = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return formData;
};

export const uploadImage = async (file: File): Promise<UploadAsset> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<UploadAsset>(`${API_BASE_URL}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImages = async (files: File[]): Promise<UploadAsset[]> => {
  const response = await axios.post<UploadAsset[] | { list: UploadAsset[] }>(
    `${API_BASE_URL}/images`,
    buildFormData(files),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  if (Array.isArray(response.data)) return response.data;
  return response.data.list ?? [];
};

export const getUpload = async (id: string): Promise<UploadAsset> => {
  const response = await axios.get<UploadAsset>(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const deleteUpload = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
