import { useState } from 'react'
import './TabBar.css'

export function TabBar() {
  const [activeTab, setActiveTab] = useState(1)

  const handleTabClick = (tabNumber: number) => {
    setActiveTab(tabNumber)
  }

  const handleAddTab = () => {
    // Add tab functionality here
    console.log('Add new tab')
  }

  return (
    <div className="sidebar-tabs">
      <div 
        className={`tab-item ${activeTab === 1 ? 'active' : ''}`} 
        title="Tab 1"
        onClick={() => handleTabClick(1)}
      >
        <span className="tab-number">1</span>
      </div>
      <div 
        className={`tab-item ${activeTab === 2 ? 'active' : ''}`} 
        title="Tab 2"
        onClick={() => handleTabClick(2)}
      >
        <span className="tab-number">2</span>
      </div>
      <div 
        className={`tab-item ${activeTab === 3 ? 'active' : ''}`} 
        title="Tab 3"
        onClick={() => handleTabClick(3)}
      >
        <span className="tab-number">3</span>
      </div>
      <div 
        className={`tab-item ${activeTab === 4 ? 'active' : ''}`} 
        title="Tab 4"
        onClick={() => handleTabClick(4)}
      >
        <span className="tab-number">4</span>
      </div>
      <div 
        className="tab-item add-tab" 
        title="Add Tab"
        onClick={handleAddTab}
      >
        <span className="tab-number">+</span>
      </div>
    </div>
  )
}
