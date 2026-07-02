import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Icon,
  Table,
  type Column,
} from '../../components/ui';
import {
  getGrowthAnalyticsDashboard,
  type AnalyticsDashboardData,
  type AnalyticsSummary,
  type AnalyticsTopArticle,
  type AnalyticsTrendPoint,
} from '../../api/growth/analytics';
import './growth.css';

const DEFAULT_SUMMARY: AnalyticsSummary = {
  article: {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    memberArticles: 0,
  },
  reading: {
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
  },
  interaction: {
    likes: 0,
    favorites: 0,
    shares: 0,
  },
  membership: {
    freeUsers: 0,
    founderMembers: 0,
    newMembersThisMonth: 0,
  },
};

const parseError = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。';

const toNum = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : Number(value ?? 0) || 0;

const normalizeSummary = (raw: any): AnalyticsSummary => ({
  article: {
    totalArticles: toNum(raw?.article?.totalArticles ?? raw?.article?.total_articles),
    publishedArticles: toNum(
      raw?.article?.publishedArticles ?? raw?.article?.published_articles
    ),
    draftArticles: toNum(raw?.article?.draftArticles ?? raw?.article?.draft_articles),
    memberArticles: toNum(raw?.article?.memberArticles ?? raw?.article?.member_articles),
  },
  reading: {
    totalViews: toNum(raw?.reading?.totalViews ?? raw?.reading?.total_views),
    todayViews: toNum(raw?.reading?.todayViews ?? raw?.reading?.today_views),
    weekViews: toNum(raw?.reading?.weekViews ?? raw?.reading?.week_views),
    monthViews: toNum(raw?.reading?.monthViews ?? raw?.reading?.month_views),
  },
  interaction: {
    likes: toNum(raw?.interaction?.likes),
    favorites: toNum(raw?.interaction?.favorites),
    shares: toNum(raw?.interaction?.shares),
  },
  membership: {
    freeUsers: toNum(raw?.membership?.freeUsers ?? raw?.membership?.free_users),
    founderMembers: toNum(
      raw?.membership?.founderMembers ?? raw?.membership?.founder_members
    ),
    newMembersThisMonth: toNum(
      raw?.membership?.newMembersThisMonth ?? raw?.membership?.new_members_this_month
    ),
  },
});

const normalizeTopArticle = (item: any): AnalyticsTopArticle => ({
  id: String(item.id ?? ''),
  title: item.title ?? '',
  cover: item.cover ?? item.coverUrl ?? item.cover_url ?? '',
  views: toNum(item.views),
  likes: toNum(item.likes),
  shares: toNum(item.shares),
  publishedAt: item.publishedAt ?? item.published_at ?? '',
});

