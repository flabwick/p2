import Button from '../ui/Button';

type ViewType = 'desk' | 'feed' | 'log';

interface FooterProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Footer = ({ activeView, onViewChange }: FooterProps) => {
  return (
    <footer className="layout-footer">
      <div className="footer-content">
        <div className="view-toggle">
          <Button
            className="view-toggle-btn"
            active={activeView === 'desk'}
            onClick={() => onViewChange('desk')}
          >
            Desk
          </Button>
          <Button
            className="view-toggle-btn"
            active={activeView === 'feed'}
            onClick={() => onViewChange('feed')}
          >
            Feed
          </Button>
          <Button
            className="view-toggle-btn secondary"
            active={activeView === 'log'}
            onClick={() => onViewChange('log')}
          >
            Log
          </Button>
        </div>
      </div>
      <div className="footer-bottom-border" />
    </footer>
  );
};

export default Footer;
