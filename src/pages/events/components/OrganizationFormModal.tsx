import { useEffect, useState } from 'react';
import { Button, FormField, Icon, Input, Select } from '../../../components/ui';
import type {
  Organization,
  OrganizationInput,
} from '../../../api/events/organizations';
import { ORG_STATUS_OPTIONS } from '../organizationStatus';

interface OrganizationFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Organization | null;
  onClose: () => void;
  /** 抛错表示保存失败；成功由父组件负责关闭并刷新 */
  onSubmit: (input: OrganizationInput) => Promise<void>;
}

interface FormState {
  name: string;
  status: string;
  address: string;
  admin_name: string;
  admin_phone: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  status: 'pending',
  address: '',
  admin_name: '',
  admin_phone: '',
};

const PHONE_PATTERN = /^1[3-9]\d{9}$/;

export default function OrganizationFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: OrganizationFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name ?? '',
        status: initial.status || 'pending',
        address: initial.address ?? '',
        admin_name: initial.admin_name ?? '',
        admin_phone: initial.admin_phone ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('请填写主办方名称。');
      return;
    }
    if (!form.status) {
      setError('请选择主办方状态。');
      return;
    }
    const phone = form.admin_phone.trim();
    if (phone && !PHONE_PATTERN.test(phone)) {
      setError('手机号格式不正确，请填写 11 位手机号。');
      return;
    }

    const payload: OrganizationInput = {
      name,
      status: form.status,
      address: form.address.trim() || undefined,
      admin_name: form.admin_name.trim() || undefined,
      admin_phone: phone || undefined,
    };

    setSaving(true);
    setError(null);
    try {
      await onSubmit(payload);
      // 成功后父组件会关闭弹窗
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '保存失败，请稍后重试。';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="org-modal">
      <div
        className="org-modal__backdrop"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        className="org-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? '编辑主办方' : '新增主办方'}
      >
        <div className="org-modal__header">
          <h2 className="org-modal__title">
            {mode === 'edit' ? '编辑主办方' : '新增主办方'}
          </h2>
          <button
            type="button"
            className="org-modal__close"
            onClick={onClose}
            disabled={saving}
            aria-label="关闭"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="org-modal__body">
          <FormField label="主办方名称" required>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="例如：测试主办方"
            />
          </FormField>

          <FormField label="状态" required>
            <Select
              options={ORG_STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            />
          </FormField>

          <FormField label="地址">
            <Input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="例如：北京市"
            />
          </FormField>

          <FormField label="管理人">
            <Input
              value={form.admin_name}
              onChange={(e) => update('admin_name', e.target.value)}
              placeholder="例如：张三"
            />
          </FormField>

          <FormField label="手机号">
            <Input
              value={form.admin_phone}
              onChange={(e) => update('admin_phone', e.target.value)}
              placeholder="例如：13800000000"
              inputMode="numeric"
            />
          </FormField>

          {error && <div className="org-modal__error">{error}</div>}
        </div>

        <div className="org-modal__footer">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  );
}
