import { Button, Icon, Input, Select } from '../../../components/ui';
import { ORG_STATUS_FILTER_OPTIONS } from '../organizationStatus';

interface OrganizationFiltersProps {
  keyword: string;
  status: string;
  loading?: boolean;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function OrganizationFilters({
  keyword,
  status,
  loading,
  onKeywordChange,
  onStatusChange,
  onSearch,
  onReset,
}: OrganizationFiltersProps) {
  return (
    <form
      className="org-filters"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <div className="org-filters__field org-filters__field--keyword">
        <Input
          icon="search"
          placeholder="搜索主办方名称 / 管理人 / 手机号"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
      <div className="org-filters__field org-filters__field--status">
        <Select
          options={ORG_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        />
      </div>
      <div className="org-filters__actions">
        <Button type="submit" variant="primary" disabled={loading}>
          <Icon name="search" size={16} />
          查询
        </Button>
        <Button type="button" variant="ghost" onClick={onReset} disabled={loading}>
          重置
        </Button>
      </div>
    </form>
  );
}
