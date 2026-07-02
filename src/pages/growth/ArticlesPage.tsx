import PageHeader from '../../components/layout/PageHeader';
import { Button, Card, EmptyState, Icon } from '../../components/ui';

export default function ArticlesPage() {
  return (
    <>
      <PageHeader
        title="文章管理"
        description="管理成长模块的所有文章内容、分类与发布状态。"
        actions={
          <Button variant="primary">
            <Icon name="plus" size={16} />
            新建文章
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon="file-text"
          title="文章列表即将上线"
          description="Task A2 将在此接入文章筛选与列表表格。当前为框架占位（Coming Soon）。"
        />
      </Card>
    </>
  );
}
