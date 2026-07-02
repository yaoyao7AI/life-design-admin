import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { Button, Card, EmptyState, Icon, Input, Table, type Column } from '../../components/ui';
import {
  createGrowthTopic,
  deleteGrowthTopic,
  getGrowthTopics,
  sortGrowthTopics,
  updateGrowthTopic,
  type GrowthTopic,
} from '../../api/growth/topics';
import './growth.css';

interface TopicForm {
  slug: string;
  name: string;
}

const EMPTY_FORM: TopicForm = {
  slug: '',
  name: '',
};

const parseError = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。';

const sortByOrder = (items: GrowthTopic[]) => [...items].sort((a, b) => a.order - b.order);

const normalizeSortPayload = (items: GrowthTopic[]) => ({
  topics: items.map((item, index) => ({
    id: item.id,
    order: index + 1,
  })),
});

export default function TopicsPage() {
  const [topics, setTopics] = useState<GrowthTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TopicForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getGrowthTopics();
      setTopics(sortByOrder(list));
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const moveTopic = async (topic: GrowthTopic, direction: 'up' | 'down') => {
    if (sorting || saving) return;
    const index = topics.findIndex((item) => item.id === topic.id);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= topics.length) return;

    const next = [...topics];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const withOrder = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    const prev = topics;
    setTopics(withOrder);
    setSorting(true);
    setError(null);

    try {
      await sortGrowthTopics(normalizeSortPayload(withOrder));
      setTopics(sortByOrder(withOrder));
    } catch (err) {
      setTopics(prev);
      setError(parseError(err));
    } finally {
      setSorting(false);
    }
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (topic: GrowthTopic) => {
    setEditingId(topic.id);
    setForm({
      slug: topic.slug,
      name: topic.name,
    });
    setShowForm(true);
  };

  const handleDelete = async (topic: GrowthTopic) => {
    if (!window.confirm(`确定删除主题「${topic.name}」吗？`)) return;
    setError(null);
    try {
      await deleteGrowthTopic(topic.id);
      setTopics((prev) => prev.filter((item) => item.id !== topic.id));
      if (editingId === topic.id) {
        resetForm();
      }
    } catch (err) {
      setError(parseError(err));
    }
  };

  const handleSubmit = async () => {
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
    };
    if (!payload.slug || !payload.name) {
      setError('请填写完整的主题名称和 slug。');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateGrowthTopic(editingId, payload);
      } else {
        await createGrowthTopic(payload);
      }
      resetForm();
      await loadTopics();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<Column<GrowthTopic>[]>(
    () => [
      {
        key: 'order',
        header: '排序',
        width: '100px',
        render: (topic) => <span className="metric">{topic.order}</span>,
      },
      {
        key: 'name',
        header: '主题名称',
        render: (topic) => <span className="topic-name">{topic.name}</span>,
      },
      {
        key: 'slug',
        header: 'Slug',
        width: '180px',
        render: (topic) => <code className="topic-slug">{topic.slug}</code>,
      },
      {
        key: 'articleCount',
        header: '文章数',
        width: '100px',
        align: 'right',
        render: (topic) => <span className="metric">{topic.articleCount}</span>,
      },
      {
        key: 'createdAt',
        header: '创建时间',
        width: '150px',
        render: (topic) => (
          <span className="metric metric--muted">
            {topic.createdAt?.slice(0, 10) ?? '-'}
          </span>
        ),
      },
      {
        key: 'sort',
        header: '排序操作',
        width: '190px',
        render: (topic) => {
          const idx = topics.findIndex((item) => item.id === topic.id);
          const isFirst = idx === 0;
          const isLast = idx === topics.length - 1;
          return (
            <div className="row-actions">
              <Button
                size="sm"
                variant="ghost"
                disabled={sorting || isFirst}
                onClick={() => moveTopic(topic, 'up')}
              >
                上移
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={sorting || isLast}
                onClick={() => moveTopic(topic, 'down')}
              >
                下移
              </Button>
            </div>
          );
        },
      },
      {
        key: 'actions',
        header: '操作',
        width: '140px',
        align: 'right',
        render: (topic) => (
          <div className="row-actions">
            <button className="row-action" title="编辑" onClick={() => handleEdit(topic)}>
              <Icon name="edit" size={16} />
            </button>
            <button
              className="row-action row-action--danger"
              title="删除"
              onClick={() => handleDelete(topic)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ),
      },
    ],
    [topics, sorting]
  );

  return (
    <>
      <PageHeader
        title="主题管理"
        description="管理内容主题（财富 / AI / 成长 / 人生设计）及排序。"
        actions={
          <Button variant="primary" onClick={handleCreateClick}>
            <Icon name="plus" size={16} />
            新建主题
          </Button>
        }
      />

      {(showForm || topics.length === 0) && (
        <Card className="topic-form-card">
          <div className="topic-form">
            <div className="topic-form__row">
              <label className="topic-form__label">主题名称</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：财富"
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="例如：wealth"
              />
            </div>
            <div className="topic-form__actions">
              <Button variant="primary" onClick={handleSubmit} disabled={saving || sorting}>
                {saving ? '保存中...' : editingId ? '更新主题' : '创建主题'}
              </Button>
              <Button variant="ghost" onClick={resetForm} disabled={saving || sorting}>
                取消
              </Button>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="topic-error-card">
          <div className="topic-error">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={loadTopics}>
              重试
            </Button>
          </div>
        </Card>
      )}

      <Card style={{ overflow: 'hidden' }}>
        {!loading && topics.length === 0 ? (
          <EmptyState
            icon="layers"
            title="暂无主题"
            description="请先创建一个主题。"
            action={
              <Button variant="primary" onClick={handleCreateClick}>
                <Icon name="plus" size={16} />
                新建主题
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={topics}
            loading={loading}
            rowKey={(topic) => topic.id}
            empty="暂无主题"
          />
        )}
      </Card>
    </>
  );
}
