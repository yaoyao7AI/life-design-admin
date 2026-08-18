import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  Pagination,
  Table,
  type Column,
} from '../../../components/ui';
import {
  createLibraryTag,
  deleteLibraryTag,
  getLibraryTags,
  parseApiError,
  sortLibraryTags,
  updateLibraryTag,
} from '../../../api/design-library';
import type { LibraryTag } from '../../../types/design-library';
import '../growth.css';

const PAGE_SIZE = 20;

export default function DesignLibraryTagsPage() {
  const [list, setList] = useState<LibraryTag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLibraryTags({
        keyword,
        page,
        pageSize: PAGE_SIZE,
        sortBy: 'sort',
        order: 'asc',
      });
      setList(res.list);
      setTotal(res.total);
    } catch (err) {
      setError(parseApiError(err));
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('请填写标签名称。');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const current = list.find((item) => item.id === editingId);
        await updateLibraryTag(editingId, {
          name: trimmed,
          sort: current?.sort,
          status: current?.status ?? 'active',
        });
      } else {
        await createLibraryTag({ name: trimmed, status: 'active' });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LibraryTag) => {
    if (!window.confirm(`确定删除标签「${item.name}」吗？此操作为逻辑删除。`)) return;
    setError(null);
    try {
      await deleteLibraryTag(item.id);
      if (editingId === item.id) resetForm();
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) await load();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const moveItem = async (item: LibraryTag, direction: 'up' | 'down') => {
    if (sorting || saving) return;
    const index = list.findIndex((row) => row.id === item.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= list.length) return;
    const payload = [
      { id: list[swapIndex].id, sort: list[index].sort },
      { id: list[index].id, sort: list[swapIndex].sort },
    ];
    const prev = list;
    const next = [...list];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setList(next.map((row, idx) => ({ ...row, sort: prev[idx].sort })));
    setSorting(true);
    setError(null);
    try {
      await sortLibraryTags(payload);
      await load();
    } catch (err) {
      setList(prev);
      setError(parseApiError(err));
    } finally {
      setSorting(false);
    }
  };

  const columns = useMemo<Column<LibraryTag>[]>(
    () => [
      {
        key: 'name',
        header: '名称',
        render: (item) => <span className="topic-name">{item.name}</span>,
      },
      {
        key: 'sort',
        header: '排序',
        width: '80px',
        render: (item) => <span className="metric">{item.sort}</span>,
      },
      {
        key: 'move',
        header: '排序操作',
        width: '160px',
        render: (item) => {
          const idx = list.findIndex((row) => row.id === item.id);
          return (
            <div className="row-actions">
              <Button
                size="sm"
                variant="ghost"
                disabled={sorting || idx === 0}
                onClick={() => void moveItem(item, 'up')}
              >
                上移
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={sorting || idx === list.length - 1}
                onClick={() => void moveItem(item, 'down')}
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
        width: '120px',
        align: 'right',
        render: (item) => (
          <div className="row-actions">
            <button
              className="row-action"
              title="编辑"
              onClick={() => {
                setEditingId(item.id);
                setName(item.name);
                setShowForm(true);
              }}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              className="row-action row-action--danger"
              title="删除"
              onClick={() => void handleDelete(item)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ),
      },
    ],
    [list, sorting]
  );

  return (
    <>
      <PageHeader
        title="标签管理"
        description="维护模板标签（睡前 / 晨间 / 财富 / AI 等），模板可多选。"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setName('');
              setShowForm(true);
            }}
          >
            <Icon name="plus" size={16} />
            新增标签
          </Button>
        }
      />

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            icon="search"
            placeholder="搜索标签…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button
          variant="ghost"
          disabled={!keyword}
          onClick={() => {
            setKeyword('');
            setPage(1);
          }}
        >
          重置
        </Button>
      </div>

      {showForm && (
        <Card className="topic-form-card">
          <div className="topic-form">
            <div className="topic-form__row">
              <label className="topic-form__label">标签名称</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：睡前"
              />
            </div>
            <div className="topic-form__actions">
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={saving}>
                {saving ? '保存中...' : editingId ? '更新标签' : '创建标签'}
              </Button>
              <Button variant="ghost" onClick={resetForm} disabled={saving}>
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
            <Button size="sm" variant="ghost" onClick={() => void load()}>
              重试
            </Button>
          </div>
        </Card>
      )}

      <Card style={{ overflow: 'hidden' }}>
        {!loading && list.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="暂无标签"
            description="可新增：睡前、晨间、财富、AI、复盘、阅读、健康、情绪。"
            action={
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <Icon name="plus" size={16} />
                新增标签
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={list}
              loading={loading}
              rowKey={(item) => item.id}
              empty={keyword ? '没有符合条件的标签' : '暂无标签'}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
