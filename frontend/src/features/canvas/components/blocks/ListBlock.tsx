import React from 'react';

interface ListBlockProps {
  content: { items: string[] };
  isEditing: boolean;
  onChange: (content: any) => void;
  onBlur: () => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({ content, isEditing, onChange, onBlur }) => {
  if (isEditing) {
    return (
      <textarea 
        className="block-editor"
        value={JSON.stringify(content, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {}
        }}
        onBlur={onBlur}
        autoFocus
      />
    );
  }

  return (
    <ul className="block-list">
      {(content.items || []).map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};
