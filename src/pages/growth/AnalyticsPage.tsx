import PageHeader from '../../components/layout/PageHeader';
import { Badge, Card, EmptyState } from '../../components/ui';

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="数据分析"
        description="查看内容浏览、点赞与转化等核心指标。"
        actions={<Badge tone="neutral">规划中</Badge>}
      />
      <Card>
        <EmptyState
          icon="bar-chart"
          title="Coming Soon"
          description="数据分析模块正在规划中，敬请期待。"
        />
      </Card>
    </>
  );
}
