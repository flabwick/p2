import { Tab, TabType } from '../../types/tabs'
import './TabBar.css'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
}

const PocketIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 120 140" 
    width="21" 
    height="21" 
    style={{ marginTop: '-2px' }}
  >
    <path d="M 15 58 L 15 92 Q 15 118 60 125 Q 105 118 105 92 L 105 58"
          fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M 15 58 Q 15 34 60 47 Q 105 34 105 58 Q 82 73 60 79 Q 38 73 15 58 Z"
          fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <circle cx="60" cy="79" r="12" fill="currentColor" opacity="0.2"/>
    <circle cx="60" cy="79" r="10" fill="none" stroke="currentColor" strokeWidth="6"/>
  </svg>
)

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

const RoleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const WelcomeIcon = () => (
  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>?</span>
)

export function TabBar({ tabs, activeTabId, onSelectTab, onAddTab }: TabBarProps) {
  const getIcon = (type: TabType) => {
    switch (type) {
      case 'pocket': return <PocketIcon />
      case 'file': return <FileIcon />
      case 'role': return <RoleIcon />
      case 'welcome': return <WelcomeIcon />
      default: return null
    }
  }

  return (
    <div className="sidebar-tabs">
      {tabs.map((tab, index) => (
        <div 
          key={tab.id}
          className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`} 
          title={tab.title}
          onClick={() => onSelectTab(tab.id)}
        >
          <span className="tab-number">
            {getIcon(tab.type) || (index + 1)}
          </span>
        </div>
      ))}
      <div 
        className="tab-item add-tab" 
        title="Add Tab"
        onClick={onAddTab}
      >
        <span className="tab-number">+</span>
      </div>
    </div>
  )
}
