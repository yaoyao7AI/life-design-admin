import { useCallback, useEffect, useState } from 'react';
import { Button, Card, EmptyState, Icon, Pagination } from '../../components/ui';
import { ApiClientError } from '../../api/errors';
import { useEventsAuth } from '../../events-auth/useEventsAuth';
import { EVENTS_PERMISSIONS } from '../../events-auth/types';
import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
  type OrganizationInput,
} from '../../api/events/organizations';
import OrganizationFilters from './components/OrganizationFilters';
import OrganizationTable from './components/OrganizationTable';
import OrganizationFormModal from './components/OrganizationFormModal';

const PAGE_SIZE = 10;

interface AppliedQuery {
  keyword: string;
  status: string;
}

function deleteErrorMessage(status: number): string {
  if (status === 409) return '该主办方存在关联数据，暂时不能删除。';
  if (status === 403) return '当前账号没有该操作权限。';
  if (status === 500) return '操作失败，请稍后重试。';
  return '操作失败，请稍后重试。';
}

export default function OrganizationsPage() {
  const { hasEventsPermission } = useEventsAuth();
  const canRead = hasEventsPermission(EVENTS_PERMISSIONS.ORGANIZATIONS_READ);
  const canWrite = hasEventsPermission(EVENTS_PERMISSIONS.ORGANIZATIONS_WRITE);

  const [keywordInput, setKeywordInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [applied, setApplied] = useState<AppliedQuery>({ keyword: '', status: '' });
  const [page, setPage] = useState(1);

  const [list, setList] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getOrganizations({
        page,
        pageSize: PAGE_SIZE,
        keyword: applied.keyword || undefined,
        status: applied.status || undefined,
      });
      setList(result.list);
      setTotal(result.total);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : '加载主办方列表失败，请稍后重试。';
      setError(message);
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [canRead, page, applied]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = () => {
    setActionNotice(null);
    setApplied({ keyword: keywordInput.trim(), status: statusInput });
    setPage(1);
  };

  const handleReset = () => {
    setActionNotice(null);
    setKeywordInput('');
    setStatusInput('');
    setApplied({ keyword: '', status: '' });
    setPage(1);
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditing(org);
    setModalOpen(true);
  };

  const handleSubmit = async (input: OrganizationInput) => {
    if (editing) {
      await updateOrganization(editing.id, input);
    } else {
      await createOrganization(input);
    }
    setModalOpen(false);
    setEditing(null);
    setActionNotice(editing ? '主办方已更新。' : '主办方已创建。');
    // 新增后回到第一页确保能看到最新数据
    if (!editing && page !== 1) {
      setPage(1);
    } else {
      await load();
    }
  };

  const handleDelete = async (org: Organization) => {
    const confirmed = window.confirm('确认删除该主办方吗？删除后无法恢复。');
    if (!confirmed) return;
    setActionNotice(null);
    setError(null);
    try {
      await deleteOrganization(org.id);
      setActionNotice('主办方已删除。');
      // 删除后当前页无数据且 page>1 时回到上一页
      if (list.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
    } catch (err) {
      const status = err instanceof ApiClientError ? err.status : 0;
      setError(deleteErrorMessage(status));
    }
  };

  if (!canRead) {
    return (
      <div className="events-page">
        <Card>
          <EmptyState
            icon="eye"
            title="暂无主办方查看权限"
            description="当前账号未获得主办方读取权限，请联系管理员开通。"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="org-page__head">
        <div>
          <h1 className="org-page__title">主办方管理</h1>
          <p className="org-page__desc">管理平台主办方账号、状态与联系人信息。</p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={handleCreate}>
            <Icon name="plus" size={16} />
            新增主办方
          </Button>
        )}
      </div>

      <Card className="org-card">
        <div className="org-card__toolbar">
          <OrganizationFilters
            keyword={keywordInput}
            status={statusInput}
            loading={loading}
            onKeywordChange={setKeywordInput}
            onStatusChange={setStatusInput}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </div>

        {actionNotice && <div className="org-notice org-notice--ok">{actionNotice}</div>}
        {error && (
          <div className="org-notice org-notice--error">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={() => void load()}>
              重试
            </Button>
          </div>
        )}

        <OrganizationTable
          data={list}
          loading={loading}
          canWrite={canWrite}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {total > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={(next) => setPage(next)}
          />
        )}
      </Card>

      <OrganizationFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
