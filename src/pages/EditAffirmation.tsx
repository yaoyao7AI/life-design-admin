import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAffirmationById,
  updateAffirmation,
  uploadAudio,
} from '../api/affirmations';
import './EditAffirmation.css';

export default function EditAffirmation() {
  const { id } = useParams<{ id: string }>();
  const [affirmation, setAffirmation] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadAffirmation(parseInt(id));
    }
  }, [id]);

  const loadAffirmation = async (affirmationId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAffirmationById(affirmationId);
      setAffirmation(data);
      setTitle(data.title);
      setText(data.text);
      setCurrentAudioUrl(data.audio_url || '');
    } catch (err) {
      setError('加载失败，请稍后重试');
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !text.trim()) {
      alert('请填写文本内容');
      return;
    }

    try {
      setSaving(true);
      let audioUrl = currentAudioUrl;

      // 如果有新音频文件，先上传
      if (audioFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadAudio(audioFile);
          audioUrl = uploadResult.url;
        } catch (err) {
          alert('音频上传失败，请稍后重试');
          console.error('上传失败:', err);
          setUploading(false);
          setSaving(false);
          return;
        }
        setUploading(false);
      }

      // 更新肯定语（只发送有值的字段）
      const updateData: any = {
        text: text.trim(),
      };
      if (title.trim()) {
        updateData.title = title.trim();
      }
      if (audioUrl && audioUrl.trim()) {
        updateData.audio_url = audioUrl;
      }

      await updateAffirmation(parseInt(id), updateData);

      alert('更新成功');
      navigate('/affirmations');
    } catch (err) {
      alert('更新失败，请稍后重试');
      console.error('更新失败:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-affirmation">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-affirmation">
        <div className="error">{error}</div>
        <button onClick={() => id && loadAffirmation(parseInt(id))} className="btn-retry">
          重试
        </button>
        <button onClick={() => navigate('/affirmations')} className="btn-back">
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="edit-affirmation">
      <div className="form-container">
        <h2>编辑肯定语</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题（可选）</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="不填写则使用文本内容前50字符作为标题"
            />
          </div>

          <div className="form-group">
            <label htmlFor="text">文本内容 *</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入文本内容"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>短链接</label>
            {affirmation?.short_url ? (
              <div className="short-url-display">
                <a
                  href={affirmation.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="short-url-link-display"
                >
                  {affirmation.short_url}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (affirmation.short_url) {
                      navigator.clipboard.writeText(affirmation.short_url);
                      alert('短链接已复制到剪贴板');
                    }
                  }}
                  className="btn-copy-link"
                >
                  📋 复制
                </button>
              </div>
            ) : (
              <div className="no-short-url">暂无短链接</div>
            )}
          </div>

          <div className="form-group">
            <label>当前音频</label>
            {currentAudioUrl && currentAudioUrl.trim() ? (
              <div className="current-audio">
                <audio src={currentAudioUrl} controls />
              </div>
            ) : (
              <div className="no-audio">暂无音频</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="audio">更换音频文件（可选）</label>
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
            {audioFile && (
              <div className="file-info">
                已选择新文件: {audioFile.name}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={uploading || saving}
            >
              {uploading ? '上传中...' : saving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/affirmations')}
            >
              返回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

