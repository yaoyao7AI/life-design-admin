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
  ImageUpload,
  Input,
  Select,
  Table,
  type Column,
} from '../../components/ui';
import { getGrowthArticles } from '../../api/growth/articles';
import {
  createHomeBanner,
  createHomeCourse,
  deleteHomeBanner,
  deleteHomeCourse,
  getHomeBanners,
  getHomeCourses,
  getLatestConfig,
  getMembershipCtaConfig,
  getMostPopularConfig,
  sortHomeBanners,
  sortHomeCourses,
  updateHomeBanner,
  updateHomeCourse,
  updateLatestConfig,
  updateMembershipCtaConfig,
  updateMostPopularConfig,
  type HomeBanner,
  type HomeCourse,
  type HomeLinkType,
  type LatestConfig,
  type MembershipCtaConfig,
  type MostPopularConfig,
} from '../../api/growth/home';
import type { Article } from '../../types/growth';
import './growth.css';

interface BannerForm {
  title: string;
  imageUrl: string;
  targetType: HomeLinkType;
  targetValue: string;
  enabled: boolean;
}

interface CourseForm {
  title: string;
  coverUrl: string;
  link: string;
}

const EMPTY_BANNER_FORM: BannerForm = {
  title: '',
  imageUrl: '',
  targetType: 'article',
  targetValue: '',
  enabled: true,
};

const EMPTY_COURSE_FORM: CourseForm = {
  title: '',
  coverUrl: '',
  link: '',
};

const DEFAULT_POPULAR: MostPopularConfig = {
  enabled: true,
  limit: 5,
  articleIds: [],
};

const DEFAULT_LATEST: LatestConfig = {
  limit: 8,
  sortRule: 'publishedAt',
  autoLatest: true,
};

const DEFAULT_CTA: MembershipCtaConfig = {
  enabled: true,
  title: '加入创始会员',
  description: '解锁完整成长内容与专属课程。',
  buttonText: '立即加入',
  buttonLink: '/membership',
};

const parseError = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。';

const normalizeBanner = (item: any): HomeBanner => ({
  id: String(item.id ?? ''),
  title: item.title ?? '',
  imageUrl: item.imageUrl ?? item.image_url ?? '',
  targetType: (item.targetType ?? item.target_type ?? 'article') as HomeLinkType,
  targetValue: item.targetValue ?? item.target_value ?? '',
  order: Number(item.order ?? 0),
  enabled: Boolean(item.enabled ?? item.isEnabled ?? true),
});

const normalizeCourse = (item: any): HomeCourse => ({
  id: String(item.id ?? ''),
  title: item.title ?? '',
  coverUrl: item.coverUrl ?? item.cover_url ?? '',
  link: item.link ?? '',
  order: Number(item.order ?? 0),
});

const normalizePopular = (item: any): MostPopularConfig => ({
  enabled: Boolean(item.enabled ?? true),
  limit: Number(item.limit ?? 5),
  articleIds: Array.isArray(item.articleIds ?? item.article_ids)
    ? (item.articleIds ?? item.article_ids).map(String)
    : [],
});

const normalizeLatest = (item: any): LatestConfig => ({
  limit: Number(item.limit ?? 8),
  sortRule: (item.sortRule ?? item.sort_rule ?? 'publishedAt') as LatestConfig['sortRule'],
  autoLatest: Boolean(item.autoLatest ?? item.auto_latest ?? true),
});

const normalizeCta = (item: any): MembershipCtaConfig => ({
  enabled: Boolean(item.enabled ?? true),
  title: item.title ?? '',
  description: item.description ?? '',
  buttonText: item.buttonText ?? item.button_text ?? '',
  buttonLink: item.buttonLink ?? item.button_link ?? '',
});

