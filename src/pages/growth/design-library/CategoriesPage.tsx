import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  Pagination,
  Select,
  Table,
  type Column,
} from '../../../components/ui';
import {
  createLibraryCategory,
  deleteLibraryCategory,
  getLibraryCategories,
  parseApiError,
  sortLibraryCategories,
  updateLibraryCategory,
  updateLibraryCategoryStatus,
} from '../../../api/design-library';
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONE,
  type LibraryCategory,
  type LibraryStatus,
} from '../../../types/design-library';
import '../growth.css';

const PAGE_SIZE = 20;

interface CategoryForm {
  name: string;
  description: string;
  status: LibraryStatus;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  description: '',
  status: 'active',
};

export default function DesignLibraryCategoriesPage() {
  const [list, setList] = useState<LibraryCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<LibraryStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLibraryCategories({
        keyword,
        status,
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
  }, [keyword, status, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('请填写分类名称。');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        description: form.description.trim(),
        status: form.status,
      };
      if (editingId) {
        const current = list.find((item) => item.id === editingId);
        await updateLibraryCategory(editingId, { ...payload, sort: current?.sort });
      } else {
        await createLibraryCategory(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LibraryCategory) => {
    if (!window.confirm(`确定删除分类「${item.name}」吗？此操作为逻辑删除。`)) return;
    setError(null);
    try {
      await deleteLibraryCategory(item.id);
      if (editingId === item.id) resetForm();
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) await load();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleToggleStatus = async (item: LibraryCategory) => {
    const next = item.status === 'active' ? 'inactive' : 'active';
    setError(null);
    try {
      await updateLibraryCategoryStatus(item.id, next);
      await load();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const moveItem = async (item: LibraryCategory, direction: 'up' | 'down') => {
    if (sorting || saving) return;
    const index = list.findIndex((row) => row.id === item.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= list.length) return;

    const next = [...list];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const payload = [
      { id: next[index].id, sort: list[index].sort },
      { id: next[swapIndex].id, sort: list[swapIndex].sort },
    ];
    const prev = list;
    setList(next.map((row, idx) => ({ ...row, sort: prev[idx].sort })));
    setSorting(true);
    setError(null);
    try {
      await sortLibraryCategories(payload);
      await load();
    } catch (err) {
      setList(prev);
      setError(parseApiError(err));
    } finally {
      setSorting(false);
    }
  };

  const columns = useMemo<Column<LibraryCategory>[]>(
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
        key: 'status',
        header: '状态',
        width: '110px',
        render: (item) => (
          <Badge tone={STATUS_TONE[item.status]} dot>
            {STATUS_LABELS[item.status]}
          </Badge>
        ),
      },
      {
        key: 'count',
        header: '模板数',
        width: '90px',
        align: 'right',
        render: (item) => <span className="metric">{item.templateCount}</span>,
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
        width: '220px',
        align: 'right',
        render: (item) => (
          <div className="row-actions">
            <Button size="sm" variant="ghost" onClick={() => void handleToggleStatus(item)}>
              {item.status === 'active' ? '停用' : '启用'}
            </Button>
            <button
              className="row-action"
              title="编辑"
              onClick={() => {
                setEditingId(item.id);
                setForm({
                  name: item.name,
                  description: item.description ?? '',
                  status: item.status,
                });
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

  const hasFilter = keyword !== '' || status !== '';

  return (
    <>
      <PageHeader
        title="分类管理"
        description="配置人生设计库分类，支持启用、停用与排序。"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
          >
            <Icon name="plus" size={16} />
            新增分类
          </Button>
        }
      />

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            icon="search"
            placeholder="搜索分类名称…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="filter-bar__select"
          placeholder="全部状态"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as LibraryStatus | '');
            setPage(1);
          }}
        />
        <Button
          variant="ghost"
          disabled={!hasFilter}
          onClick={() => {
            setKeyword('');
            setStatus('');
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
              <label className="topic-form__label">名称</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：行动模板"
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">简介</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="可选"
              />
            </div>
            <div className="topic-form__row" style={{ maxWidth: 160 }}>
              <label className="topic-form__label">状态</label>
              <Select
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as LibraryStatus }))
                }
              />
            </div>
            <div className="topic-form__actions">
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={saving}>
                {saving ? '保存中...' : editingId ? '更新分类' : '创建分类'}
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
            icon="layers"
            title="暂无分类"
            description="请先创建一个分类。"
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setShowForm(true);
                }}
              >
                <Icon name="plus" size={16} />
                新增分类
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
              empty={hasFilter ? '没有符合条件的分类' : '暂无分类'}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
