import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/ui';

const quickLinks = [
  { label: '主办方管理', path: '/events/organizations' },
  { label: '全部活动', path: '/events/activities' },
  { label: '报名管理', path: '/events/registrations' },
];

export default function EventsHomePage() {
  return (
    <div className="events-page">
      <Card>
        <CardHeader
          title="探索运营中心"
          description="平台内部活动运营工作台。外部主办方请使用独立主办方后台。"
        />
        <CardBody>
          <p className="events-page__hint">
            V1 为占位首页。活动数据将对接独立活动后端 API，跨后端鉴权方案确认后再接入真实
            CRUD。
          </p>
          <ul className="events-page__links">
            {quickLinks.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
