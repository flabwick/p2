import './Dock.css'

interface DockProps {
  activeView: 'desk' | 'feed' | 'log'
  onViewChange: (view: 'desk' | 'feed' | 'log') => void
}

export function Dock({ activeView, onViewChange }: DockProps) {
  return (
    <footer className="layout-dock">
      <div className="dock-content">
        <div className="dock-placeholder">
          <p>Dock content for {activeView} view</p>
        </div>

        <div className="dock-actions">
          {/* Action buttons for current view */}
        </div>
      </div>
    </footer>
  )
}
