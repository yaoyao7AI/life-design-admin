import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlockEditor from '../../components/growth/BlockEditor';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  Icon,
  ImageUpload,
  Input,
  Segmented,
  Select,
  TagInput,
  Textarea,
} from '../../components/ui';
import {
  createArticle,
  fetchArticleById,
  updateArticle,
  type ArticleInput,
} from '../../mock/growth/articles';
import {
  ACCESS_LABELS,
  STATUS_LABELS,
  STATUS_TONE,
  TOPIC_OPTIONS,
  type AccessLevel,
  type Article,
  type ArticleStatus,
  type Block,
  type TopicSlug,
} from '../../types/growth';
import { generateSlug } from '../../utils/slug';
import './editor.css';

const USER_SITE = 'https://designyourlife.app';

interface FormState {
  title: string;
  titleEn: string;
  slug: string;
  summary: string;
  topic: TopicSlug;
  access: AccessLevel;
  status: ArticleStatus;
  cover: string;
  tags: string[];
  author: string;
  readingTime: number;
  publishedAt: string;
  content: Block[];
}

const uid = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const initialForm = (): FormState => ({
  title: '',
  titleEn: '',
  slug: '',
  summary: '',
  topic: 'growth',
  access: 'free',
  status: 'draft',
  cover: '',
  tags: [],
  author: '',
  readingTime: 5,
  publishedAt: '',
  content: [{ id: uid(), type: 'p', text: '' }],
});

