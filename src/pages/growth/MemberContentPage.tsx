import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  Select,
  Table,
  type Column,
} from '../../components/ui';
import {
  createMembershipPlan,
  createUserMembership,
  getMembershipPlans,
  getUserMemberships,
  updateMembershipPlan,
  updateUserMembership,
  type MembershipPlan,
  type MembershipPlanInput,
  type UserMembership,
  type UserMembershipInput,
} from '../../api/growth/membership';
import './growth.css';

interface PlanForm {
  name: string;
  level: string;
  price: string;
  durationDays: string;
  description: string;
  enabled: boolean;
}

interface UserForm {
  userId: string;
  membershipId: string;
  expiresAt: string;
}

const EMPTY_PLAN_FORM: PlanForm = {
  name: '',
  level: 'vip',
  price: '',
  durationDays: '',
  description: '',
  enabled: true,
};

const EMPTY_USER_FORM: UserForm = {
  userId: '',
  membershipId: '',
  expiresAt: '',
};

const parseError = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。';

const boolFromStatus = (status?: string) => status === 'active' || status === 'enabled';

const normalizePlan = (item: any): MembershipPlan => ({
  id: String(item.id ?? item.planId ?? ''),
  name: item.name ?? item.planName ?? '',
  level: item.level ?? item.code ?? 'vip',
  description: item.description ?? '',
  price: Number(item.price ?? item.amount ?? 0),
  durationDays: Number(item.durationDays ?? item.duration_days ?? item.days ?? 0),
  isActive:
    typeof item.isActive === 'boolean'
      ? item.isActive
      : typeof item.enabled === 'boolean'
      ? item.enabled
      : boolFromStatus(item.status),
  status: item.status,
  createdAt: item.createdAt ?? item.created_at,
  updatedAt: item.updatedAt ?? item.updated_at,
});

const normalizeUserMembership = (item: any): UserMembership => ({
  id: String(item.id ?? item.userMembershipId ?? ''),
  userId: String(item.userId ?? item.uid ?? ''),
  userName: item.userName ?? item.nickname ?? '',
  userEmail: item.userEmail ?? item.email ?? '',
  membershipId: String(item.membershipId ?? item.planId ?? ''),
  membershipLevel: item.membershipLevel ?? item.level ?? '',
  membershipName: item.membershipName ?? item.planName ?? '',
  expiresAt: item.expiresAt ?? item.expiredAt ?? item.expireAt ?? '',
  status: item.status,
  createdAt: item.createdAt ?? item.created_at,
  updatedAt: item.updatedAt ?? item.updated_at,
});

