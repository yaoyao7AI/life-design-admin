import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  hint,
  required,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="ui-field__req">*</span>}
      </label>
      {children}
      {hint && <div className="ui-field__hint">{hint}</div>}
    </div>
  );
}
