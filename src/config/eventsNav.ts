import type { IconName } from '../components/ui/Icon';

export interface EventsNavItem {
  key: string;
  label: string;
  path: string;
  icon?: IconName;
  /** 开发中：可点击进入占位页 */
  comingSoon?: boolean;
}

export const eventsNavItems: EventsNavItem[] = [
  { key: 'home', label: '运营首页', path: '/events', icon: 'layout' },
  {
    key: 'organizations',
    label: '主办方管理',
    path: '/events/organizations',
    icon: 'crown',
  },
  {
    key: 'activities',
    label: '全部活动',
    path: '/events/activities',
    icon: 'layers',
  },
  {
    key: 'registrations',
    label: '报名管理',
    path: '/events/registrations',
    icon: 'inbox',
  },
  {
    key: 'users',
    label: '用户管理',
    path: '/events/users',
    icon: 'file-text',
    comingSoon: true,
  },
  {
    key: 'finance',
    label: '财务中心',
    path: '/events/finance',
    icon: 'bar-chart',
    comingSoon: true,
  },
  {
    key: 'reviews',
    label: '审核管理',
    path: '/events/reviews',
    icon: 'eye',
    comingSoon: true,
  },
];

export function findEventsNavByPath(pathname: string): EventsNavItem | undefined {
  // 精确优先：/events 本身
  if (pathname === '/events' || pathname === '/events/') {
    return eventsNavItems.find((n) => n.key === 'home');
  }
  return eventsNavItems
    .filter((n) => n.key !== 'home')
    .find((n) => pathname.startsWith(n.path));
}
