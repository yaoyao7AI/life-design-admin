import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAffirmations, deleteAffirmation, Affirmation } from '../api/affirmations';
import './AffirmationsList.css';

export default function AffirmationsList() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAffirmations();
  }, []);

  const loadAffirmations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAffirmations();
      setAffirmations(data);
    } catch (err) {
      setError('加载失败，请稍后重试');
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条肯定语吗？')) {
      return;
    }

    try {
      await deleteAffirmation(id);
      alert('删除成功');
      loadAffirmations();
    } catch (err) {
      alert('删除失败，请稍后重试');
      console.error('删除失败:', err);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/create');
  };

  if (loading) {
    return (
      <div className="affirmations-list">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="affirmations-list">
        <div className="error">{error}</div>
        <button onClick={loadAffirmations} className="btn-retry">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="affirmations-list">
      <div className="header">
        <h1>肯定语列表</h1>
        <button onClick={handleCreate} className="btn-create">
          ➕ 新增肯定语
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>编号</th>
            <th>标题</th>
            <th>文本内容</th>
            <th>短链接</th>
            <th>音频</th>
            <th style={{ width: '160px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {affirmations.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty">
                暂无数据
              </td>
            </tr>
          ) : (
            affirmations.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.code || '-'}</td>
                <td>
                  {item.title && item.title.trim() 
                    ? item.title 
                    : item.text.length > 50 
                      ? item.text.substring(0, 50) + '...' 
                      : item.text}
                </td>
                <td className="text-content">
                  {item.text.length > 100 
                    ? item.text.substring(0, 100) + '...' 
                    : item.text}
                </td>
                <td className="short-url-cell">
                  {item.short_url ? (
                    <a
                      href={item.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-url-link"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {item.short_url}
                    </a>
                  ) : (
                    <span className="no-short-url">-</span>
                  )}
                </td>
                <td>
                  {item.audio_url && item.audio_url.trim() ? (
                    <audio src={item.audio_url} controls />
                  ) : (
                    <span className="no-audio">无音频</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="btn-edit"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-delete"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

