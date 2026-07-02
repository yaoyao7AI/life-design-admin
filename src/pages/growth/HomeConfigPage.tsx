import PageHeader from '../../components/layout/PageHeader';
import { Card, EmptyState } from '../../components/ui';

export default function HomeConfigPage() {
  return (
    <>
      <PageHeader
        title="首页配置"
        description="配置成长首页的 Banner、Most Popular、最新资讯与课程推荐。"
      />
      <Card>
        <EmptyState
          icon="layout"
          title="首页配置即将上线"
          description="Task A5 将在此以卡片式管理首页各区块。当前为框架占位（Coming Soon）。"
        />
      </Card>
    </>
  );
}
