import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
  Badge,
  Button,
  Icon,
  Input,
  Pagination,
  Select,
  Table,
  type Column,
} from '../../components/ui';
import {
  deleteGrowthArticle,
  getGrowthArticles,
  type ArticleQuery,
} from '../../api/growth/articles';
import {
  ACCESS_LABELS,
  ACCESS_OPTIONS,
  ACCESS_TONE,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONE,
  TOPIC_LABELS,
  TOPIC_OPTIONS,
  type AccessLevel,
  type Article,
  type ArticleStatus,
  type TopicSlug,
} from '../../types/growth';
import './growth.css';

// 用户端站点地址（预览跳转）。接入正式环境时替换即可。
const USER_SITE = 'https://designyourlife.app';
const PAGE_SIZE = 8;
const parseError = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。';

interface Filters {
  keyword: string;
  topic: TopicSlug | '';
  status: ArticleStatus | '';
  access: AccessLevel | '';
}

const EMPTY_FILTERS: Filters = {
  keyword: '',
  topic: '',
  status: '',
  access: '',
};

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (query: ArticleQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGrowthArticles(query);
      setData(res.list);
      setTotal(res.total);
    } catch (err) {
      setError(parseError(err));
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 筛选变化（keyword 带轻量防抖）后重新拉取
  useEffect(() => {
    const timer = setTimeout(() => {
      load({ ...filters, page, pageSize: PAGE_SIZE });
    }, 200);
    return () => clearTimeout(timer);
  }, [filters, page, load]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleDelete = async (article: Article) => {
    if (!window.confirm(`确定删除文章「${article.title}」吗？`)) return;
    setDeletingId(article.id);
    setError(null);
    try {
      await deleteGrowthArticle(article.id);
      // 删除后若当前页空了则回退一页
      const nextPage = data.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      load({ ...filters, page: nextPage, pageSize: PAGE_SIZE });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (article: Article) => {
    window.open(`${USER_SITE}/growth/${article.slug}`, '_blank');
  };

  const hasActiveFilter =
    filters.keyword !== '' ||
    filters.topic !== '' ||
    filters.status !== '' ||
    filters.access !== '';

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: '标题',
      render: (a) => (
        <div className="article-cell">
          {a.cover ? (
            <img className="article-cell__cover" src={a.cover} alt="" />
          ) : (
            <div className="article-cell__cover article-cell__cover--empty">
              <Icon name="image" size={18} />
            </div>
          )}
          <div className="article-cell__text">
            <div className="article-cell__title">{a.title}</div>
            {a.titleEn && <div className="article-cell__en">{a.titleEn}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'topic',
      header: '主题',
      width: '110px',
      render: (a) => <span className="topic-chip">{TOPIC_LABELS[a.topic]}</span>,
    },
    {
      key: 'access',
      header: '权限',
      width: '110px',
      render: (a) => (
        <Badge tone={ACCESS_TONE[a.access]}>{ACCESS_LABELS[a.access]}</Badge>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '110px',
      render: (a) => (
        <Badge tone={STATUS_TONE[a.status]} dot>
          {STATUS_LABELS[a.status]}
        </Badge>
      ),
    },
    {
      key: 'views',
      header: '阅读量',
      width: '96px',
      align: 'right',
      render: (a) => (
        <span className={`metric ${a.views === 0 ? 'metric--muted' : ''}`}>
          {a.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'likes',
      header: '点赞',
      width: '84px',
      align: 'right',
      render: (a) => (
        <span className={`metric ${a.likes === 0 ? 'metric--muted' : ''}`}>
          {a.likes.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '130px',
      align: 'right',
      render: (a) => (
        <div className="row-actions">
          <button
            className="row-action"
            title="预览"
            onClick={() => handlePreview(a)}
          >
            <Icon name="eye" size={16} />
          </button>
          <button
            className="row-action"
            title="编辑"
            onClick={() => navigate(`/growth/articles/${a.id}/edit`)}
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            className="row-action row-action--danger"
            title="删除"
            disabled={deletingId === a.id}
            onClick={() => handleDelete(a)}
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
        title="文章管理"
        description="管理成长模块的所有文章内容、分类与发布状态。"
        actions={
          <Button variant="primary" onClick={() => navigate('/growth/articles/new')}>
            <Icon name="plus" size={16} />
            新建文章
          </Button>
        }
      />

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            icon="search"
            placeholder="搜索文章标题…"
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
          />
        </div>
        <Select
          className="filter-bar__select"
          placeholder="全部主题"
          options={TOPIC_OPTIONS}
          value={filters.topic}
          onChange={(e) => updateFilter('topic', e.target.value as TopicSlug | '')}
        />
        <Select
          className="filter-bar__select"
          placeholder="全部状态"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) =>
            updateFilter('status', e.target.value as ArticleStatus | '')
          }
        />
        <Select
          className="filter-bar__select"
          placeholder="全部权限"
          options={ACCESS_OPTIONS}
          value={filters.access}
          onChange={(e) =>
            updateFilter('access', e.target.value as AccessLevel | '')
          }
        />
        <Button
          variant="ghost"
          onClick={handleReset}
          disabled={!hasActiveFilter}
        >
          重置
        </Button>
      </div>

      <div className="ui-card" style={{ overflow: 'hidden' }}>
        {error && (
          <div className="topic-error" style={{ padding: 'var(--space-4)' }}>
            <span>{error}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => load({ ...filters, page, pageSize: PAGE_SIZE })}
            >
              重试
            </Button>
          </div>
        )}
        <Table
          columns={columns}
          data={data}
          loading={loading}
          rowKey={(a) => a.id}
          empty={hasActiveFilter ? '没有符合条件的文章' : '暂无文章，点击右上角新建'}
        />
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={setPage}
        />
      </div>
    </>
  );
}
