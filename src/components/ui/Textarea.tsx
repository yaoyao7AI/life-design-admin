import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = '', ...rest }: TextareaProps) {
  return <textarea className={`ui-textarea ${className}`} {...rest} />;
}
