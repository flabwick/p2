import React from 'react';
import { MarkdownEditor } from '../../../../features/editor/components/MarkdownEditor';

interface MarkdownBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ content, onChange }) => {
  return (
    <div className="canvas-markdown-block">
      <MarkdownEditor 
        content={content || ''} 
        onChange={onChange}
        className="canvas-block-editor"
      />
    </div>
  );
};
