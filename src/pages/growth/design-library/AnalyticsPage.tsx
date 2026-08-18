import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Input,
  Pagination,
  Table,
  type Column,
} from '../../../components/ui';
import { getLibraryStats, parseApiError } from '../../../api/design-library';
import type { LibraryStatsSummary, LibraryTemplate } from '../../../types/design-library';
import '../growth.css';
import './design-library.css';

const PAGE_SIZE = 20;
const EMPTY_SUMMARY: LibraryStatsSummary = {
  templateCount: 0,
  viewCount: 0,
  addToTodoCount: 0,
  favoriteCount: 0,
};

type SortKey = 'view_count' | 'add_to_todo_count' | 'favorite_count' | 'title';

export default function DesignLibraryAnalyticsPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>('view_count');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [list, setList] = useState<LibraryTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<LibraryStatsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLibraryStats({
        keyword,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        order,
      });
      setList(res.list);
      setTotal(res.total);
      setSummary(res.summary);
    } catch (err) {
      setError(parseApiError(err));
      setList([]);
      setTotal(0);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setOrder(key === 'title' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const sortHeader = (key: SortKey, label: string) => (
    <button type="button" className="dl-sort-header" onClick={() => toggleSort(key)}>
      {label}
      {sortBy === key ? (order === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  );

  const columns: Column<LibraryTemplate>[] = [
    {
      key: 'title',
      header: sortHeader('title', '模板'),
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
            <div className="article-cell__en">{item.categoryName || '未分类'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'views',
      header: sortHeader('view_count', '浏览'),
      width: '120px',
      align: 'right',
      render: (item) => (
        <span className={`metric ${item.viewCount === 0 ? 'metric--muted' : ''}`}>
          {item.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'todo',
      header: sortHeader('add_to_todo_count', '添加待办'),
      width: '140px',
      align: 'right',
      render: (item) => (
        <span className={`metric ${item.addToTodoCount === 0 ? 'metric--muted' : ''}`}>
          {item.addToTodoCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'fav',
      header: sortHeader('favorite_count', '收藏'),
      width: '120px',
      align: 'right',
      render: (item) => (
        <span className={`metric ${item.favoriteCount === 0 ? 'metric--muted' : ''}`}>
          {item.favoriteCount.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="数据统计"
        description="只读查看模板浏览、添加待办与收藏，用于运营分析。"
      />

      <div className="analytics-cards analytics-cards--4 analytics-block">
        <Card className="analytics-metric-card">
          <CardBody>
            <div className="analytics-metric-label">模板数</div>
            <div className="analytics-metric-value">{summary.templateCount.toLocaleString()}</div>
          </CardBody>
        </Card>
        <Card className="analytics-metric-card">
          <CardBody>
            <div className="analytics-metric-label">总浏览</div>
            <div className="analytics-metric-value">{summary.viewCount.toLocaleString()}</div>
          </CardBody>
        </Card>
        <Card className="analytics-metric-card">
          <CardBody>
            <div className="analytics-metric-label">添加待办</div>
            <div className="analytics-metric-value">{summary.addToTodoCount.toLocaleString()}</div>
          </CardBody>
        </Card>
        <Card className="analytics-metric-card">
          <CardBody>
            <div className="analytics-metric-label">收藏</div>
            <div className="analytics-metric-value">{summary.favoriteCount.toLocaleString()}</div>
          </CardBody>
        </Card>
      </div>

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            icon="search"
            placeholder="搜索模板或分类…"
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

      <Card>
        <CardHeader title="模板数据" description="点击表头可切换排序" />
        <Table
          columns={columns}
          data={list}
          loading={loading}
          rowKey={(item) => item.id}
          empty={keyword ? '没有符合条件的模板' : '暂无统计数据'}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </Card>
    </>
  );
}
