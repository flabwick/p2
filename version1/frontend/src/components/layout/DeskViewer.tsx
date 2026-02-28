import { useState } from 'react';
import Button from '../ui/Button';

interface FileCard {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  preview?: string;
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('pdf') || type.includes('doc')) return DocIcon;
  return FileIcon;
};

const mockFiles: FileCard[] = [
  { id: '1', name: 'design-spec.pdf', type: 'application/pdf', size: '2.4 MB', date: '2024-01-15' },
  { id: '2', name: 'screenshot.png', type: 'image/png', size: '1.2 MB', date: '2024-01-14', preview: 'image' },
  { id: '3', name: 'notes.txt', type: 'text/plain', size: '4 KB', date: '2024-01-13' },
  { id: '4', name: 'report.docx', type: 'application/docx', size: '890 KB', date: '2024-01-12' },
  { id: '5', name: 'banner.jpg', type: 'image/jpeg', size: '3.1 MB', date: '2024-01-11', preview: 'image' },
  { id: '6', name: 'data.json', type: 'application/json', size: '156 KB', date: '2024-01-10' },
  { id: '7', name: 'presentation.pptx', type: 'application/pptx', size: '5.6 MB', date: '2024-01-09' },
  { id: '8', name: 'config.yaml', type: 'text/yaml', size: '2 KB', date: '2024-01-08' },
  { id: '9', name: 'photo.jpg', type: 'image/jpeg', size: '2.8 MB', date: '2024-01-07', preview: 'image' },
  { id: '10', name: 'readme.md', type: 'text/markdown', size: '12 KB', date: '2024-01-06' },
  { id: '11', name: 'archive.zip', type: 'application/zip', size: '15 MB', date: '2024-01-05' },
  { id: '12', name: 'script.js', type: 'text/javascript', size: '34 KB', date: '2024-01-04' },
  { id: '13', name: 'budget.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: '45 KB', date: '2024-01-03' },
  { id: '14', name: 'backup.sql', type: 'application/sql', size: '1.2 GB', date: '2024-01-02' },
  { id: '15', name: 'logo-v2.svg', type: 'image/svg+xml', size: '15 KB', date: '2024-01-01', preview: 'image' },
  { id: '16', name: 'specs-v2.pdf', type: 'application/pdf', size: '3.1 MB', date: '2023-12-31' },
  { id: '17', name: 'team-photo.png', type: 'image/png', size: '4.5 MB', date: '2023-12-30', preview: 'image' },
  { id: '18', name: 'todo.txt', type: 'text/plain', size: '1 KB', date: '2023-12-29' },
];

const FileCardComponent = ({ file }: { file: FileCard }) => {
  const IconComponent = getFileIcon(file.type);
  
  return (
    <div className="desk-file-card">
      <div className="file-card-header">
        <div className="file-card-icon">
          <IconComponent />
        </div>
        <div className="file-card-actions">
          <Button className="square small" title="Open">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Button>
          <Button className="square small" title="More options">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </div>
      </div>
      
      {file.preview === 'image' && (
        <div className="file-card-preview">
          <div className="file-preview-placeholder">
            <ImageIcon />
          </div>
        </div>
      )}
      
      <div className="file-card-info">
        <h4 className="file-card-name">{file.name}</h4>
        <div className="file-card-meta">
          <span className="file-size">{file.size}</span>
          <span className="file-date">{file.date}</span>
        </div>
      </div>
      
      <div className="file-card-footer">
        <Button className="small" variant="secondary">View</Button>
        <Button className="small" variant="secondary">Edit</Button>
      </div>
    </div>
  );
};

const DeskViewer = ({ pocketId, pocketName }: { pocketId: string; pocketName: string }) => {
  const [files] = useState<FileCard[]>(mockFiles);

  return (
    <div className="desk-viewer">
      <div className="desk-files-list">
        {files.map((file) => (
          <FileCardComponent key={file.id} file={file} />
        ))}
      </div>
      
      <div className="desk-footer">
        <span className="desk-status">Showing {files.length} files</span>
        <span className="desk-total-size">Total: ~40 MB</span>
      </div>
    </div>
  );
};

export default DeskViewer;
