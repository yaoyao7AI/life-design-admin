import { useMemo } from 'react';
import { Badge, Icon, Table, type Column } from '../../../components/ui';
import type { Organization } from '../../../api/events/organizations';
import { getStatusMeta } from '../organizationStatus';

interface OrganizationTableProps {
  data: Organization[];
  loading?: boolean;
  canWrite?: boolean;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 19).replace('T', ' ');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function OrganizationTable({
  data,
  loading,
  canWrite,
  onEdit,
  onDelete,
}: OrganizationTableProps) {
  const columns = useMemo<Column<Organization>[]>(() => {
    const base: Column<Organization>[] = [
      {
        key: 'name',
        header: '主办方名称',
        render: (org) => <span className="org-cell__name">{org.name || '-'}</span>,
      },
      {
        key: 'status',
        header: '状态',
        width: '110px',
        render: (org) => {
          const meta = getStatusMeta(org.status);
          return <Badge tone={meta.tone}>{meta.label}</Badge>;
        },
      },
      {
        key: 'address',
        header: '地址',
        render: (org) => (
          <span className="org-cell__muted">{org.address || '-'}</span>
        ),
      },
      {
        key: 'admin_name',
        header: '管理人',
        width: '120px',
        render: (org) => <span>{org.admin_name || '-'}</span>,
      },
      {
        key: 'admin_phone',
        header: '手机号',
        width: '140px',
        render: (org) => (
          <span className="org-cell__muted">{org.admin_phone || '-'}</span>
        ),
      },
      {
        key: 'created_at',
        header: '创建时间',
        width: '160px',
        render: (org) => (
          <span className="org-cell__muted">{formatDateTime(org.created_at)}</span>
        ),
      },
    ];

    if (canWrite) {
      base.push({
        key: 'actions',
        header: '操作',
        width: '120px',
        align: 'right',
        render: (org) => (
          <div className="org-row-actions">
            <button
              type="button"
              className="org-row-action"
              title="编辑"
              onClick={() => onEdit(org)}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              type="button"
              className="org-row-action org-row-action--danger"
              title="删除"
              onClick={() => onDelete(org)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ),
      });
    }

    return base;
  }, [canWrite, onEdit, onDelete]);

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      rowKey={(org) => String(org.id)}
      empty="暂无主办方数据"
    />
  );
}
