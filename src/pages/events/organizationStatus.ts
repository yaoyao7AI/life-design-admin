import type { SelectOption } from '../../components/ui';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

/** 主办方状态映射：pending→待审核 approved→已认证 expired→已过期 disabled→已禁用 */
export const ORG_STATUS_META: Record<string, StatusMeta> = {
  pending: { label: '待审核', tone: 'warning' },
  approved: { label: '已认证', tone: 'success' },
  expired: { label: '已过期', tone: 'neutral' },
  disabled: { label: '已禁用', tone: 'danger' },
};

export function getStatusMeta(status: string): StatusMeta {
  return ORG_STATUS_META[status] ?? { label: status || '-', tone: 'neutral' };
}

/** 表单可选状态 */
export const ORG_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已认证' },
  { value: 'expired', label: '已过期' },
  { value: 'disabled', label: '已禁用' },
];

/** 筛选状态（含全部） */
export const ORG_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: '全部状态' },
  ...ORG_STATUS_OPTIONS,
];
