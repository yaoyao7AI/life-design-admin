import axios from 'axios';
import { getStoredToken } from '../auth/token';

const API_BASE_URL = '/api/upload';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function assertImageFileSize(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('图片体积过大，请压缩后单张上传（每张不超过 5MB）。');
  }
}

export interface UploadAsset {
  id: string;
  url: string;
  width: number;
  height: number;
}

const unwrapAsset = (raw: unknown): UploadAsset => {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const nested = obj.data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested) && 'url' in nested) {
      return nested as UploadAsset;
    }
    if (typeof obj.url === 'string') return obj as unknown as UploadAsset;
  }
  return (raw ?? {}) as UploadAsset;
};

const postMultipart = async <T>(
  path: string,
  formData: FormData
): Promise<T> => {
  const token = getStoredToken();
  try {
    const response = await axios.post<T>(path, formData, {
      timeout: 60000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 413) {
      throw new Error('图片体积过大，请压缩后单张上传（建议每张 5MB 以内）。');
    }
    const message =
      axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
    if (message) throw new Error(message);
    throw err;
  }
};

export const uploadImage = async (file: File): Promise<UploadAsset> => {
  assertImageFileSize(file);
  const formData = new FormData();
  formData.append('file', file);
  const data = await postMultipart<UploadAsset | { data?: UploadAsset }>(
    `${API_BASE_URL}/image`,
    formData
  );
  return unwrapAsset(data);
};

export const uploadImages = async (files: File[]): Promise<UploadAsset[]> => {
  const assets: UploadAsset[] = [];
  for (const file of files) {
    assets.push(await uploadImage(file));
  }
  return assets;
};

export const getUpload = async (id: string): Promise<UploadAsset> => {
  const response = await axios.get<UploadAsset>(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const deleteUpload = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
