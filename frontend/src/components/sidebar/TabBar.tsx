import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tab, TabType } from '../../types/tabs'
import './TabBar.css'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onReorderTabs: (tabs: Tab[]) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  onDuplicateTab: (id: string) => void
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  tabId: string | null;
}

interface TooltipState {
  x: number;
  y: number;
  visible: boolean;
  title: string;
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
    <circle cx="60" cy="79" r="10" fill="currentColor"/>
  </svg>
)

const FileIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
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

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const PdfIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const TextIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const getIcon = (tab: Tab, index: number) => {
  const iconStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center' };
  switch (tab.type) {
    case 'pocket': return <PocketIcon />
    case 'file': {
      const ext = tab.fileExtension?.toLowerCase();
      switch (ext) {
        case 'pocket':
          return <span style={{ ...iconStyle, color: 'var(--accent-burnt-orange)' }}><PocketIcon /></span>;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
          return <span style={{ ...iconStyle, color: '#3b82f6' }}><ImageIcon /></span>;
        case 'pdf':
          return <span style={{ ...iconStyle, color: '#ef4444' }}><PdfIcon /></span>;
        case 'epub':
          return <span style={{ ...iconStyle, color: '#10b981' }}><BookIcon /></span>;
        case 'txt':
        case 'md':
        case 'json':
        case 'rtf':
        case 'text':
          return <span style={{ ...iconStyle, color: '#f59e0b' }}><TextIcon /></span>;
        default:
          return <span style={iconStyle}><FileIcon /></span>;
      }
    }
    case 'role': return <RoleIcon />
    case 'welcome': return <WelcomeIcon />
    default: return (index + 1)
  }
}

interface TabItemProps {
  tab: Tab;
  index: number;
  activeTabId: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, tabId: string) => void;
  onMouseEnter?: (e: React.MouseEvent, tab: Tab) => void;
  onMouseLeave?: () => void;
  listeners?: any;
  attributes?: any;
}

const TabItem = ({ 
  tab, 
  index, 
  activeTabId, 
  isDragging, 
  style, 
  onSelectTab, 
  onCloseTab,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  listeners, 
  attributes 
}: TabItemProps) => {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloseTab) {
      onCloseTab(tab.id);
    }
  };

  return (
    <div 
      style={style}
      className={`tab-item ${tab.type} ${activeTabId === tab.id ? 'active' : ''} ${isDragging ? 'dragging' : ''}`} 
      title={""} // Override default title to use our custom tooltip
      onClick={() => onSelectTab?.(tab.id)}
      onContextMenu={(e) => onContextMenu?.(e, tab.id)}
      onMouseEnter={(e) => onMouseEnter?.(e, tab)}
      onMouseLeave={() => onMouseLeave?.()}
      {...attributes}
      {...listeners}
    >
      <span className="tab-number">
        {getIcon(tab, index)}
      </span>
      {!isDragging && (
        <button 
          className="tab-close-btn" 
          onClick={handleClose}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

interface SortableTabProps {
  tab: Tab;
  index: number;
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, tabId: string) => void;
  onMouseEnter: (e: React.MouseEvent, tab: Tab) => void;
  onMouseLeave: () => void;
}

function SortableTab({ tab, index, activeTabId, onSelectTab, onCloseTab, onContextMenu, onMouseEnter, onMouseLeave }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TabItem 
        tab={tab}
        index={index}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        listeners={listeners}
        attributes={attributes}
      />
    </div>
  );
}

export function TabBar({ tabs, activeTabId, onSelectTab, onReorderTabs, onAddTab, onCloseTab, onDuplicateTab }: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, tabId: null });
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, visible: false, title: '' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTooltip(prev => ({ ...prev, visible: false })); // Hide tooltip on context menu
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, tabId });
  };

  const handleMouseEnter = (e: React.MouseEvent, tab: Tab) => {
    if (activeId || contextMenu.visible) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.right + 10;
    const y = rect.top + (rect.height / 2);

    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    
    tooltipTimeout.current = window.setTimeout(() => {
      setTooltip({ x, y, visible: true, title: tab.title });
    }, 400); // "A moment" delay
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.visible]);

  useEffect(() => {
    if (contextMenu.visible && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const rect = menu.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let { x, y } = contextMenu;
      if (x + rect.width > screenWidth) x = screenWidth - rect.width - 5;
      if (y + rect.height > screenHeight) y = screenHeight - rect.height - 5;
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setTooltip(prev => ({ ...prev, visible: false })); // Hide tooltip on drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id);
      const newIndex = tabs.findIndex((t) => t.id === over.id);
      onReorderTabs(arrayMove(tabs, oldIndex, newIndex));
    }
    
    setActiveId(null);
  };

  const activeTab = tabs.find(t => t.id === activeId);
  const activeIndex = tabs.findIndex(t => t.id === activeId);

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.3',
        },
      },
    }),
  };

  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;

    const clickedTab = tabs.find(t => t.id === contextMenu.tabId);
    const isWelcome = clickedTab?.type === 'welcome';

    const content = (
      <div 
        className="vault-context-menu" 
        ref={contextMenuRef}
        style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
      >
        {!isWelcome && (
          <>
            <button className="context-menu-item" onClick={() => {
              onDuplicateTab(contextMenu.tabId!);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}>Duplicate</button>
            <div className="context-menu-divider" />
          </>
        )}
        <button className="context-menu-item danger" onClick={() => {
          onCloseTab(contextMenu.tabId!);
          setContextMenu(prev => ({ ...prev, visible: false }));
        }}>Close</button>
      </div>
    );

    return createPortal(content, document.body);
  };

  const renderTooltip = () => {
    if (!tooltip.visible || activeId || contextMenu.visible) return null;

    const content = (
      <div 
        className="sidebar-tab-tooltip"
        style={{ 
          position: 'fixed', 
          left: tooltip.x, 
          top: tooltip.y,
          transform: 'translateY(-50%)'
        }}
      >
        {tooltip.title}
      </div>
    );

    return createPortal(content, document.body);
  };

  return (
    <div className="sidebar-tabs">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext 
          items={tabs.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tabs.map((tab, index) => (
            <SortableTab 
              key={tab.id}
              tab={tab}
              index={index}
              activeTabId={activeTabId}
              onSelectTab={onSelectTab}
              onCloseTab={onCloseTab}
              onContextMenu={handleContextMenu}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeId && activeTab ? (
            <TabItem 
              tab={activeTab}
              index={activeIndex}
              activeTabId={activeTabId}
              isDragging
              onCloseTab={onCloseTab}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <div 
        className="tab-item add-tab" 
        title="Add Tab"
        onClick={onAddTab}
        onMouseEnter={(e) => handleMouseEnter(e, { id: 'add', title: 'Add Tab', type: 'welcome' })}
        onMouseLeave={handleMouseLeave}
      >
        <span className="tab-number">+</span>
      </div>

      {renderContextMenu()}
      {renderTooltip()}
    </div>
  )
}
