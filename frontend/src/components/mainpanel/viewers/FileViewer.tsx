import React from 'react';
import { Tab } from '../../../types/tabs';
import { Editor } from '../../../features/editor';

interface FileViewerProps {
  activeTab: Tab;
}

export const FileViewer: React.FC<FileViewerProps> = ({ activeTab }) => {
  const isMarkdown = activeTab.fileExtension?.toLowerCase() === 'md';

  if (isMarkdown) {
    return (
      <Editor 
        title={activeTab.title} 
        initialContent={`# ${activeTab.title}\n\nStart editing your markdown file here...`}
        onSave={(content) => console.log('Saving content:', content)}
      />
    );
  }

  return (
    <div className="viewer-container">
      <h2>File Viewer</h2>
      <div className="file-info-card" style={{ 
        background: 'var(--paper-cream)', 
        padding: '20px', 
        border: 'var(--border-medium)',
        borderRadius: '4px',
        marginTop: '20px',
        fontFamily: 'var(--font-mono)'
      }}>
        <p><strong>Name:</strong> {activeTab.title}</p>
        <p><strong>ID:</strong> {activeTab.fileId}</p>
        <p><strong>Type:</strong> {activeTab.fileExtension?.toUpperCase() || 'Unknown'}</p>
      </div>
      <p style={{ marginTop: '20px', opacity: 0.6 }}>
        Placeholder content for File Viewer. In a real application, this would render the actual file content based on the ID and Type.
      </p>
    </div>
  );
};
