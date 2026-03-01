import { useState, useRef, useEffect } from 'react'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMenu } from './SidebarMenu'
import { TabBar } from './TabBar'
import { Tab } from '../../types/tabs'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onWidthChange?: (width: number) => void
  initialWidth?: number
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  onWidthChange, 
  initialWidth = 320,
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab
}: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  useEffect(() => {
    onWidthChange?.(sidebarWidth)
  }, [sidebarWidth, onWidthChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = sidebarWidth
    
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const deltaX = e.clientX - startX.current
      const newWidth = Math.max(200, Math.min(600, startWidth.current + deltaX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  return (
    <>
      <div 
        className={`sidebar-container ${!isOpen ? 'collapsed' : ''}`} 
        style={{ width: `${isOpen ? sidebarWidth : 48}px` }}
      >
        {isOpen && <SidebarHeader onClose={onClose} />}
        {isOpen && <SidebarMenu />}
        <TabBar 
          tabs={tabs} 
          activeTabId={activeTabId} 
          onSelectTab={onSelectTab} 
          onAddTab={onAddTab} 
        />
      </div>
      {isOpen && (
        <div
          className="sidebar-resize-handle"
          style={{ left: `${sidebarWidth - 8}px` }}
          onMouseDown={handleMouseDown}
        />
      )}
    </>
  )
}
