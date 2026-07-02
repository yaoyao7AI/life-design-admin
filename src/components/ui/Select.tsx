import type { SelectHTMLAttributes } from 'react';
import Icon from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  options,
  placeholder,
  className = '',
  ...rest
}: SelectProps) {
  return (
    <div className={`ui-select-wrap ${className}`}>
      <select className="ui-select" {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={15} className="ui-select-wrap__chevron" />
    </div>
  );
}
