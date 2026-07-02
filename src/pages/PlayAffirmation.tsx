import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAffirmationByCode } from '../api/affirmations';
import './PlayAffirmation.css';

export default function PlayAffirmation() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('a');
  const [affirmation, setAffirmation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (code) {
      loadAffirmation(code);
    } else {
      setError('缺少参数 a（编号）');
      setLoading(false);
    }
  }, [code]);

  const loadAffirmation = async (affirmationCode: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAffirmationByCode(affirmationCode);
      setAffirmation(data);
    } catch (err: any) {
      setError(err.response?.status === 404 
        ? '未找到该编号的肯定语' 
        : '加载失败，请稍后重试');
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (loading) {
    return (
      <div className="play-affirmation">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="play-affirmation">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <div className="error-hint">
            请检查链接是否正确，格式应为：/play?a=001
          </div>
        </div>
      </div>
    );
  }

  if (!affirmation) {
    return null;
  }

  return (
    <div className="play-affirmation">
      <div className="play-container">
        <div className="affirmation-card">
          <div className="card-header">
            <h1 className="affirmation-title">
              {affirmation.title || affirmation.text.substring(0, 50)}
            </h1>
            {affirmation.code && (
              <div className="affirmation-code">编号: {affirmation.code}</div>
            )}
          </div>

          <div className="card-body">
            <div className="affirmation-text">
              {affirmation.text}
            </div>

            {affirmation.audio_url && affirmation.audio_url.trim() ? (
              <div className="audio-section">
                <audio
                  ref={audioRef}
                  src={affirmation.audio_url}
                  controls
                  className="audio-player"
                  autoPlay
                />
                <div className="audio-controls">
                  <button onClick={handlePlay} className="btn-play">
                    ▶️ 播放
                  </button>
                  <button onClick={handlePause} className="btn-pause">
                    ⏸️ 暂停
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-audio-message">
                <div className="no-audio-icon">🔇</div>
                <div className="no-audio-text">该肯定语暂无音频</div>
              </div>
            )}
          </div>

          <div className="card-footer">
            <div className="share-section">
              <div className="share-label">分享链接：</div>
              <div className="share-url">
                {window.location.href}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制到剪贴板');
                }}
                className="btn-copy"
              >
                📋 复制链接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



