import React, { useState } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './VaultSidebar.css';

// Icons from version 1 sidebar
const FolderOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const FileCodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const FileImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const FileDataIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function VaultSidebar() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });

  // File tree structure from version 1
  interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    extension?: string;
    children?: FileNode[];
  }

  const vaultTree: FileNode = {
    id: 'root',
    name: 'Vault',
    type: 'folder',
    children: [
      {
        id: 'docs',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'doc1', name: 'README.md', type: 'file', extension: 'md' },
          { id: 'doc2', name: 'SPEC.md', type: 'file', extension: 'md' },
          { id: 'doc3', name: 'report.pdf', type: 'file', extension: 'pdf' },
        ],
      },
      {
        id: 'code',
        name: 'Code',
        type: 'folder',
        children: [
          { id: 'code1', name: 'main.py', type: 'file', extension: 'py' },
          { id: 'code2', name: 'utils.js', type: 'file', extension: 'js' },
          { id: 'code3', name: 'styles.css', type: 'file', extension: 'css' },
        ],
      },
      {
        id: 'images',
        name: 'Images',
        type: 'folder',
        children: [
          { id: 'img1', name: 'screenshot.png', type: 'file', extension: 'png' },
          { id: 'img2', name: 'mockup.jpg', type: 'file', extension: 'jpg' },
        ],
      },
      { id: 'data', name: 'data.json', type: 'file', extension: 'json' },
      { id: 'config', name: 'config.yaml', type: 'file', extension: 'yaml' },
    ],
  };

  const getFileIcon = (type: 'folder' | 'file', extension?: string) => {
    if (type === 'folder') return <FolderOpenIcon />;
    
    switch (extension) {
      case 'md':
      case 'txt':
      case 'pdf':
        return <FileTextIcon />;
      case 'py':
      case 'js':
      case 'tsx':
      case 'css':
      case 'html':
        return <FileCodeIcon />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImageIcon />;
      case 'json':
      case 'csv':
      case 'xlsx':
      case 'yaml':
      case 'yml':
        return <FileDataIcon />;
      default:
        return <FileIcon />;
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    });
  };

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const hasChildren = isFolder && node.children && node.children.length > 0;
    const isClickable = isFolder && hasChildren;

    return (
      <div key={node.id}>
        <div
          className={`vault-tree-item ${isClickable ? 'clickable' : ''}`}
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => isClickable && toggleFolder(node.id)}
        >
          {isFolder && hasChildren ? (
            <div className="vault-tree-toggle">
              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </div>
          ) : (
            <div className="vault-tree-spacer" />
          )}
          <div className="vault-tree-icon">
            {getFileIcon(node.type, node.extension)}
          </div>
          <span className="vault-tree-name">{node.name}</span>
        </div>
        {isFolder && hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => (
              <FileTreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vault-sidebar">
      <CustomScrollbar className="sidebar-content">
        <div className="sidebar-section">
          <div className="vault-header">
            <h3 className="vault-title">Vault</h3>
          </div>
          <div className="vault-tree">
            {vaultTree.children && vaultTree.children.map((node) => (
              <FileTreeNode key={node.id} node={node} level={0} />
            ))}
          </div>
        </div>
      </CustomScrollbar>
    </div>
  );
}
