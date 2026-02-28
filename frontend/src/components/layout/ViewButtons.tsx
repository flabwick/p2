import './ViewButtons.css'

interface ViewButtonsProps {
  activeView: 'desk' | 'feed' | 'log'
  onViewChange: (view: 'desk' | 'feed' | 'log') => void
}

export function ViewButtons({ activeView, onViewChange }: ViewButtonsProps) {
  return (
    <div className="view-buttons">
      <button
        className={`view-button ${activeView === 'desk' ? 'active' : ''}`}
        onClick={() => onViewChange('desk')}
        title="Desk View"
      >
        <DeskIcon />
      </button>
      
      <button
        className={`view-button ${activeView === 'feed' ? 'active' : ''}`}
        onClick={() => onViewChange('feed')}
        title="Feed View"
      >
        <FeedIcon />
      </button>
      
      <button
        className={`view-button ${activeView === 'log' ? 'active' : ''}`}
        onClick={() => onViewChange('log')}
        title="Log View"
      >
        <LogIcon />
      </button>
    </div>
  )
}

// ============ ICONS ============
function DeskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
      <line x1="10" y1="45" x2="90" y2="45" strokeWidth="10" />
      <line x1="30" y1="45" x2="30" y2="80" />
      <line x1="70" y1="45" x2="70" y2="80" />
    </svg>
  )
}

function FeedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
      <line x1="20" y1="30" x2="80" y2="30" strokeWidth="8" />
      <line x1="20" y1="50" x2="80" y2="50" strokeWidth="8" />
      <line x1="20" y1="70" x2="80" y2="70" strokeWidth="8" />
    </svg>
  )
}

function LogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
      <rect x="25" y="20" width="55" height="65" />
      <rect x="20" y="28" width="8" height="8" />
      <rect x="20" y="48" width="8" height="8" />
      <rect x="20" y="68" width="8" height="8" />
    </svg>
  )
}
