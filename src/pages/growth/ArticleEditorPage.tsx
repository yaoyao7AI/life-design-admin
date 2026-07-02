import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { Button, Card, EmptyState, Icon } from '../../components/ui';

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  return (
    <>
      <PageHeader
        title={isEdit ? '编辑文章' : '新建文章'}
        description={isEdit ? `文章 ID：${id}` : '创建一篇新的成长文章。'}
        actions={
          <Button variant="secondary" onClick={() => navigate('/growth/articles')}>
            <Icon name="chevron-right" size={16} style={{ transform: 'rotate(180deg)' }} />
            返回列表
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon="edit"
          title="文章编辑器即将上线"
          description="Task A3 将在此实现基础信息表单、富文本正文编辑与保存草稿 / 发布 / 预览操作。"
        />
      </Card>
    </>
  );
}
