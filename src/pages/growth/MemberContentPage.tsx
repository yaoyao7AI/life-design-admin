import PageHeader from '../../components/layout/PageHeader';
import { Badge, Card, EmptyState } from '../../components/ui';

export default function MemberContentPage() {
  return (
    <>
      <PageHeader
        title="会员内容"
        description="管理创始会员专属内容与权益。"
        actions={<Badge tone="neutral">规划中</Badge>}
      />
      <Card>
        <EmptyState
          icon="crown"
          title="Coming Soon"
          description="会员内容模块正在规划中，敬请期待。"
        />
      </Card>
    </>
  );
}
