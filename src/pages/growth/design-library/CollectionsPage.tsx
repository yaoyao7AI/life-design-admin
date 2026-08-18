import PageHeader from '../../../components/layout/PageHeader';
import { Badge, Card, EmptyState } from '../../../components/ui';

export default function DesignLibraryCollectionsPage() {
  return (
    <>
      <PageHeader
        title="专题合集"
        description="将多套模板打包成专题，供后续运营配置。"
        actions={<Badge tone="neutral">规划中</Badge>}
      />
      <Card>
        <EmptyState
          icon="inbox"
          title="Coming Soon"
          description="专题合集将在后续版本开放，用于打包推荐模板。"
        />
      </Card>
    </>
  );
}