export default function MemberContentPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [users, setUsers] = useState<UserMembership[]>([]);
  const [search, setSearch] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(EMPTY_PLAN_FORM);
  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER_FORM);

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setErrorPlans(null);
    try {
      const list = await getMembershipPlans();
      setPlans(list.map(normalizePlan).filter((item) => item.id));
    } catch (err) {
      setErrorPlans(parseError(err));
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const loadUsers = useCallback(async (keyword?: string) => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const list = await getUserMemberships({ keyword: keyword?.trim() || undefined });
      setUsers(list.map(normalizeUserMembership).filter((item) => item.id));
    } catch (err) {
      setErrorUsers(parseError(err));
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    loadUsers();
  }, [loadPlans, loadUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  const resetPlanForm = () => {
    setPlanForm(EMPTY_PLAN_FORM);
    setEditingPlanId(null);
    setShowPlanForm(false);
  };

  const resetUserForm = () => {
    setUserForm(EMPTY_USER_FORM);
    setEditingUserId(null);
    setShowUserForm(false);
  };

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id,
        label: `${plan.name} (${plan.level})`,
      })),
    [plans]
  );

  const handleSavePlan = async () => {
    if (!planForm.name.trim() || !planForm.level.trim()) {
      setErrorPlans('请填写完整的套餐名称和等级。');
      return;
    }
    setSavingPlan(true);
    setErrorPlans(null);
    const payload: MembershipPlanInput = {
      name: planForm.name.trim(),
      level: planForm.level.trim(),
      description: planForm.description.trim() || undefined,
      price: planForm.price === '' ? undefined : Number(planForm.price),
      durationDays:
        planForm.durationDays === '' ? undefined : Number(planForm.durationDays),
      isActive: planForm.enabled,
      status: planForm.enabled ? 'active' : 'inactive',
    };
    try {
      if (editingPlanId) {
        await updateMembershipPlan(editingPlanId, payload);
      } else {
        await createMembershipPlan(payload);
      }
      resetPlanForm();
      await loadPlans();
    } catch (err) {
      setErrorPlans(parseError(err));
    } finally {
      setSavingPlan(false);
    }
  };

  const handlePlanEdit = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      level: plan.level,
      price: plan.price ? String(plan.price) : '',
      durationDays: plan.durationDays ? String(plan.durationDays) : '',
      description: plan.description ?? '',
      enabled:
        typeof plan.isActive === 'boolean'
          ? plan.isActive
          : boolFromStatus(plan.status),
    });
    setShowPlanForm(true);
  };

  const handlePlanToggle = async (plan: MembershipPlan) => {
    const enabled =
      typeof plan.isActive === 'boolean'
        ? plan.isActive
        : boolFromStatus(plan.status);
    setErrorPlans(null);
    try {
      await updateMembershipPlan(plan.id, {
        name: plan.name,
        level: plan.level,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        isActive: !enabled,
        status: !enabled ? 'active' : 'inactive',
      });
      await loadPlans();
    } catch (err) {
      setErrorPlans(parseError(err));
    }
  };

  const handleSaveUserMembership = async () => {
    if (!userForm.userId.trim() || !userForm.membershipId.trim()) {
      setErrorUsers('请填写用户 ID 并选择会员等级。');
      return;
    }
    setSavingUser(true);
    setErrorUsers(null);
    const selectedPlan = plans.find((plan) => plan.id === userForm.membershipId);
    const payload: UserMembershipInput = {
      userId: userForm.userId.trim(),
      membershipId: userForm.membershipId,
      membershipLevel: selectedPlan?.level,
      expiresAt: userForm.expiresAt || null,
      status: 'active',
    };
    try {
      if (editingUserId) {
        await updateUserMembership(editingUserId, payload);
      } else {
        await createUserMembership(payload);
      }
      resetUserForm();
      await loadUsers(search);
    } catch (err) {
      setErrorUsers(parseError(err));
    } finally {
      setSavingUser(false);
    }
  };

  const handleUserEdit = (item: UserMembership) => {
    setEditingUserId(item.id);
    setUserForm({
      userId: item.userId,
      membershipId: item.membershipId ?? '',
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
    });
    setShowUserForm(true);
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const keyword = search.trim().toLowerCase();
    return users.filter((item) => {
      const text = `${item.userName ?? ''} ${item.userEmail ?? ''} ${item.userId}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [search, users]);

  const planColumns: Column<MembershipPlan>[] = [
    {
      key: 'name',
      header: '套餐名称',
      render: (plan) => <span className="topic-name">{plan.name}</span>,
    },
    {
      key: 'level',
      header: '等级',
      width: '110px',
      render: (plan) => <span className="topic-slug">{plan.level}</span>,
    },
    {
      key: 'price',
      header: '价格',
      width: '120px',
      align: 'right',
      render: (plan) => <span className="metric">¥{(plan.price ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'duration',
      header: '时长(天)',
      width: '100px',
      align: 'right',
      render: (plan) => <span className="metric">{plan.durationDays ?? 0}</span>,
    },
    {
      key: 'status',
      header: '状态',
      width: '120px',
      render: (plan) => {
        const enabled =
          typeof plan.isActive === 'boolean'
            ? plan.isActive
            : boolFromStatus(plan.status);
        return (
          <Badge tone={enabled ? 'success' : 'neutral'}>{enabled ? '已启用' : '已停用'}</Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '操作',
      width: '170px',
      align: 'right',
      render: (plan) => {
        const enabled =
          typeof plan.isActive === 'boolean'
            ? plan.isActive
            : boolFromStatus(plan.status);
        return (
          <div className="row-actions">
            <Button size="sm" variant="ghost" onClick={() => handlePlanEdit(plan)}>
              编辑
            </Button>
            <Button
              size="sm"
              variant={enabled ? 'secondary' : 'primary'}
              onClick={() => handlePlanToggle(plan)}
            >
              {enabled ? '停用' : '启用'}
            </Button>
          </div>
        );
      },
    },
  ];

  const userColumns: Column<UserMembership>[] = [
    {
      key: 'user',
      header: '用户',
      render: (item) => (
        <div>
          <div className="topic-name">{item.userName || item.userId}</div>
          {item.userEmail && <div className="article-cell__en">{item.userEmail}</div>}
        </div>
      ),
    },
    {
      key: 'membership',
      header: '会员等级',
      width: '170px',
      render: (item) => (
        <Badge tone="warning">{item.membershipName || item.membershipLevel || '-'}</Badge>
      ),
    },
    {
      key: 'expiresAt',
      header: '到期时间',
      width: '140px',
      render: (item) => (
        <span className="metric metric--muted">{item.expiresAt?.slice(0, 10) || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '100px',
      align: 'right',
      render: (item) => (
        <Button size="sm" variant="ghost" onClick={() => handleUserEdit(item)}>
          修改
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="会员内容"
        description="管理套餐、用户会员等级与有效期。"
        actions={
          <div className="row-actions">
            <Button variant="secondary" onClick={() => setShowUserForm(true)}>
              <Icon name="plus" size={16} />
              新增用户会员
            </Button>
            <Button variant="primary" onClick={() => setShowPlanForm(true)}>
              <Icon name="plus" size={16} />
              新建套餐
            </Button>
          </div>
        }
      />

      <Card className="topic-form-card">
        <CardHeader title="会员套餐" description="新建、编辑并启用/禁用套餐" />
        <CardBody>
          {(showPlanForm || plans.length === 0) && (
            <div className="topic-form">
              <div className="topic-form__row">
                <label className="topic-form__label">套餐名称</label>
                <Input
                  value={planForm.name}
                  placeholder="例如：创始会员"
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">等级标识</label>
                <Input
                  value={planForm.level}
                  placeholder="例如：vip"
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, level: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">价格</label>
                <Input
                  type="number"
                  min={0}
                  value={planForm.price}
                  placeholder="0"
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">时长(天)</label>
                <Input
                  type="number"
                  min={0}
                  value={planForm.durationDays}
                  placeholder="365"
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, durationDays: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">描述</label>
                <Input
                  value={planForm.description}
                  placeholder="套餐说明（可选）"
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__actions">
                <Button
                  variant={planForm.enabled ? 'primary' : 'secondary'}
                  onClick={() =>
                    setPlanForm((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                >
                  {planForm.enabled ? '启用中' : '已停用'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                >
                  {savingPlan ? '保存中...' : editingPlanId ? '更新套餐' : '创建套餐'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetPlanForm}
                  disabled={savingPlan}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {errorPlans && (
            <div className="topic-error" style={{ margin: '0 0 var(--space-3)' }}>
              <span>{errorPlans}</span>
              <Button size="sm" variant="ghost" onClick={loadPlans}>
                重试
              </Button>
            </div>
          )}

          {!loadingPlans && plans.length === 0 ? (
            <EmptyState
              icon="crown"
              title="暂无套餐"
              description="请先创建会员套餐。"
              action={
                <Button variant="primary" onClick={() => setShowPlanForm(true)}>
                  新建套餐
                </Button>
              }
            />
          ) : (
            <Table
              columns={planColumns}
              data={plans}
              rowKey={(plan) => plan.id}
              loading={loadingPlans}
              empty="暂无套餐"
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="用户会员管理" description="搜索用户并修改会员等级与到期时间" />
        <CardBody>
          <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="filter-bar__search">
              <Input
                icon="search"
                value={search}
                placeholder="搜索用户昵称 / 邮箱 / 用户ID"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-bar__spacer" />
            <Button variant="secondary" onClick={() => setShowUserForm(true)}>
              <Icon name="plus" size={16} />
              新增/修改用户会员
            </Button>
          </div>

          {(showUserForm || users.length === 0) && (
            <div className="topic-form" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="topic-form__row">
                <label className="topic-form__label">用户 ID</label>
                <Input
                  value={userForm.userId}
                  placeholder="输入用户ID"
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, userId: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">会员套餐</label>
                <Select
                  options={planOptions}
                  placeholder="选择会员套餐"
                  value={userForm.membershipId}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, membershipId: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">到期时间</label>
                <Input
                  type="date"
                  value={userForm.expiresAt}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__actions">
                <Button
                  variant="primary"
                  onClick={handleSaveUserMembership}
                  disabled={savingUser}
                >
                  {savingUser ? '保存中...' : editingUserId ? '更新用户会员' : '创建用户会员'}
                </Button>
                <Button variant="ghost" onClick={resetUserForm} disabled={savingUser}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {errorUsers && (
            <div className="topic-error" style={{ margin: '0 0 var(--space-3)' }}>
              <span>{errorUsers}</span>
              <Button size="sm" variant="ghost" onClick={() => loadUsers(search)}>
                重试
              </Button>
            </div>
          )}

          {!loadingUsers && filteredUsers.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="暂无用户会员数据"
              description="当前搜索条件下没有结果。"
            />
          ) : (
            <Table
              columns={userColumns}
              data={filteredUsers}
              rowKey={(item) => item.id}
              loading={loadingUsers}
              empty="暂无用户会员"
            />
          )}
        </CardBody>
      </Card>
    </>
  );
}
