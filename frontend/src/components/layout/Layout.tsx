import { useState, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLayoutState } from '../../hooks/useLayoutState';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Button from '../ui/Button';

type ViewType = 'desk' | 'feed' | 'log';

const MenuIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PocketContent = ({ view, id, name }: { view: ViewType; id: string; name: string }) => (
  <div className="pocket-content">
    <div className="pocket-header">
      <h2 className="pocket-title">Pocket: {name}</h2>
      <span className="pocket-id">ID: {id}</span>
    </div>
    <div className="pocket-body">
      <div className="content-area">
        <div className="content-placeholder">
          <h3>{view === 'desk' ? 'Desk View' : view === 'feed' ? 'Feed View' : 'Log View'}</h3>
          <p>This is the {view} content for pocket: {name}</p>
          <div className="content-grid">
            <div className="content-block">Block 1</div>
            <div className="content-block">Block 2</div>
            <div className="content-block">Block 3</div>
          </div>
        </div>
      </div>
    </div>
    <div className="pocket-footer">
      <span className="pocket-status">Last edited: Just now</span>
      <span className="pocket-sync">View: {view}</span>
    </div>
  </div>
);

const Layout = ({ children }: { children?: ReactNode }) => {
  const { isSidebarOpen, toggleSidebar, activePocket, pockets } = useLayoutState();
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [activeView, setActiveView] = useState<ViewType>('desk');

  const activePocketData = pockets.find(p => p.id === activePocket) || pockets[0];

  return (
    <div className="layout-wrapper">
      <div className="layout-grid">
        <Sidebar 
          isOpen={isSidebarOpen} 
          width={sidebarWidth} 
          onResize={setSidebarWidth} 
        />

        <main className="main-content">
          <div className="fixed-toggle-wrapper">
            <Button className="square" onClick={toggleSidebar} title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
              <MenuIcon />
            </Button>
          </div>

          <Header />

          <div className="panel-content">
            <Routes>
              <Route path="/pocket/:id" element={
                <PocketContent 
                  view={activeView}
                  id={activePocketData?.id || 'main'} 
                  name={activePocketData?.name || 'Main Context'} 
                />
              } />
              <Route path="/" element={
                <PocketContent 
                  view={activeView}
                  id={activePocketData?.id || 'main'} 
                  name={activePocketData?.name || 'Main Context'} 
                />
              } />
            </Routes>
          </div>

          <Footer activeView={activeView} onViewChange={setActiveView} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
