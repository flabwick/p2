import React from 'react';

interface HeadingBlockProps {
  content: string;
  isEditing: boolean;
  onChange: (content: string) => void;
  onBlur: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ content, isEditing, onChange, onBlur }) => {
  if (isEditing) {
    return (
      <textarea 
        className="block-editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus
      />
    );
  }
  return <h4 className="block-heading">{content || 'New Heading'}</h4>;
};
