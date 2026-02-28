import { useState, useRef, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLayoutState } from '../../hooks/useLayoutState';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DeskViewer from './DeskViewer';
import FeedViewer from './FeedViewer';
import LogViewer from './LogViewer';

type ViewType = 'desk' | 'feed' | 'log';

interface FeedState {
  role: string;
  isDirty: boolean;
  cards: any[];
}

const MainPanel = ({ 
  view, 
  pocketId, 
  pocketName, 
  onFeedStateChange,
}: { 
  view: ViewType; 
  pocketId: string; 
  pocketName: string;
  onFeedStateChange: (state: FeedState, isDirty: boolean) => void;
}) => {
  return (
    <div className="main-panel-scroll">
      {view === 'desk' && <DeskViewer pocketId={pocketId} pocketName={pocketName} />}
      {view === 'feed' && (
        <FeedViewer 
          pocketId={pocketId} 
          pocketName={pocketName} 
          onFeedStateChange={onFeedStateChange}
        />
      )}
      {view === 'log' && <LogViewer pocketId={pocketId} pocketName={pocketName} />}
    </div>
);
};

const Layout = ({ children }: { children?: ReactNode }) => {
  const { isSidebarOpen, toggleSidebar, activePocket, pockets } = useLayoutState();
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [activeView, setActiveView] = useState<ViewType>('desk');
  const [feedState, setFeedState] = useState<FeedState>({
    role: 'default',
    isDirty: false,
    cards: [],
  });

  const activePocketData = pockets.find((p: any) => p.id === activePocket) || pockets[0];

  const handleFeedStateChange = (state: FeedState, isDirty: boolean) => {
    setFeedState({ ...state, isDirty });
  };

  const handleFeedRefresh = async () => {
    // Simulate AI refresh - would call LLM with current feed state
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFeedState({ ...feedState, isDirty: false });
  };

  return (
    <div className="layout-wrapper">
      <div className="layout-grid">
        <Sidebar 
          isOpen={isSidebarOpen} 
          width={sidebarWidth} 
          onResize={setSidebarWidth} 
        />

        <main className="main-content" style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}>
          <div className="main-panel-area">
            <Header
              activeView={activeView}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
            />

            <div className="panel-content">
              <Routes>
                <Route path="/pocket/:id" element={
                  <MainPanel
                    view={activeView}
                    pocketId={activePocketData?.id || 'main'}
                    pocketName={activePocketData?.name || 'Main Context'}
                    onFeedStateChange={handleFeedStateChange}
                  />
                } />
                <Route path="/" element={
                  <MainPanel
                    view={activeView}
                    pocketId={activePocketData?.id || 'main'}
                    pocketName={activePocketData?.name || 'Main Context'}
                    onFeedStateChange={handleFeedStateChange}
                  />
                } />
              </Routes>
            </div>

            <Footer 
              activeView={activeView} 
              onViewChange={setActiveView}
              feedState={feedState}
              onFeedRefresh={handleFeedRefresh}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
