import { ReactNode } from 'react'
import { Dock } from './Dock'
import './MainPanel.css'

interface MainPanelProps {
  children?: ReactNode
  activeView?: 'desk' | 'feed' | 'log'
  onViewChange?: (view: 'desk' | 'feed' | 'log') => void
}

export function MainPanel({ children, activeView = 'desk', onViewChange }: MainPanelProps) {
  return (
    <div className="layout-main-container">
      <main className="layout-main-panel">
        {children || (
          <div className="main-placeholder">
            <h2>Main Panel</h2>
            <p>Content goes here</p>
          </div>
        )}
      </main>
      <Dock activeView={activeView} onViewChange={onViewChange || (() => {})} />
    </div>
  )
}
