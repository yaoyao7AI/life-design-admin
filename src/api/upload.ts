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

const postMultipart = async <T>(
  path: string,
  formData: FormData
): Promise<T> => {
  const response = await axios.post<T>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImage = async (file: File): Promise<UploadAsset> => {
  const formData = new FormData();
  formData.append('file', file);
  const data = await postMultipart<UploadAsset | { data?: UploadAsset }>(
    `${API_BASE_URL}/image`,
    formData
  );
  return 'data' in data && data.data ? data.data : (data as UploadAsset);
};

export const uploadImages = async (files: File[]): Promise<UploadAsset[]> => {
  const data = await postMultipart<
    | UploadAsset[]
    | {
        list?: UploadAsset[];
        items?: UploadAsset[];
        data?: UploadAsset[] | { items?: UploadAsset[]; list?: UploadAsset[] };
      }
  >(`${API_BASE_URL}/images`, buildFormData(files));
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.list)) return data.list;
  if (Array.isArray(data.items)) return data.items;
  const nested = data.data;
  if (Array.isArray(nested)) return nested;
  if (nested && typeof nested === 'object') {
    return nested.list ?? nested.items ?? [];
  }
  return [];
};

export const getUpload = async (id: string): Promise<UploadAsset> => {
  const response = await axios.get<UploadAsset>(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const deleteUpload = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
