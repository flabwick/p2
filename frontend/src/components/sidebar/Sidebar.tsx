import { useState, useRef, useEffect } from 'react'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMenu } from './SidebarMenu'
import { TabBar } from './TabBar'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onWidthChange?: (width: number) => void
  initialWidth?: number
}

export function Sidebar({ isOpen, onClose, onWidthChange, initialWidth = 320 }: SidebarProps) {
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
      {isOpen && (
        <>
          <div className="sidebar-container" style={{ width: `${sidebarWidth}px` }}>
            <SidebarHeader onClose={onClose} />
            <SidebarMenu />
            <TabBar />
          </div>
          <div
            className="sidebar-resize-handle"
            style={{ left: `${sidebarWidth - 8}px` }}
            onMouseDown={handleMouseDown}
          />
        </>
      )}
    </>
  )
}
