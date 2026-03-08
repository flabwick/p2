interface MobileWelcomeViewProps {
  onSelect: (type: string) => void
}

export const MobileWelcomeView = ({ onSelect }: MobileWelcomeViewProps) => {
  return (
    <div className="mobile-welcome-view mobile-text">
      <div className="mobile-welcome-content">
        <div className="mobile-welcome-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h1>Welcome to P2</h1>
        <p className="mobile-text-small">Your mobile document workspace</p>
        
        <div className="mobile-welcome-actions">
          <button 
            className="mobile-button"
            onClick={() => onSelect('pocket')}
          >
            Create Pocket
          </button>
          <button 
            className="mobile-button"
            onClick={() => onSelect('file')}
          >
            Open File
          </button>
        </div>
      </div>
    </div>
  )
}
