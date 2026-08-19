import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  FormField,
  Icon,
  ImageUpload,
  MultiImageUpload,
  Input,
  Segmented,
  Select,
  Textarea,
} from '../../../components/ui';
import {
  createLibraryTemplate,
  deleteLibraryTemplate,
  getActiveLibraryTags,
  getLibraryCategories,
  getLibraryTemplate,
  parseApiError,
  updateLibraryTemplate,
} from '../../../api/design-library';
import {
  DIFFICULTY_OPTIONS,
  type LibraryCategory,
  type LibraryStatus,
  type LibraryTag,
  type TemplateInput,
} from '../../../types/design-library';
import '../growth.css';
import '../editor.css';
import './design-library.css';

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  images: string[];
  content: string;
  steps: string[];
  categoryId: string;
  tags: string[];
  duration: string;
  difficulty: string;
  isRecommend: boolean;
  sort: string;
  status: LibraryStatus;
}

const emptyForm = (): FormState => ({
  title: '',
  subtitle: '',
  description: '',
  cover: '',
  images: [],
  content: '',
  steps: ['', '', ''],
  categoryId: '',
  tags: [],
  duration: '5',
  difficulty: '简单',
  isRecommend: false,
  sort: '',
  status: 'inactive',
});

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [tags, setTags] = useState<LibraryTag[]>([]);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item.id, label: item.name })),
    [categories]
  );

  const tagNames = useMemo(() => {
    const names = tags.map((item) => item.name);
    return Array.from(new Set([...names, ...form.tags]));
  }, [tags, form.tags]);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadMeta = useCallback(async () => {
    const [categoryRes, tagList] = await Promise.all([
      getLibraryCategories({ page: 1, pageSize: 100, sortBy: 'sort', order: 'asc' }),
      getActiveLibraryTags().catch(() => []),
    ]);
    setCategories(categoryRes.list);
    setTags(tagList);
    return categoryRes.list;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await loadMeta();
        if (!alive) return;
        if (!isEdit) {
          setForm((prev) => ({
            ...prev,
            categoryId: prev.categoryId || cats[0]?.id || '',
          }));
          setLoading(false);
          return;
        }
        const detail = await getLibraryTemplate(id as string);
        if (!alive) return;
        setForm({
          title: detail.title,
          subtitle: detail.subtitle,
          description: detail.description,
          cover: detail.cover,
          images: detail.images ?? [],
          content: detail.content,
          steps: detail.steps.length ? detail.steps : [''],
          categoryId: detail.categoryId || cats[0]?.id || '',
          tags: detail.tags,
          duration: detail.duration == null ? '' : String(detail.duration),
          difficulty: detail.difficulty || '简单',
          isRecommend: detail.isRecommend,
          sort: String(detail.sort ?? ''),
          status: detail.status,
        });
      } catch (err) {
        if (!alive) return;
        const message = parseApiError(err);
        if (message.includes('不存在') || /404/.test(message)) {
          setNotFound(true);
        } else {
          setLoadError(message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isEdit, loadMeta]);

  const buildPayload = (): TemplateInput | null => {
    const title = form.title.trim();
    if (!title) {
      setActionError('请填写模板标题。');
      return null;
    }
    if (!form.categoryId) {
      setActionError('请选择分类。');
      return null;
    }
    const durationRaw = form.duration.trim();
    const duration = durationRaw === '' ? null : Number(durationRaw);
    if (durationRaw !== '' && (!Number.isFinite(duration) || Number(duration) < 0)) {
      setActionError('时长必须是非负数字（分钟）。');
      return null;
    }
    const sortRaw = form.sort.trim();
    const sort = sortRaw === '' ? undefined : Number(sortRaw);
    if (sortRaw !== '' && !Number.isFinite(sort)) {
      setActionError('排序必须是数字。');
      return null;
    }
    return {
      categoryId: form.categoryId,
      title,
      subtitle: form.subtitle.trim(),
      cover: form.cover.trim(),
      images: form.images,
      description: form.description.trim(),
      content: form.content.trim(),
      steps: form.steps.map((step) => step.trim()).filter(Boolean),
      duration,
      difficulty: form.difficulty,
      tags: form.tags,
      status: form.status,
      isRecommend: form.isRecommend,
      sort,
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    setActionError(null);
    try {
      const saved = isEdit && id
        ? await updateLibraryTemplate(id, payload)
        : await createLibraryTemplate(payload);
      if (payload.images.length > 0 && saved.images.length === 0) {
        setActionError('内容图片未保存成功，请确认图片已上传完成后再保存。');
        if (!isEdit) {
          navigate(`/growth/design-library/templates/${saved.id}/edit`, { replace: true });
        }
        return;
      }
      if (isEdit) {
        navigate('/growth/design-library/templates');
        return;
      }
      navigate(`/growth/design-library/templates/${saved.id}/edit`, { replace: true });
    } catch (err) {
      setActionError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm(`确定删除模板「${form.title || '未命名'}」吗？此操作为逻辑删除。`)) return;
    setRemoving(true);
    setActionError(null);
    try {
      await deleteLibraryTemplate(id);
      navigate('/growth/design-library/templates');
    } catch (err) {
      setActionError(parseApiError(err));
    } finally {
      setRemoving(false);
    }
  };

  const updateStep = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.steps];
      next[index] = value;
      return { ...prev, steps: next };
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const swap = direction === 'up' ? index - 1 : index + 1;
      if (swap < 0 || swap >= prev.steps.length) return prev;
      const next = [...prev.steps];
      [next[index], next[swap]] = [next[swap], next[index]];
      return { ...prev, steps: next };
    });
  };

  if (notFound) {
    return (
      <EmptyState
        icon="file-text"
        title="模板不存在"
        description="该模板可能已被删除。"
        action={
          <Button variant="secondary" onClick={() => navigate('/growth/design-library/templates')}>
            返回列表
          </Button>
        }
      />
    );
  }

  if (loading) {
    return <div className="topic-error">加载中…</div>;
  }

  if (loadError) {
    return (
      <EmptyState
        icon="file-text"
        title="加载失败"
        description={loadError}
        action={
          <Button variant="secondary" onClick={() => window.location.reload()}>
            重试
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="editor-toolbar">
        <Button variant="ghost" onClick={() => navigate('/growth/design-library/templates')}>
          ← 返回
        </Button>
        <div className="editor-toolbar__title">{isEdit ? '编辑模板' : '新增模板'}</div>
        <div className="editor-toolbar__spacer" />
        <div className="editor-toolbar__actions">
          {isEdit && (
            <Button variant="danger" onClick={() => void handleDelete()} disabled={removing || saving}>
              {removing ? '删除中...' : '删除'}
            </Button>
          )}
          <Button variant="primary" onClick={() => void handleSave()} disabled={saving || removing}>
            {saving ? '保存中...' : isEdit ? '保存' : '创建并继续'}
          </Button>
        </div>
      </div>

      {actionError && (
        <Card className="topic-error-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="topic-error">
            <span>{actionError}</span>
          </div>
        </Card>
      )}

      <div className="editor-grid">
        <div className="editor-main">
          <Card>
            <CardHeader title="内容编辑" description="标题、简介、封面、内容图片、步骤与正文" />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <FormField label="模板标题" required>
                  <Input
                    value={form.title}
                    onChange={(e) => patch('title', e.target.value)}
                    placeholder="例如：清空脑袋笔记"
                  />
                </FormField>
                <FormField label="模板简介">
                  <Textarea
                    value={form.description}
                    onChange={(e) => patch('description', e.target.value)}
                    placeholder="用于用户端卡片与详情页介绍"
                    rows={3}
                  />
                </FormField>
                <FormField label="副标题" hint="可选，展示在标题下方">
                  <Input
                    value={form.subtitle}
                    onChange={(e) => patch('subtitle', e.target.value)}
                    placeholder="例如：来自 GTD 收集清单"
                  />
                </FormField>
                <FormField
                  label="封面图"
                  hint="仅 1 张，用于列表卡片、详情封面与分享。建议 16:9，PNG / JPG"
                >
                  <ImageUpload value={form.cover} onChange={(url) => patch('cover', url)} />
                </FormField>
                <FormField
                  label="内容图片上传（最多15张）"
                  hint="最多上传 15 张图片，图片顺序将同步到用户端模板详情页。可拖拽调整顺序。"
                >
                  <MultiImageUpload
                    value={form.images}
                    onChange={(urls) => patch('images', urls)}
                    max={15}
                  />
                </FormField>
                <FormField label="执行步骤" hint="支持动态增加，对应详情页步骤清单">
                  <div className="dl-steps">
                    {form.steps.map((step, index) => (
                      <div className="dl-step" key={`step-${index}`}>
                        <span className="dl-step__index">{index + 1}</span>
                        <div className="dl-step__input">
                          <Input
                            value={step}
                            onChange={(e) => updateStep(index, e.target.value)}
                            placeholder={
                              index === 0
                                ? '今天完成'
                                : index === 1
                                  ? '明天重要'
                                  : index === 2
                                    ? '我的担忧'
                                    : '输入步骤内容'
                            }
                          />
                        </div>
                        <div className="dl-step__ops">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === 0}
                            onClick={() => moveStep(index, 'up')}
                          >
                            上移
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === form.steps.length - 1}
                            onClick={() => moveStep(index, 'down')}
                          >
                            下移
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={form.steps.length <= 1}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                steps: prev.steps.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      onClick={() => setForm((prev) => ({ ...prev, steps: [...prev.steps, ''] }))}
                    >
                      <Icon name="plus" size={16} />
                      新增步骤
                    </Button>
                  </div>
                </FormField>
                <FormField label="填写模板内容" hint="可选，作为补充说明或引导文案">
                  <Textarea
                    value={form.content}
                    onChange={(e) => patch('content', e.target.value)}
                    placeholder="填写模板正文、引导语或注意事项"
                    rows={8}
                  />
                </FormField>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="editor-side">
          <Card>
            <CardHeader title="模板配置" description="分类、标签、时长与上架状态" />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <FormField label="分类" required>
                  <Select
                    options={categoryOptions}
                    placeholder="选择分类"
                    value={form.categoryId}
                    onChange={(e) => patch('categoryId', e.target.value)}
                  />
                </FormField>
                <FormField label="标签" hint="可多选，来自标签管理">
                  <div className="dl-tag-picker">
                    {tagNames.length === 0 ? (
                      <span className="metric metric--muted">暂无标签，请先在标签管理中新增</span>
                    ) : (
                      tagNames.map((tag) => {
                        const active = form.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`dl-tag-chip ${active ? 'dl-tag-chip--active' : ''}`}
                            onClick={() =>
                              patch(
                                'tags',
                                active
                                  ? form.tags.filter((item) => item !== tag)
                                  : [...form.tags, tag]
                              )
                            }
                          >
                            {tag}
                          </button>
                        );
                      })
                    )}
                  </div>
                </FormField>
                <FormField label="时长" hint="分钟">
                  <Input
                    type="number"
                    min={0}
                    value={form.duration}
                    onChange={(e) => patch('duration', e.target.value)}
                    placeholder="例如：5"
                  />
                </FormField>
                <FormField label="难度">
                  <Select
                    options={DIFFICULTY_OPTIONS}
                    value={form.difficulty}
                    onChange={(e) => patch('difficulty', e.target.value)}
                  />
                </FormField>
                <FormField label="推荐">
                  <Segmented
                    options={[
                      { value: '0', label: '否' },
                      { value: '1', label: '是' },
                    ]}
                    value={form.isRecommend ? '1' : '0'}
                    onChange={(value) => patch('isRecommend', value === '1')}
                  />
                </FormField>
                <FormField label="排序" hint="数字越小越靠前，留空则自动排到末尾">
                  <Input
                    type="number"
                    value={form.sort}
                    onChange={(e) => patch('sort', e.target.value)}
                    placeholder="自动"
                  />
                </FormField>
                <FormField label="状态">
                  <Segmented
                    options={[
                      { value: 'inactive', label: '下架' },
                      { value: 'active', label: '上架' },
                    ]}
                    value={form.status}
                    onChange={(value) => patch('status', value)}
                  />
                </FormField>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
