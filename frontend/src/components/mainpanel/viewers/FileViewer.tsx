import React from 'react';
import { Tab } from '../../../types/tabs';
import { Editor } from '../../../features/editor';
import { FileViewer as GenericFileViewer } from '../../../features/viewers';

interface FileViewerProps {
  activeTab: Tab;
}

export const FileViewer: React.FC<FileViewerProps> = ({ activeTab }) => {
  const extension = activeTab.fileExtension?.toLowerCase();
  
  if (extension === 'md') {
    return (
      <Editor 
        fileId={activeTab.fileId}
        title={activeTab.title}
        languageType="markdown"
      />
    );
  }

  if (extension === 'txt' || !extension) {
    return (
      <Editor 
        fileId={activeTab.fileId}
        title={activeTab.title}
        languageType="plain"
      />
    );
  }

  // Use the feature-level GenericFileViewer for all other types
  return (
    <GenericFileViewer 
      fileId={activeTab.fileId || ''} 
      title={activeTab.title} 
      fileExtension={extension}
      className="main-panel-view"
    />
  );
};
