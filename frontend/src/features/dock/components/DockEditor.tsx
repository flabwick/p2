import React, { useEffect } from 'react';
import { useEditor } from '@/features/editor/hooks/useEditor';
import { useDockStore } from '../store/dockStore';
import './DockEditor.css';

export const DockEditor: React.FC = () => {
  const { tabs, activeTabIndex, updateTabContent } = useDockStore();
  const activeTab = tabs[activeTabIndex];
  
  const { containerRef, setContent, view } = useEditor({
    initialContent: activeTab?.content || '',
    onUpdate: (newContent) => {
      if (activeTab) {
        updateTabContent(activeTab.id, newContent);
      }
    }
  });

  // Sync content when active tab changes OR content changes in store
  useEffect(() => {
    if (activeTab && view) {
      const currentDocContent = view.state.doc.toString();
      // Only set content if it's actually different from the view's current content
      // and NOT during an update coming from the editor itself.
      if (currentDocContent !== activeTab.content) {
        setContent(activeTab.content);
      }
    }
  }, [activeTab?.id, activeTab?.content, view, setContent]);

  return (
    <div className="dock-editor-container" ref={containerRef} />
  );
};
