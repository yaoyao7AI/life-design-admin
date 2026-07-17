import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui';

interface PlaceholderProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function EventsPlaceholderPage({
  title,
  description,
  comingSoon,
}: PlaceholderProps) {
  return (
    <div className="events-page">
      <Card>
        <CardHeader title={title} description={description} />
        <CardBody>
          {comingSoon ? (
            <EmptyState title="开发中" description="该模块将在后续版本开放。" />
          ) : (
            <EmptyState
              title="暂无数据"
              description="等待活动后端 API 与跨后端鉴权方案确认后接入。"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
