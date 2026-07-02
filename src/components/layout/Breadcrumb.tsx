import { Fragment } from 'react';
import Icon from '../ui/Icon';

export interface Crumb {
  label: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="admin-breadcrumb" aria-label="breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <Fragment key={idx}>
            <span
              className={`admin-breadcrumb__item ${
                isLast ? 'admin-breadcrumb__item--current' : ''
              }`}
            >
              {item.label}
            </span>
            {!isLast && (
              <span className="admin-breadcrumb__sep">
                <Icon name="chevron-right" size={14} />
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
