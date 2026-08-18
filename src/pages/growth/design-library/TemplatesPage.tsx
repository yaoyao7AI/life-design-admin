import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import {
  Badge,
  Button,
  Icon,
  Input,
  Pagination,
  Select,
  Table,
  type Column,
} from '../../../components/ui';
import {
  deleteLibraryTemplate,
  getLibraryCategories,
  getLibraryTemplates,
  parseApiError,
  sortLibraryTemplates,
  updateLibraryTemplateStatus,
} from '../../../api/design-library';
import {
  PUBLISH_LABELS,
  PUBLISH_OPTIONS,
  STATUS_TONE,
  type LibraryCategory,
  type LibraryStatus,
  type LibraryTemplate,
} from '../../../types/design-library';
import '../growth.css';
import './design-library.css';

const PAGE_SIZE = 10;
const RECOMMEND_OPTIONS = [
  { value: '1', label: '推荐' },
  { value: '0', label: '未推荐' },
];

export default function DesignLibraryTemplatesPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<LibraryStatus | ''>('');
  const [recommend, setRecommend] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<LibraryTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [sorting, setSorting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getLibraryCategories({ page: 1, pageSize: 100, sortBy: 'sort', order: 'asc' });
        if (alive) setCategories(res.list);
      } catch {
        if (alive) setCategories([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLibraryTemplates({
        keyword,
        categoryId,
        status,
        isRecommend: recommend === '' ? '' : recommend === '1',
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
  }, [keyword, categoryId, status, recommend, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (item: LibraryTemplate) => {
    if (!window.confirm(`确定删除模板「${item.title}」吗？此操作为逻辑删除。`)) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteLibraryTemplate(item.id);
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) await load();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePublish = async (item: LibraryTemplate) => {
    const next = item.status === 'active' ? 'inactive' : 'active';
    setBusyId(item.id);
    setError(null);
    try {
      await updateLibraryTemplateStatus(item.id, next);
      await load();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const moveItem = async (item: LibraryTemplate, direction: 'up' | 'down') => {
    if (sorting) return;
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
      await sortLibraryTemplates(payload);
      await load();
    } catch (err) {
      setList(prev);
      setError(parseApiError(err));
    } finally {
      setSorting(false);
    }
  };

  const hasFilter = keyword !== '' || categoryId !== '' || status !== '' || recommend !== '';

  const columns: Column<LibraryTemplate>[] = [
    {
      key: 'title',
      header: '封面 / 标题',
      render: (item) => (
        <div className="article-cell">
          {item.cover ? (
            <img className="dl-cover" src={item.cover} alt="" />
          ) : (
            <div className="dl-cover dl-cover--empty">
              <Icon name="image" size={18} />
            </div>
          )}
          <div className="article-cell__text">
            <div className="article-cell__title">{item.title}</div>
            {item.subtitle && <div className="article-cell__en">{item.subtitle}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: '分类',
      width: '110px',
      render: (item) => <span className="topic-chip">{item.categoryName || '-'}</span>,
    },
    {
      key: 'duration',
      header: '时长',
      width: '90px',
      render: (item) => (
        <span className="metric">{item.durationLabel || (item.duration != null ? `${item.duration}分钟` : '-')}</span>
      ),
    },
    {
      key: 'views',
      header: '浏览',
      width: '84px',
      align: 'right',
      render: (item) => (
        <span className={`metric ${item.viewCount === 0 ? 'metric--muted' : ''}`}>
          {item.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '100px',
      render: (item) => (
        <Badge tone={STATUS_TONE[item.status]} dot>
          {PUBLISH_LABELS[item.status]}
        </Badge>
      ),
    },
    {
      key: 'recommend',
      header: '推荐',
      width: '80px',
      render: (item) =>
        item.isRecommend ? <Badge tone="warning">推荐</Badge> : <span className="metric metric--muted">-</span>,
    },
    {
      key: 'sort',
      header: '排序',
      width: '150px',
      render: (item) => {
        const idx = list.findIndex((row) => row.id === item.id);
        return (
          <div className="row-actions">
            <span className="metric" style={{ marginRight: 6 }}>{item.sort}</span>
            <Button size="sm" variant="ghost" disabled={sorting || idx === 0} onClick={() => void moveItem(item, 'up')}>
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
      width: '170px',
      align: 'right',
      render: (item) => (
        <div className="row-actions">
          <Button
            size="sm"
            variant="ghost"
            disabled={busyId === item.id}
            onClick={() => void handleTogglePublish(item)}
          >
            {item.status === 'active' ? '下架' : '上架'}
          </Button>
          <button
            className="row-action"
            title="编辑"
            onClick={() => navigate(`/growth/design-library/templates/${item.id}/edit`)}
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            className="row-action row-action--danger"
            title="删除"
            disabled={busyId === item.id}
            onClick={() => void handleDelete(item)}
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="模板管理"
        description="配置人生设计模板的内容、封面、分类与上架状态。"
        actions={
          <Button variant="primary" onClick={() => navigate('/growth/design-library/templates/new')}>
            <Icon name="plus" size={16} />
            新增模板
          </Button>
        }
      />

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            icon="search"
            placeholder="搜索模板标题…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="filter-bar__select"
          placeholder="全部分类"
          options={categories.map((item) => ({ value: item.id, label: item.name }))}
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        />
        <Select
          className="filter-bar__select"
          placeholder="全部状态"
          options={PUBLISH_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as LibraryStatus | '');
            setPage(1);
          }}
        />
        <Select
          className="filter-bar__select"
          placeholder="全部推荐"
          options={RECOMMEND_OPTIONS}
          value={recommend}
          onChange={(e) => {
            setRecommend(e.target.value);
            setPage(1);
          }}
        />
        <Button
          variant="ghost"
          disabled={!hasFilter}
          onClick={() => {
            setKeyword('');
            setCategoryId('');
            setStatus('');
            setRecommend('');
            setPage(1);
          }}
        >
          重置
        </Button>
      </div>

      <div className="ui-card" style={{ overflow: 'hidden' }}>
        {error && (
          <div className="topic-error" style={{ padding: 'var(--space-4)' }}>
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={() => void load()}>
              重试
            </Button>
          </div>
        )}
        <Table
          columns={columns}
          data={list}
          loading={loading}
          rowKey={(item) => item.id}
          empty={hasFilter ? '没有符合条件的模板' : '暂无模板，点击右上角新建'}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </>
  );
}
