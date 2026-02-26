import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutState } from '../../hooks/useLayoutState';
import Button from '../ui/Button';

type HeaderProps = {
  children?: ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  const { activePocket, setActivePocket, pockets } = useLayoutState();
  const [isPocketMenuOpen, setIsPocketMenuOpen] = useState(false);

  const handlePocketSelect = (pocketId: string) => {
    setActivePocket(pocketId);
    setIsPocketMenuOpen(false);
  };

  return (
    <header className="layout-header">
      <div className="header-content">
        {/* Pockets indicator */}
        <div className="pockets-wrapper">
          <Button 
            className="square" 
            onClick={() => setIsPocketMenuOpen(!isPocketMenuOpen)}
          >
            <span className="pocket-count">[{pockets.length}]</span>
          </Button>

          <AnimatePresence>
            {isPocketMenuOpen && (
              <motion.div
                className="pocket-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  background: 'var(--paper-ivory)', 
                  border: 'var(--border-thick)',
                  boxShadow: 'var(--depth-offset) var(--depth-offset) 0 var(--depth-color)'
                }}
              >
                <div className="menu-content">
                  {pockets.length === 0 ? (
                    <div className="no-pockets">No opened pockets</div>
                  ) : (
                    pockets.map((pocket) => (
                      <Button
                        key={pocket.id}
                        className="menu-item"
                        onClick={() => handlePocketSelect(pocket.id)}
                        active={activePocket === pocket.id}
                      >
                        <span className="menu-item-label">{pocket.name}</span>
                        <span className="menu-item-count">{pocket.items || 0} items</span>
                      </Button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="header-bottom-border" />
    </header>
  );
};

export default Header;
