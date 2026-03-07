import React from 'react';
import { DeskViewer } from './pocket/DeskViewer';
import { FeedViewer } from './pocket/FeedViewer';
import { LogViewer } from './pocket/LogViewer';
import { WelcomeSelector } from './WelcomeSelector';
import { PocketSubView } from '../dock/Dock';
import { Tab, TabType } from '../../../types/tabs';

interface PocketViewerProps {
  activeSubView: PocketSubView;
  activeTab: Tab;
  onUpdateTabType: (type: TabType) => void;
}

export const PocketViewer: React.FC<PocketViewerProps> = ({ 
  activeSubView, 
  activeTab,
  onUpdateTabType
}) => {
  const pocketId = activeTab.fileId;

  // If we're in a pocket tab but don't have a DB record ID yet,
  // show the selector so the user can actually "create" it.
  if (!pocketId) {
    return <WelcomeSelector onSelect={onUpdateTabType} />;
  }

  const renderSubView = () => {
    switch (activeSubView) {
      case 'desk': return <DeskViewer pocketId={pocketId} />;
      case 'feed': return <FeedViewer />;
      case 'log': return <LogViewer />;
      default: return <DeskViewer pocketId={pocketId} />;
    }
  };

  return (
    <div className="pocket-viewer-root">
      {renderSubView()}
    </div>
  );
};
