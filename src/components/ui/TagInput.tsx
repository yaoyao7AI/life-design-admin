import { useState, type KeyboardEvent } from 'react';
import Icon from './Icon';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = '输入后回车添加标签',
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="ui-taginput">
      {value.map((tag) => (
        <span className="ui-taginput__tag" key={tag}>
          {tag}
          <button
            type="button"
            className="ui-taginput__remove"
            onClick={() => removeTag(tag)}
            aria-label={`移除 ${tag}`}
          >
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <input
        className="ui-taginput__input"
        value={draft}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
      />
    </div>
  );
}
