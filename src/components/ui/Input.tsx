import type { InputHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
}

export default function Input({ icon, className = '', ...rest }: InputProps) {
  if (icon) {
    return (
      <div className={`ui-input-wrap ${className}`}>
        <Icon name={icon} size={16} className="ui-input-wrap__icon" />
        <input className="ui-input ui-input--with-icon" {...rest} />
      </div>
    );
  }
  return <input className={`ui-input ${className}`} {...rest} />;
}
