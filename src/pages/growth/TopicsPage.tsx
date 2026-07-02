import PageHeader from '../../components/layout/PageHeader';
import { Button, Card, EmptyState, Icon } from '../../components/ui';

export default function TopicsPage() {
  return (
    <>
      <PageHeader
        title="主题管理"
        description="管理内容主题（财富 / AI / 成长 / 人生设计）及排序。"
        actions={
          <Button variant="primary">
            <Icon name="plus" size={16} />
            新建主题
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon="layers"
          title="主题列表即将上线"
          description="Task A4 将在此接入主题表格与增删改。当前为框架占位（Coming Soon）。"
        />
      </Card>
    </>
  );
}
