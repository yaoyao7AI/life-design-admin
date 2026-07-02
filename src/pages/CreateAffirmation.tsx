import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAffirmation, uploadAudio } from '../api/affirmations';
import './CreateAffirmation.css';

export default function CreateAffirmation() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('请填写文本内容');
      return;
    }

    try {
      setSaving(true);
      let audioUrl = '';

      // 如果有音频文件，先上传
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

      // 创建肯定语（title 可选，如果不提供，后端会使用 text 前50字符）
      await createAffirmation({
        ...(title.trim() && { title: title.trim() }),  // 只有当 title 不为空时才发送
        text: text.trim(),
        ...(audioUrl && { audio_url: audioUrl }),  // 只有当有音频 URL 时才发送
      });

      alert('创建成功');
      navigate('/affirmations');
    } catch (err) {
      alert('创建失败，请稍后重试');
      console.error('创建失败:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-affirmation">
      <div className="form-container">
        <h2>新增肯定语</h2>

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
            <label htmlFor="audio">音频文件（可选）</label>
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
            {audioFile && (
              <div className="file-info">
                已选择: {audioFile.name}
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

