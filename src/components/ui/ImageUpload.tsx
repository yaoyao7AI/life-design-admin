import { useRef } from 'react';
import Icon from './Icon';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

/**
 * 封面上传（Mock）。
 * 选择本地文件后用 URL.createObjectURL 生成预览地址；
 * 接入后端时改为上传接口返回的真实 URL 即可。
 */
export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  if (value) {
    return (
      <div className="ui-upload ui-upload--filled">
        <img className="ui-upload__preview" src={value} alt="封面预览" />
        <div className="ui-upload__overlay">
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm"
            onClick={() => inputRef.current?.click()}
          >
            更换
          </button>
          <button
            type="button"
            className="ui-btn ui-btn--danger ui-btn--sm"
            onClick={() => onChange('')}
          >
            移除
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="ui-upload ui-upload--empty"
      onClick={() => inputRef.current?.click()}
    >
      <Icon name="image" size={22} />
      <span className="ui-upload__hint">点击上传封面</span>
      <span className="ui-upload__sub">建议 16:9，PNG / JPG</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
