import React from 'react';
import { DeskViewer } from './pocket/DeskViewer';
import { FeedViewer } from './pocket/FeedViewer';
import { LogViewer } from './pocket/LogViewer';
import { PocketSubView } from '../dock/Dock';

interface PocketViewerProps {
  activeSubView: PocketSubView;
}

export const PocketViewer: React.FC<PocketViewerProps> = ({ activeSubView }) => {
  const renderSubView = () => {
    switch (activeSubView) {
      case 'desk': return <DeskViewer />;
      case 'feed': return <FeedViewer />;
      case 'log': return <LogViewer />;
      default: return <DeskViewer />;
    }
  };

  return (
    <div className="pocket-viewer-root">
      {renderSubView()}
    </div>
  );
};
