import { useRef, useState } from 'react';
import Icon from './Icon';
import { deleteUpload, uploadImage, type UploadAsset } from '../../api/upload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [error, setError] = useState<string>('');
  const [retryFile, setRetryFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<UploadAsset | null>(null);

  const parseError = (err: unknown) =>
    err instanceof Error ? err.message : '上传失败，请稍后重试。';

  const doUpload = async (file: File) => {
    setUploading(true);
    setStatus('idle');
    setError('');
    setRetryFile(file);
    try {
      const uploaded = await uploadImage(file);
      const oldAssetId = asset?.id;
      setAsset(uploaded);
      onChange(uploaded.url);
      setStatus('success');
      if (oldAssetId && oldAssetId !== uploaded.id) {
        await deleteUpload(oldAssetId).catch(() => undefined);
      }
    } catch (err) {
      setStatus('fail');
      setError(parseError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    await doUpload(file);
  };

  const handleRetry = async () => {
    if (!retryFile) return;
    await doUpload(retryFile);
  };

  const handleRemove = async () => {
    if (asset?.id) {
      setUploading(true);
      setError('');
      try {
        await deleteUpload(asset.id);
      } catch (err) {
        setStatus('fail');
        setError(parseError(err));
        setUploading(false);
        return;
      }
    }
    setAsset(null);
    setStatus('idle');
    onChange('');
    setUploading(false);
  };

  if (value) {
    return (
      <div className="ui-upload ui-upload--filled">
        <img className="ui-upload__preview" src={value} alt="封面预览" />
        <div className="ui-upload__overlay">
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? '上传中...' : '更换'}
          </button>
          <button
            type="button"
            className="ui-btn ui-btn--danger ui-btn--sm"
            disabled={uploading}
            onClick={handleRemove}
          >
            移除
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <div className="ui-upload__status">
          {uploading && 'Uploading...'}
          {!uploading && status === 'success' && asset && (
            <span>Success: {asset.width}x{asset.height}</span>
          )}
          {!uploading && status === 'fail' && (
            <span>
              Fail: {error}{' '}
              <button
                type="button"
                className="ui-upload__retry"
                onClick={() => void handleRetry()}
                disabled={!retryFile || uploading}
              >
                Retry
              </button>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="ui-upload ui-upload--empty"
      disabled={uploading}
      onClick={() => inputRef.current?.click()}
    >
      <Icon name="image" size={22} />
      <span className="ui-upload__hint">{uploading ? 'Uploading...' : '点击上传封面'}</span>
      <span className="ui-upload__sub">建议 16:9，PNG / JPG</span>
      {!uploading && status === 'fail' && (
        <span className="ui-upload__error">
          Fail: {error}{' '}
          <span
            role="button"
            tabIndex={0}
            className="ui-upload__retry"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void handleRetry();
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              e.stopPropagation();
              if (!retryFile || uploading) return;
              void handleRetry();
            }}
          >
            Retry
          </span>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
