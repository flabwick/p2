// Custom SVG icons
const TabIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z"></path>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  </svg>
)

interface MobileTabCounterProps {
  tabCount: number
  onClick: () => void
}

export const MobileTabCounter = ({ tabCount, onClick }: MobileTabCounterProps) => {
  return (
    <div className="mobile-tab-counter mobile-touch-target" onClick={onClick}>
      <div className="mobile-tab-counter-icon">
        <TabIcon />
      </div>
      <div className="mobile-tab-counter-badge mobile-text-small">
        {tabCount}
      </div>
    </div>
  )
}
