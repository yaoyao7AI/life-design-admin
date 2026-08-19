import { useRef, useState, type DragEvent } from 'react';
import Icon from './Icon';
import { uploadImage } from '../../api/upload';

const MAX_IMAGES = 15;
const ACCEPT = 'image/png,image/jpeg,image/jpg';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

function isImageFile(file: File) {
  const type = file.type.toLowerCase();
  if (type === 'image/png' || type === 'image/jpeg') return true;
  return /\.(png|jpe?g)$/i.test(file.name);
}

function unwrapUploaded(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'url' in item) {
          return String((item as { url?: unknown }).url ?? '');
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof raw === 'object' && raw !== null && 'url' in raw) {
    const url = String((raw as { url?: unknown }).url ?? '');
    return url ? [url] : [];
  }
  return [];
}

export default function MultiImageUpload({
  value,
  onChange,
  max = MAX_IMAGES,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const remaining = Math.max(0, max - value.length);
  const canAdd = remaining > 0 && !uploading;

  const parseError = (err: unknown) =>
    err instanceof Error ? err.message : '上传失败，请稍后重试。';

  const appendUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    const next = [...valueRef.current, ...urls].slice(0, max);
    valueRef.current = next;
    onChange(next);
  };

  const uploadFiles = async (files: File[]) => {
    const images = files.filter(isImageFile);
    if (images.length === 0) {
      setError('仅支持 PNG / JPG。');
      return;
    }
    const picked = images.slice(0, remaining);
    if (picked.length === 0) {
      setError(`最多上传 ${max} 张图片。`);
      return;
    }

    setUploading(true);
    setError('');
    let uploadedCount = 0;
    try {
      for (let i = 0; i < picked.length; i += 1) {
        setProgress(`正在上传 ${i + 1}/${picked.length}`);
        const asset = await uploadImage(picked[i]);
        const urls = unwrapUploaded(asset);
        if (urls.length === 0) {
          throw new Error('上传成功但未返回图片地址。');
        }
        appendUrls(urls);
        uploadedCount += urls.length;
      }
      if (uploadedCount === 0) {
        throw new Error('上传成功但未返回图片地址。');
      }
      if (images.length > picked.length) {
        setError(`已达上限 ${max} 张，多余文件未上传。`);
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveItem = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleDragStart = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const from = dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
    moveItem(from, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="ui-multi-upload">
      <div className="ui-multi-upload__grid">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`ui-multi-upload__item ${
              dragIndex === index ? 'ui-multi-upload__item--dragging' : ''
            } ${overIndex === index && dragIndex !== index ? 'ui-multi-upload__item--over' : ''}`}
            draggable={!uploading}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragLeave={() => setOverIndex(null)}
            onDrop={handleDrop(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <button
              type="button"
              className="ui-multi-upload__thumb"
              onClick={() => setPreview(url)}
              title="预览大图"
            >
              <img src={url} alt={`内容图片 ${index + 1}`} />
            </button>
            <span className="ui-multi-upload__label">图片{index + 1}</span>
            <button
              type="button"
              className="ui-multi-upload__remove"
              title="删除"
              disabled={uploading}
              onClick={() => handleRemove(index)}
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            className="ui-multi-upload__add"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="plus" size={22} />
            <span>{uploading ? '上传中' : '添加图片'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void uploadFiles(files);
        }}
      />

      {progress && <div className="ui-multi-upload__hint">{progress}</div>}
      {error && <div className="ui-multi-upload__error">{error}</div>}

      {preview && (
        <div
          className="ui-multi-upload__lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="内容图片预览" onClick={(e) => e.stopPropagation()} />
          <button
            type="button"
            className="ui-multi-upload__lightbox-close"
            onClick={() => setPreview(null)}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