const colSpanFull = { gridColumn: '1 / -1' } as const;
const stackStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-4)',
};

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(initialForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // 编辑模式：回填数据
  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      const article = await fetchArticleById(id);
      if (!alive) return;
      if (article) {
        setForm(fromArticle(article));
        setSlugTouched(true);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // 自动生成 slug（未手动编辑时）
  useEffect(() => {
    if (slugTouched) return;
    const next = generateSlug(form.titleEn, form.title);
    setForm((prev) => (prev.slug === next ? prev : { ...prev, slug: next }));
  }, [form.title, form.titleEn, slugTouched]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildInput = (status: ArticleStatus): ArticleInput => ({
    title: form.title.trim(),
    titleEn: form.titleEn.trim() || undefined,
    slug: form.slug.trim() || generateSlug(form.titleEn, form.title),
    summary: form.summary.trim() || undefined,
    cover: form.cover || undefined,
    topic: form.topic,
    access: form.access,
    status,
    author: form.author.trim() || '未署名',
    tags: form.tags,
    readingTime: Number(form.readingTime) || 1,
    publishedAt: form.publishedAt || null,
    content: form.content,
  });

  const save = async (status: ArticleStatus) => {
    if (!form.title.trim()) {
      alert('请填写文章标题');
      return;
    }
    setSaving(true);
    try {
      const input = buildInput(status);
      if (isEdit && id) {
        await updateArticle(id, input);
      } else {
        await createArticle(input);
      }
      alert(status === 'published' ? '已发布' : '草稿已保存');
      navigate('/growth/articles');
    } catch (e) {
      alert('保存失败，请重试');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`${USER_SITE}/growth/${form.slug}`, '_blank');
  };

  const statusBadge = useMemo(
    () => (
      <Badge tone={STATUS_TONE[form.status]} dot>
        {STATUS_LABELS[form.status]}
      </Badge>
    ),
    [form.status]
  );

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
            }}
          >
            加载中…
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="editor-toolbar">
        <Button variant="ghost" onClick={() => navigate('/growth/articles')}>
          <Icon
            name="chevron-right"
            size={16}
            style={{ transform: 'rotate(180deg)' }}
          />
          返回
        </Button>
        <span className="editor-toolbar__title">
          {isEdit ? '编辑文章' : '新建文章'}
        </span>
        {statusBadge}
        <div className="editor-toolbar__spacer" />
        <div className="editor-toolbar__actions">
          <Button variant="secondary" onClick={handlePreview}>
            <Icon name="eye" size={16} />
            预览
          </Button>
          <Button
            variant="secondary"
            onClick={() => save('draft')}
            disabled={saving}
          >
            保存草稿
          </Button>
          <Button
            variant="primary"
            onClick={() => save('published')}
            disabled={saving}
          >
            <Icon name="sparkles" size={16} />
            发布
          </Button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-main">
          <Card>
            <CardHeader title="基础信息" description="文章的标题、链接与摘要" />
            <CardBody>
              <div className="editor-form-grid">
                <div style={colSpanFull}>
                  <FormField label="文章标题" required htmlFor="title">
                    <Input
                      id="title"
                      placeholder="输入中文标题"
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                    />
                  </FormField>
                </div>
                <FormField label="英文标题" htmlFor="titleEn">
                  <Input
                    id="titleEn"
                    placeholder="English Title（可选）"
                    value={form.titleEn}
                    onChange={(e) => set('titleEn', e.target.value)}
                  />
                </FormField>
                <FormField
                  label="Slug（链接标识）"
                  htmlFor="slug"
                  hint="自动根据标题生成，可手动修改"
                >
                  <Input
                    id="slug"
                    placeholder="article-slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug', e.target.value);
                    }}
                  />
                </FormField>
                <div style={colSpanFull}>
                  <FormField label="摘要" htmlFor="summary">
                    <Textarea
                      id="summary"
                      placeholder="一句话概括这篇文章（列表与分享展示）"
                      value={form.summary}
                      onChange={(e) => set('summary', e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="正文内容"
              description="以内容块组织正文，支持标题 / 段落 / 引用 / 列表 / 图片 / 分割线"
            />
            <CardBody>
              <BlockEditor
                value={form.content}
                onChange={(content) => set('content', content)}
              />
            </CardBody>
          </Card>
        </div>

        <div className="editor-side">
          <Card>
            <CardHeader title="发布" />
            <CardBody>
              <div style={stackStyle}>
                <FormField label="状态">
                  <Segmented<ArticleStatus>
                    value={form.status}
                    onChange={(v) => set('status', v)}
                    options={[
                      { value: 'draft', label: STATUS_LABELS.draft },
                      { value: 'published', label: STATUS_LABELS.published },
                    ]}
                  />
                </FormField>
                <FormField label="发布时间" hint="留空则发布时使用当天日期">
                  <Input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => set('publishedAt', e.target.value)}
                  />
                </FormField>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="分类与权限" />
            <CardBody>
              <div style={stackStyle}>
                <FormField label="主题">
                  <Select
                    options={TOPIC_OPTIONS}
                    value={form.topic}
                    onChange={(e) => set('topic', e.target.value as TopicSlug)}
                  />
                </FormField>
                <FormField
                  label="阅读权限"
                  hint={form.access === 'vip' ? '仅创始会员可读' : '所有人可读'}
                >
                  <Segmented<AccessLevel>
                    value={form.access}
                    onChange={(v) => set('access', v)}
                    options={[
                      { value: 'free', label: ACCESS_LABELS.free },
                      { value: 'vip', label: ACCESS_LABELS.vip },
                    ]}
                  />
                </FormField>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="封面" />
            <CardBody>
              <ImageUpload
                value={form.cover}
                onChange={(url) => set('cover', url)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="更多信息" />
            <CardBody>
              <div style={stackStyle}>
                <FormField label="作者">
                  <Input
                    placeholder="作者名"
                    value={form.author}
                    onChange={(e) => set('author', e.target.value)}
                  />
                </FormField>
                <FormField label="阅读时间（分钟）">
                  <Input
                    type="number"
                    min={1}
                    value={form.readingTime}
                    onChange={(e) => set('readingTime', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="标签">
                  <TagInput
                    value={form.tags}
                    onChange={(tags) => set('tags', tags)}
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

function fromArticle(a: Article): FormState {
  return {
    title: a.title,
    titleEn: a.titleEn ?? '',
    slug: a.slug,
    summary: a.summary ?? '',
    topic: a.topic,
    access: a.access,
    status: a.status,
    cover: a.cover ?? '',
    tags: a.tags ?? [],
    author: a.author,
    readingTime: a.readingTime,
    publishedAt: a.publishedAt ?? '',
    content:
      a.content && a.content.length
        ? a.content
        : [{ id: uid(), type: 'p', text: a.summary ?? '' }],
  };
}
