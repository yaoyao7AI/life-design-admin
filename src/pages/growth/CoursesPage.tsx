import PageHeader from '../../components/layout/PageHeader';
import { Badge, Card, EmptyState } from '../../components/ui';

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        title="课程管理"
        description="管理成长课程内容与上架。"
        actions={<Badge tone="neutral">规划中</Badge>}
      />
      <Card>
        <EmptyState
          icon="graduation-cap"
          title="Coming Soon"
          description="课程管理模块正在规划中，敬请期待。"
        />
      </Card>
    </>
  );
}