const normalizeTrend = (item: any): AnalyticsTrendPoint => ({
  date: item.date ?? '',
  views: toNum(item.views),
  newMembers: toNum(item.newMembers ?? item.new_members),
  publishedArticles: toNum(item.publishedArticles ?? item.published_articles),
});

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>(DEFAULT_SUMMARY);
  const [topArticles, setTopArticles] = useState<AnalyticsTopArticle[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: AnalyticsDashboardData = await getGrowthAnalyticsDashboard();
      setSummary(normalizeSummary(data.summary ?? DEFAULT_SUMMARY));
      setTopArticles((data.topArticles ?? []).map(normalizeTopArticle).filter((a) => a.id));
      setTrends((data.trends ?? []).map(normalizeTrend).filter((t) => t.date));
    } catch (err) {
      setError(parseError(err));
      setSummary(DEFAULT_SUMMARY);
      setTopArticles([]);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const articleCards = [
    { label: '总文章数', value: summary.article.totalArticles },
    { label: '已发布', value: summary.article.publishedArticles },
    { label: '草稿', value: summary.article.draftArticles },
    { label: '会员文章', value: summary.article.memberArticles },
  ];

  const readingCards = [
    { label: '总浏览量', value: summary.reading.totalViews },
    { label: '今日浏览量', value: summary.reading.todayViews },
    { label: '本周浏览量', value: summary.reading.weekViews },
    { label: '本月浏览量', value: summary.reading.monthViews },
  ];

  const interactionCards = [
    { label: '点赞数', value: summary.interaction.likes },
    { label: '收藏数', value: summary.interaction.favorites },
    { label: '分享数', value: summary.interaction.shares },
  ];

  const membershipCards = [
    { label: '免费用户', value: summary.membership.freeUsers },
    { label: '创始会员', value: summary.membership.founderMembers },
    { label: '本月新增会员', value: summary.membership.newMembersThisMonth },
  ];

  const columns: Column<AnalyticsTopArticle>[] = [
    {
      key: 'title',
      header: '文章',
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
            <div className="article-cell__title">{a.title || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'views',
      header: '浏览量',
      width: '110px',
      align: 'right',
      render: (a) => <span className="metric">{a.views.toLocaleString()}</span>,
    },
    {
      key: 'likes',
      header: '点赞',
      width: '90px',
      align: 'right',
      render: (a) => <span className="metric">{a.likes.toLocaleString()}</span>,
    },
    {
      key: 'shares',
      header: '分享',
      width: '90px',
      align: 'right',
      render: (a) => <span className="metric">{a.shares.toLocaleString()}</span>,
    },
    {
      key: 'publishedAt',
      header: '发布时间',
      width: '130px',
      render: (a) => (
        <span className="metric metric--muted">{a.publishedAt?.slice(0, 10) || '-'}</span>
      ),
    },
  ];

  const hasData = useMemo(() => {
    const metricTotal =
      Object.values(summary.article).reduce((sum, v) => sum + v, 0) +
      Object.values(summary.reading).reduce((sum, v) => sum + v, 0) +
      Object.values(summary.interaction).reduce((sum, v) => sum + v, 0) +
      Object.values(summary.membership).reduce((sum, v) => sum + v, 0);
    return metricTotal > 0 || topArticles.length > 0 || trends.length > 0;
  }, [summary, topArticles.length, trends.length]);

  if (loading) {
    return (
      <Card>
        <EmptyState icon="bar-chart" title="加载中…" description="正在获取分析数据。" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          icon="inbox"
          title="加载失败"
          description={error}
          action={
            <Button variant="ghost" onClick={load}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <EmptyState
          icon="bar-chart"
          title="暂无分析数据"
          description="当前还没有可展示的统计信息。"
          action={
            <Button variant="ghost" onClick={load}>
              刷新
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="数据分析"
        description="查看内容浏览、互动、会员与趋势等核心指标。"
        actions={<Badge tone="success">Analytics</Badge>}
      />

      <section className="analytics-block">
        <h3 className="analytics-title">文章数据</h3>
        <div className="analytics-cards analytics-cards--4">
          {articleCards.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section className="analytics-block">
        <h3 className="analytics-title">阅读数据</h3>
        <div className="analytics-cards analytics-cards--4">
          {readingCards.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section className="analytics-block">
        <h3 className="analytics-title">互动数据</h3>
        <div className="analytics-cards analytics-cards--3">
          {interactionCards.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <Card className="analytics-block">
        <CardHeader title="热门文章排行榜" description="按综合热度展示热门文章" />
        <CardBody>
          <Table
            columns={columns}
            data={topArticles}
            rowKey={(item) => item.id}
            empty="暂无热门文章数据"
          />
        </CardBody>
      </Card>

      <section className="analytics-block">
        <h3 className="analytics-title">会员数据</h3>
        <div className="analytics-cards analytics-cards--3">
          {membershipCards.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <Card className="analytics-block">
        <CardHeader title="最近 7 天趋势" description="浏览量、会员新增、文章发布趋势" />
        <CardBody>
          {trends.length === 0 ? (
            <EmptyState icon="bar-chart" title="暂无趋势数据" description="请稍后再试。" />
          ) : (
            <SimpleLineChart data={trends} />
          )}
        </CardBody>
      </Card>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="analytics-metric-card">
      <CardBody>
        <div className="analytics-metric-label">{label}</div>
        <div className="analytics-metric-value">{value.toLocaleString()}</div>
      </CardBody>
    </Card>
  );
}

function SimpleLineChart({ data }: { data: AnalyticsTrendPoint[] }) {
  const width = 760;
  const height = 260;
  const padding = { top: 18, right: 18, bottom: 34, left: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const max = Math.max(
    1,
    ...data.map((d) => Math.max(d.views, d.newMembers, d.publishedArticles))
  );

  const toX = (index: number) =>
    padding.left + (chartWidth * index) / Math.max(1, data.length - 1);
  const toY = (value: number) => padding.top + chartHeight - (value / max) * chartHeight;

  const mkPath = (selector: (p: AnalyticsTrendPoint) => number) =>
    data
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(selector(p))}`)
      .join(' ');

  const viewsPath = mkPath((p) => p.views);
  const membersPath = mkPath((p) => p.newMembers);
  const articlesPath = mkPath((p) => p.publishedArticles);

  return (
    <div className="analytics-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="analytics-chart__svg">
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className="analytics-chart__axis"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className="analytics-chart__axis"
        />

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - chartHeight * ratio;
          return (
            <line
              key={ratio}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              className="analytics-chart__grid"
            />
          );
        })}

        <path d={viewsPath} className="analytics-chart__line analytics-chart__line--views" />
        <path
          d={membersPath}
          className="analytics-chart__line analytics-chart__line--members"
        />
        <path
          d={articlesPath}
          className="analytics-chart__line analytics-chart__line--articles"
        />

        {data.map((point, index) => (
          <text
            key={point.date}
            x={toX(index)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className="analytics-chart__label"
          >
            {point.date.slice(5)}
          </text>
        ))}
      </svg>
      <div className="analytics-legend">
        <span><i className="dot dot--views" /> 浏览量</span>
        <span><i className="dot dot--members" /> 会员新增</span>
        <span><i className="dot dot--articles" /> 文章发布</span>
      </div>
    </div>
  );
}
