import { useState } from 'react';
import Icon from '../ui/Icon';
import {
  BLOCK_LABELS,
  type Block,
  type BlockType,
} from '../../types/growth';
import { deleteUpload, uploadImage, type UploadAsset } from '../../api/upload';

interface BlockEditorProps {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}

const uid = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const ADD_TYPES: BlockType[] = ['h1', 'h2', 'p', 'quote', 'list', 'image', 'divider'];

const PLACEHOLDERS: Record<BlockType, string> = {
  h1: '大标题',
  h2: '小标题',
  p: '输入段落正文…',
  quote: '输入引用内容…',
  list: '每行一个列表项',
  image: '粘贴图片 URL（https://…）',
  divider: '',
};

export default function BlockEditor({ value, onChange }: BlockEditorProps) {
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [uploadStatusMap, setUploadStatusMap] = useState<
    Record<string, 'idle' | 'success' | 'fail'>
  >({});
  const [uploadErrorMap, setUploadErrorMap] = useState<Record<string, string>>({});
  const [retryFileMap, setRetryFileMap] = useState<Record<string, File | null>>({});
  const [uploadAssetMap, setUploadAssetMap] = useState<Record<string, UploadAsset | null>>({});

  const parseError = (err: unknown) =>
    err instanceof Error ? err.message : '上传失败，请稍后重试。';

  const setUploading = (id: string, uploading: boolean) => {
    setUploadingMap((prev) => ({ ...prev, [id]: uploading }));
  };

  const setStatus = (id: string, status: 'idle' | 'success' | 'fail') => {
    setUploadStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const clearUploadState = (id: string) => {
    setUploadingMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setUploadStatusMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setUploadErrorMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRetryFileMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setUploadAssetMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const deleteUploadedAsset = async (blockId: string) => {
    const assetId = uploadAssetMap[blockId]?.id;
    if (!assetId) return;
    await deleteUpload(assetId).catch(() => undefined);
    setUploadAssetMap((prev) => ({ ...prev, [blockId]: null }));
  };

  const uploadBlockImage = async (blockId: string, file: File) => {
    setUploading(blockId, true);
    setStatus(blockId, 'idle');
    setUploadErrorMap((prev) => ({ ...prev, [blockId]: '' }));
    setRetryFileMap((prev) => ({ ...prev, [blockId]: file }));
    try {
      const oldAssetId = uploadAssetMap[blockId]?.id;
      const uploaded = await uploadImage(file);
      if (oldAssetId && oldAssetId !== uploaded.id) {
        await deleteUpload(oldAssetId).catch(() => undefined);
      }
      setUploadAssetMap((prev) => ({ ...prev, [blockId]: uploaded }));
      updateBlock(blockId, { text: uploaded.url });
      setStatus(blockId, 'success');
    } catch (err) {
      setStatus(blockId, 'fail');
      setUploadErrorMap((prev) => ({ ...prev, [blockId]: parseError(err) }));
    } finally {
      setUploading(blockId, false);
    }
  };

  const addBlock = (type: BlockType) => {
    onChange([...value, { id: uid(), type, text: '' }]);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = async (id: string) => {
    await deleteUploadedAsset(id);
    clearUploadState(id);
    onChange(value.filter((b) => b.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="block-editor">
      {value.length === 0 && (
        <div className="block-editor__empty">
          还没有内容，点击下方按钮添加第一个内容块。
        </div>
      )}

      {value.map((block, index) => (
        <div className="block" key={block.id}>
          <div className="block__gutter">
            <select
              className="block__type"
              value={block.type}
              onChange={(e) =>
                updateBlock(block.id, { type: e.target.value as BlockType })
              }
            >
              {ADD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BLOCK_LABELS[t]}
                </option>
              ))}
            </select>
            <div className="block__ops">
              <button
                type="button"
                className="block__op"
                title="上移"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <Icon name="chevron-down" size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                type="button"
                className="block__op"
                title="下移"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                <Icon name="chevron-down" size={14} />
              </button>
              <button
                type="button"
                className="block__op block__op--danger"
                title="删除"
                onClick={() => void removeBlock(block.id)}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>

          <div className="block__body">
            {renderBlockInput({
              block,
              update: updateBlock,
              uploading: uploadingMap[block.id] ?? false,
              status: uploadStatusMap[block.id] ?? 'idle',
              error: uploadErrorMap[block.id] ?? '',
              asset: uploadAssetMap[block.id] ?? null,
              onUpload: (file) => uploadBlockImage(block.id, file),
              onRetry: () => {
                const retryFile = retryFileMap[block.id];
                if (!retryFile) return Promise.resolve();
                return uploadBlockImage(block.id, retryFile);
              },
              onClearImage: async () => {
                await deleteUploadedAsset(block.id);
                setStatus(block.id, 'idle');
                updateBlock(block.id, { text: '' });
              },
            })}
          </div>
        </div>
      ))}

      <div className="block-editor__toolbar">
        <span className="block-editor__toolbar-label">添加内容块</span>
        {ADD_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className="block-editor__add"
            onClick={() => addBlock(t)}
          >
            <Icon name="plus" size={13} />
            {BLOCK_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RenderBlockInputProps {
  block: Block;
  update: (id: string, patch: Partial<Block>) => void;
  uploading: boolean;
  status: 'idle' | 'success' | 'fail';
  error: string;
  asset: UploadAsset | null;
  onUpload: (file: File) => Promise<void>;
  onRetry: () => Promise<void>;
  onClearImage: () => Promise<void>;
}

function renderBlockInput({
  block,
  update,
  uploading,
  status,
  error,
  asset,
  onUpload,
  onRetry,
  onClearImage,
}: RenderBlockInputProps) {
  if (block.type === 'divider') {
    return <div className="block__divider" aria-hidden="true" />;
  }

  if (block.type === 'image') {
    return (
      <div className="block__image">
        <input
          className="ui-input"
          value={block.text}
          placeholder={PLACEHOLDERS.image}
          onChange={(e) => update(block.id, { text: e.target.value })}
        />
        <div className="block__image-actions">
          <label className="ui-btn ui-btn--secondary ui-btn--sm">
            选择图片
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.currentTarget.value = '';
              }}
            />
          </label>
          {block.text && (
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--sm"
              onClick={() => void onClearImage()}
              disabled={uploading}
            >
              清空
            </button>
          )}
          <span className="block__upload-status">
            {uploading && 'Uploading...'}
            {!uploading && status === 'success' && asset && (
              <span>Success: {asset.width}x{asset.height}</span>
            )}
            {!uploading && status === 'fail' && (
              <span>
                Fail: {error}{' '}
                <button
                  type="button"
                  className="block__upload-retry"
                  onClick={() => void onRetry()}
                >
                  Retry
                </button>
              </span>
            )}
          </span>
        </div>
        {block.text && (
          <img className="block__image-preview" src={block.text} alt="" />
        )}
      </div>
    );
  }

  const className =
    block.type === 'h1'
      ? 'block__text block__text--h1'
      : block.type === 'h2'
      ? 'block__text block__text--h2'
      : block.type === 'quote'
      ? 'block__text block__text--quote'
      : 'block__text';

  const rows = block.type === 'p' || block.type === 'list' ? 3 : 1;

  return (
    <textarea
      className={className}
      rows={rows}
      value={block.text}
      placeholder={PLACEHOLDERS[block.type]}
      onChange={(e) => update(block.id, { text: e.target.value })}
    />
  );
}