export default function HomeConfigPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [courses, setCourses] = useState<HomeCourse[]>([]);
  const [popular, setPopular] = useState<MostPopularConfig>(DEFAULT_POPULAR);
  const [latest, setLatest] = useState<LatestConfig>(DEFAULT_LATEST);
  const [cta, setCta] = useState<MembershipCtaConfig>(DEFAULT_CTA);
  const [articles, setArticles] = useState<Article[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerForm>(EMPTY_BANNER_FORM);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>(EMPTY_COURSE_FORM);

  const [selectedArticleToAdd, setSelectedArticleToAdd] = useState('');

  const setBusy = (key: string, value: boolean) =>
    setSaving((prev) => ({ ...prev, [key]: value }));

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const [bannerRes, popularRes, latestRes, courseRes, ctaRes, articleRes] =
        await Promise.all([
          getHomeBanners(),
          getMostPopularConfig(),
          getLatestConfig(),
          getHomeCourses(),
          getMembershipCtaConfig(),
          getGrowthArticles({ page: 1, pageSize: 100 }),
        ]);

      setBanners((bannerRes || []).map(normalizeBanner).sort((a, b) => a.order - b.order));
      setPopular(normalizePopular(popularRes || DEFAULT_POPULAR));
      setLatest(normalizeLatest(latestRes || DEFAULT_LATEST));
      setCourses((courseRes || []).map(normalizeCourse).sort((a, b) => a.order - b.order));
      setCta(normalizeCta(ctaRes || DEFAULT_CTA));
      setArticles(articleRes.list || []);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetBannerForm = () => {
    setBannerForm(EMPTY_BANNER_FORM);
    setEditingBannerId(null);
    setShowBannerForm(false);
  };

  const resetCourseForm = () => {
    setCourseForm(EMPTY_COURSE_FORM);
    setEditingCourseId(null);
    setShowCourseForm(false);
  };

  const articleOptions = useMemo(
    () => articles.map((a) => ({ value: a.id, label: a.title })),
    [articles]
  );

  const popularArticleRows = useMemo(
    () =>
      popular.articleIds
        .map((id) => articles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a)),
    [popular.articleIds, articles]
  );

  const handleBannerSave = async () => {
    if (!bannerForm.title.trim() || !bannerForm.imageUrl.trim()) {
      setActionError('Banner 需填写标题与图片。');
      return;
    }
    if (!bannerForm.targetValue.trim()) {
      setActionError('Banner 需填写跳转目标。');
      return;
    }
    setBusy('bannerSave', true);
    setActionError(null);
    try {
      if (editingBannerId) {
        await updateHomeBanner(editingBannerId, {
          ...bannerForm,
          targetValue: bannerForm.targetValue.trim(),
        });
      } else {
        await createHomeBanner({
          ...bannerForm,
          targetValue: bannerForm.targetValue.trim(),
          order: banners.length + 1,
        });
      }
      resetBannerForm();
      await loadAll();
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('bannerSave', false);
    }
  };

  const moveBanner = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= banners.length) return;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    const payload = next.map((item, i) => ({ id: item.id, order: i + 1 }));
    setBusy('bannerSort', true);
    setActionError(null);
    try {
      await sortHomeBanners(payload);
      setBanners(next.map((item, i) => ({ ...item, order: i + 1 })));
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('bannerSort', false);
    }
  };

  const handleBannerDelete = async (id: string) => {
    if (!window.confirm('确定删除这个 Banner 吗？')) return;
    setBusy('bannerDelete', true);
    setActionError(null);
    try {
      await deleteHomeBanner(id);
      await loadAll();
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('bannerDelete', false);
    }
  };

  const handleSavePopular = async () => {
    setBusy('popularSave', true);
    setActionError(null);
    try {
      await updateMostPopularConfig(popular);
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('popularSave', false);
    }
  };

  const handleSaveLatest = async () => {
    setBusy('latestSave', true);
    setActionError(null);
    try {
      await updateLatestConfig(latest);
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('latestSave', false);
    }
  };

  const handleCourseSave = async () => {
    if (!courseForm.title.trim() || !courseForm.coverUrl.trim() || !courseForm.link.trim()) {
      setActionError('课程需填写标题、封面和链接。');
      return;
    }
    setBusy('courseSave', true);
    setActionError(null);
    try {
      if (editingCourseId) {
        await updateHomeCourse(editingCourseId, {
          ...courseForm,
          link: courseForm.link.trim(),
        });
      } else {
        await createHomeCourse({
          ...courseForm,
          link: courseForm.link.trim(),
          order: courses.length + 1,
        });
      }
      resetCourseForm();
      await loadAll();
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('courseSave', false);
    }
  };

  const moveCourse = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= courses.length) return;
    const next = [...courses];
    [next[index], next[target]] = [next[target], next[index]];
    const payload = next.map((item, i) => ({ id: item.id, order: i + 1 }));
    setBusy('courseSort', true);
    setActionError(null);
    try {
      await sortHomeCourses(payload);
      setCourses(next.map((item, i) => ({ ...item, order: i + 1 })));
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('courseSort', false);
    }
  };

  const handleCourseDelete = async (id: string) => {
    if (!window.confirm('确定删除这个课程卡片吗？')) return;
    setBusy('courseDelete', true);
    setActionError(null);
    try {
      await deleteHomeCourse(id);
      await loadAll();
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('courseDelete', false);
    }
  };

  const handleSaveCta = async () => {
    setBusy('ctaSave', true);
    setActionError(null);
    try {
      await updateMembershipCtaConfig(cta);
    } catch (err) {
      setActionError(parseError(err));
    } finally {
      setBusy('ctaSave', false);
    }
  };

  const bannerColumns: Column<HomeBanner>[] = [
    {
      key: 'title',
      header: 'Banner',
      render: (item) => (
        <div className="article-cell">
          {item.imageUrl ? (
            <img className="article-cell__cover" src={item.imageUrl} alt="" />
          ) : (
            <div className="article-cell__cover article-cell__cover--empty">
              <Icon name="image" size={18} />
            </div>
          )}
          <div className="article-cell__text">
            <div className="article-cell__title">{item.title}</div>
            <div className="article-cell__en">
              {item.targetType}: {item.targetValue}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '110px',
      render: (item) => (
        <Badge tone={item.enabled ? 'success' : 'neutral'}>
          {item.enabled ? '启用' : '停用'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '180px',
      align: 'right',
      render: (item) => {
        const index = banners.findIndex((b) => b.id === item.id);
        return (
          <div className="row-actions">
            <Button
              size="sm"
              variant="ghost"
              disabled={index === 0 || saving.bannerSort}
              onClick={() => moveBanner(index, -1)}
            >
              上移
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={index === banners.length - 1 || saving.bannerSort}
              onClick={() => moveBanner(index, 1)}
            >
              下移
            </Button>
            <button
              className="row-action"
              title="编辑"
              onClick={() => {
                setEditingBannerId(item.id);
                setBannerForm({
                  title: item.title,
                  imageUrl: item.imageUrl,
                  targetType: item.targetType,
                  targetValue: item.targetValue,
                  enabled: item.enabled,
                });
                setShowBannerForm(true);
              }}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              className="row-action row-action--danger"
              title="删除"
              onClick={() => handleBannerDelete(item.id)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const courseColumns: Column<HomeCourse>[] = [
    {
      key: 'title',
      header: '课程',
      render: (item) => (
        <div className="article-cell">
          {item.coverUrl ? (
            <img className="article-cell__cover" src={item.coverUrl} alt="" />
          ) : (
            <div className="article-cell__cover article-cell__cover--empty">
              <Icon name="image" size={18} />
            </div>
          )}
          <div className="article-cell__text">
            <div className="article-cell__title">{item.title}</div>
            <div className="article-cell__en">{item.link}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '180px',
      align: 'right',
      render: (item) => {
        const index = courses.findIndex((c) => c.id === item.id);
        return (
          <div className="row-actions">
            <Button
              size="sm"
              variant="ghost"
              disabled={index === 0 || saving.courseSort}
              onClick={() => moveCourse(index, -1)}
            >
              上移
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={index === courses.length - 1 || saving.courseSort}
              onClick={() => moveCourse(index, 1)}
            >
              下移
            </Button>
            <button
              className="row-action"
              title="编辑"
              onClick={() => {
                setEditingCourseId(item.id);
                setCourseForm({
                  title: item.title,
                  coverUrl: item.coverUrl,
                  link: item.link,
                });
                setShowCourseForm(true);
              }}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              className="row-action row-action--danger"
              title="删除"
              onClick={() => handleCourseDelete(item.id)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <EmptyState icon="layout" title="加载中…" description="正在加载首页配置数据。" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          icon="inbox"
          title="加载失败"
          description={error}
          action={
            <Button variant="ghost" onClick={loadAll}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="首页配置"
        description="配置 Banner、Most Popular、Latest、Courses 与 Membership CTA。"
        actions={
          <Badge tone="success">
            Home Config
          </Badge>
        }
      />

      {actionError && (
        <Card className="topic-error-card">
          <div className="topic-error">
            <span>{actionError}</span>
            <Button size="sm" variant="ghost" onClick={() => setActionError(null)}>
              关闭
            </Button>
          </div>
        </Card>
      )}

      <Card className="home-card">
        <CardHeader
          title="Banner"
          description="支持新增、编辑、删除、排序、上传图片与跳转配置。"
          action={
            <Button variant="primary" onClick={() => setShowBannerForm(true)}>
              <Icon name="plus" size={16} />
              新增 Banner
            </Button>
          }
        />
        <CardBody>
          {(showBannerForm || banners.length === 0) && (
            <div className="home-form-grid">
              <div className="topic-form__row">
                <label className="topic-form__label">Banner 标题</label>
                <Input
                  value={bannerForm.title}
                  onChange={(e) =>
                    setBannerForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">跳转类型</label>
                <Select
                  value={bannerForm.targetType}
                  options={[
                    { value: 'article', label: '文章' },
                    { value: 'external', label: '外链' },
                    { value: 'course', label: '课程' },
                  ]}
                  onChange={(e) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      targetType: e.target.value as HomeLinkType,
                    }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">跳转目标</label>
                {bannerForm.targetType === 'article' ? (
                  <Select
                    value={bannerForm.targetValue}
                    placeholder="选择文章"
                    options={articleOptions}
                    onChange={(e) =>
                      setBannerForm((prev) => ({ ...prev, targetValue: e.target.value }))
                    }
                  />
                ) : (
                  <Input
                    value={bannerForm.targetValue}
                    placeholder={
                      bannerForm.targetType === 'external'
                        ? 'https://...'
                        : '/growth/courses/...'
                    }
                    onChange={(e) =>
                      setBannerForm((prev) => ({ ...prev, targetValue: e.target.value }))
                    }
                  />
                )}
              </div>
              <div className="topic-form__row home-form-grid__image">
                <label className="topic-form__label">Banner 图片</label>
                <ImageUpload
                  value={bannerForm.imageUrl}
                  onChange={(url) => setBannerForm((prev) => ({ ...prev, imageUrl: url }))}
                />
              </div>
              <div className="topic-form__actions">
                <Button
                  variant={bannerForm.enabled ? 'primary' : 'secondary'}
                  onClick={() =>
                    setBannerForm((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                >
                  {bannerForm.enabled ? '已启用' : '已停用'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBannerSave}
                  disabled={saving.bannerSave}
                >
                  {saving.bannerSave ? '保存中...' : editingBannerId ? '更新 Banner' : '创建 Banner'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetBannerForm}
                  disabled={saving.bannerSave}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {banners.length === 0 ? (
            <EmptyState
              icon="layout"
              title="暂无 Banner"
              description="请先新增首页 Banner。"
            />
          ) : (
            <Table columns={bannerColumns} data={banners} rowKey={(item) => item.id} />
          )}
        </CardBody>
      </Card>

      <Card className="home-card">
        <CardHeader title="Most Popular" description="选择文章、调整排序、数量限制并开关。" />
        <CardBody>
          <div className="home-inline-form">
            <div className="topic-form__row">
              <label className="topic-form__label">是否开启</label>
              <Select
                value={popular.enabled ? 'on' : 'off'}
                options={[
                  { value: 'on', label: '开启' },
                  { value: 'off', label: '关闭' },
                ]}
                onChange={(e) =>
                  setPopular((prev) => ({ ...prev, enabled: e.target.value === 'on' }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">数量限制</label>
              <Input
                type="number"
                min={1}
                value={popular.limit}
                onChange={(e) =>
                  setPopular((prev) => ({ ...prev, limit: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="topic-form__row home-inline-form__wide">
              <label className="topic-form__label">添加文章</label>
              <div className="row-actions">
                <Select
                  className="home-article-select"
                  placeholder="选择文章"
                  options={articleOptions}
                  value={selectedArticleToAdd}
                  onChange={(e) => setSelectedArticleToAdd(e.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={!selectedArticleToAdd}
                  onClick={() => {
                    setPopular((prev) => {
                      if (!selectedArticleToAdd || prev.articleIds.includes(selectedArticleToAdd)) {
                        return prev;
                      }
                      return { ...prev, articleIds: [...prev.articleIds, selectedArticleToAdd] };
                    });
                    setSelectedArticleToAdd('');
                  }}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>

          {popularArticleRows.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Most Popular 为空"
              description="请先选择文章。"
            />
          ) : (
            <div className="home-list">
              {popularArticleRows.map((article, index) => (
                <div className="home-list__item" key={article.id}>
                  <span>{index + 1}. {article.title}</span>
                  <div className="row-actions">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() =>
                        setPopular((prev) => {
                          const next = [...prev.articleIds];
                          [next[index], next[index - 1]] = [next[index - 1], next[index]];
                          return { ...prev, articleIds: next };
                        })
                      }
                    >
                      上移
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === popularArticleRows.length - 1}
                      onClick={() =>
                        setPopular((prev) => {
                          const next = [...prev.articleIds];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return { ...prev, articleIds: next };
                        })
                      }
                    >
                      下移
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setPopular((prev) => ({
                          ...prev,
                          articleIds: prev.articleIds.filter((id) => id !== article.id),
                        }))
                      }
                    >
                      移除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="topic-form__actions">
            <Button variant="primary" onClick={handleSavePopular} disabled={saving.popularSave}>
              {saving.popularSave ? '保存中...' : '保存 Most Popular 配置'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="home-card">
        <CardHeader title="Latest" description="配置展示数量、排序规则与自动最新。" />
        <CardBody>
          <div className="home-inline-form">
            <div className="topic-form__row">
              <label className="topic-form__label">展示数量</label>
              <Input
                type="number"
                min={1}
                value={latest.limit}
                onChange={(e) =>
                  setLatest((prev) => ({ ...prev, limit: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">排序规则</label>
              <Select
                value={latest.sortRule}
                options={[
                  { value: 'publishedAt', label: '发布时间' },
                  { value: 'updatedAt', label: '更新时间' },
                  { value: 'views', label: '阅读量' },
                ]}
                onChange={(e) =>
                  setLatest((prev) => ({
                    ...prev,
                    sortRule: e.target.value as LatestConfig['sortRule'],
                  }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">自动最新</label>
              <Select
                value={latest.autoLatest ? 'on' : 'off'}
                options={[
                  { value: 'on', label: '开启' },
                  { value: 'off', label: '关闭' },
                ]}
                onChange={(e) =>
                  setLatest((prev) => ({ ...prev, autoLatest: e.target.value === 'on' }))
                }
              />
            </div>
          </div>
          <div className="topic-form__actions">
            <Button variant="primary" onClick={handleSaveLatest} disabled={saving.latestSave}>
              {saving.latestSave ? '保存中...' : '保存 Latest 配置'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="home-card">
        <CardHeader
          title="Courses"
          description="维护课程列表、课程封面、跳转链接和排序。"
          action={
            <Button variant="primary" onClick={() => setShowCourseForm(true)}>
              <Icon name="plus" size={16} />
              新增课程卡片
            </Button>
          }
        />
        <CardBody>
          {(showCourseForm || courses.length === 0) && (
            <div className="home-form-grid">
              <div className="topic-form__row">
                <label className="topic-form__label">课程标题</label>
                <Input
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row">
                <label className="topic-form__label">课程链接</label>
                <Input
                  value={courseForm.link}
                  placeholder="https://... 或 /course/..."
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                />
              </div>
              <div className="topic-form__row home-form-grid__image">
                <label className="topic-form__label">课程封面</label>
                <ImageUpload
                  value={courseForm.coverUrl}
                  onChange={(url) => setCourseForm((prev) => ({ ...prev, coverUrl: url }))}
                />
              </div>
              <div className="topic-form__actions">
                <Button
                  variant="primary"
                  onClick={handleCourseSave}
                  disabled={saving.courseSave}
                >
                  {saving.courseSave ? '保存中...' : editingCourseId ? '更新课程' : '创建课程'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetCourseForm}
                  disabled={saving.courseSave}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {courses.length === 0 ? (
            <EmptyState
              icon="graduation-cap"
              title="暂无课程卡片"
              description="请先创建课程推荐卡片。"
            />
          ) : (
            <Table columns={courseColumns} data={courses} rowKey={(item) => item.id} />
          )}
        </CardBody>
      </Card>

      <Card className="home-card">
        <CardHeader title="Membership CTA" description="配置会员引导区展示和文案。" />
        <CardBody>
          <div className="home-inline-form">
            <div className="topic-form__row">
              <label className="topic-form__label">是否显示</label>
              <Select
                value={cta.enabled ? 'on' : 'off'}
                options={[
                  { value: 'on', label: '显示' },
                  { value: 'off', label: '隐藏' },
                ]}
                onChange={(e) =>
                  setCta((prev) => ({ ...prev, enabled: e.target.value === 'on' }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">标题</label>
              <Input
                value={cta.title}
                onChange={(e) => setCta((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="topic-form__row home-inline-form__wide">
              <label className="topic-form__label">描述</label>
              <Input
                value={cta.description}
                onChange={(e) =>
                  setCta((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">按钮文字</label>
              <Input
                value={cta.buttonText}
                onChange={(e) =>
                  setCta((prev) => ({ ...prev, buttonText: e.target.value }))
                }
              />
            </div>
            <div className="topic-form__row">
              <label className="topic-form__label">按钮链接</label>
              <Input
                value={cta.buttonLink}
                onChange={(e) =>
                  setCta((prev) => ({ ...prev, buttonLink: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="topic-form__actions">
            <Button variant="primary" onClick={handleSaveCta} disabled={saving.ctaSave}>
              {saving.ctaSave ? '保存中...' : '保存 Membership CTA'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
