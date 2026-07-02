import Icon from './Icon';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="ui-pagination">
      <span className="ui-pagination__info">
        共 {total} 条 · 第 {start}-{end} 条
      </span>
      <div className="ui-pagination__controls">
        <button
          className="ui-pagination__btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="上一页"
        >
          <Icon name="chevron-right" size={15} style={{ transform: 'rotate(180deg)' }} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`ui-pagination__btn ${
              p === page ? 'ui-pagination__btn--active' : ''
            }`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="ui-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="下一页"
        >
          <Icon name="chevron-right" size={15} />
        </button>
      </div>
    </div>
  );
}
