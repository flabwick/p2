import { useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutState } from '../../hooks/useLayoutState';
import './Header.styles.css';

type ViewType = 'desk' | 'feed' | 'log';

type HeaderProps = {
  children?: ReactNode;
  activeView?: ViewType;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    className="header-arrow-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    {direction === 'left' ? (
      <path d="M15 18l-6-6 6-6" />
    ) : (
      <path d="M9 18l6-6-6-6" />
    )}
  </svg>
);

const Header = ({ children, activeView = 'desk', isSidebarOpen = false, onToggleSidebar }: HeaderProps) => {
  const { activePocket, setActivePocket, pockets } = useLayoutState();
  const [isPocketBarExpanded, setIsPocketBarExpanded] = useState(false);

  const activePocketData = pockets.find(p => p.id === activePocket) || pockets[0];

  const handlePocketSelect = (pocketId: string) => {
    setActivePocket(pocketId);
    setIsPocketBarExpanded(false);
  };

  const handleTogglePocketBar = () => {
    setIsPocketBarExpanded(!isPocketBarExpanded);
  };

  return (
    <header className="header-container">
      {/* Sidebar Toggle Button - no movement on press */}
      <button
        className="header-sidebar-toggle"
        onClick={onToggleSidebar}
        title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        type="button"
      >
        <ArrowIcon direction={isSidebarOpen ? 'left' : 'right'} />
      </button>

      <div className="header-content">
        {/* Pocket Tabs Bar */}
        <div className="pockets-wrapper">
          <div
            className={`header-pocket-tabs ${isPocketBarExpanded ? 'expanded' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Active Pocket Tab (always visible) */}
            <button
              className="header-active-tab"
              onClick={handleTogglePocketBar}
              type="button"
              title={isPocketBarExpanded ? "Collapse tabs" : "Expand tabs"}
            >
              <span className="header-tab-label">{activePocketData?.name || 'Main Context'}</span>
              <ArrowIcon direction={isPocketBarExpanded ? 'up' : 'down'} />
            </button>

            {/* Expandable Tabs */}
            <AnimatePresence>
              {isPocketBarExpanded && pockets.length > 0 && (
                <motion.div
                  className="header-all-tabs"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="header-tabs-container">
                    {pockets.map((pocket) => (
                      <button
                        key={pocket.id}
                        className={`header-tab ${activePocket === pocket.id ? 'active' : ''}`}
                        onClick={() => handlePocketSelect(pocket.id)}
                        type="button"
                      >
                        <span className="header-tab-name">{pocket.name}</span>
                        <span className="header-tab-count">{pocket.items || 0}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="header-add-tab"
                    type="button"
                    title="Add new pocket"
                  >
                    <span>+</span>
                    <span>Add Pocket</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
