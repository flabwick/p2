import React from 'react';

interface ImageBlockProps {
  content: { url: string; alt?: string };
  isEditing: boolean;
  onChange: (content: any) => void;
  onBlur: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, isEditing, onChange, onBlur }) => {
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
    <div className="block-image-container">
      <img src={content.url} alt={content.alt || 'Canvas Image'} className="block-image" />
    </div>
  );
};
