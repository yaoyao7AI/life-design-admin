import type { IconName } from '../components/ui/Icon';

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon?: IconName;
  placeholder?: boolean; // 占位（Coming Soon）
}

export interface NavGroup {
  key: string;
  label: string;
  icon: IconName;
  children: NavItem[];
}

/**
 * 后台侧边栏导航结构。
 * 单一数据源：Sidebar / Breadcrumb / 路由标题均从这里派生。
 */
export const navGroups: NavGroup[] = [
  {
    key: 'growth',
    label: '成长管理',
    icon: 'sparkles',
    children: [
      { key: 'articles', label: '文章管理', path: '/growth/articles', icon: 'file-text' },
      { key: 'topics', label: '主题管理', path: '/growth/topics', icon: 'layers' },
      { key: 'home', label: '首页配置', path: '/growth/home', icon: 'layout' },
      {
        key: 'courses',
        label: '课程管理',
        path: '/growth/courses',
        icon: 'graduation-cap',
        placeholder: true,
      },
      {
        key: 'analytics',
        label: '数据分析',
        path: '/growth/analytics',
        icon: 'bar-chart',
        placeholder: true,
      },
      {
        key: 'members',
        label: '会员内容',
        path: '/growth/members',
        icon: 'crown',
        placeholder: true,
      },
    ],
  },
];

/** 独立于分组之外的其他模块（如遗留的肯定语后台）。 */
export const standaloneNav: NavItem[] = [
  { key: 'affirmations', label: '肯定语管理', path: '/affirmations', icon: 'inbox' },
];

/** 扁平化所有导航项，便于按 path 反查标题 / 面包屑。 */
export interface FlatNav extends NavItem {
  groupLabel?: string;
}

export const flatNav: FlatNav[] = [
  ...navGroups.flatMap((g) =>
    g.children.map((c) => ({ ...c, groupLabel: g.label }))
  ),
  ...standaloneNav.map((n) => ({ ...n })),
];

export function findNavByPath(pathname: string): FlatNav | undefined {
  return flatNav.find((n) => pathname.startsWith(n.path));
}
