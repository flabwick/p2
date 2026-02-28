import Button from '../ui/Button';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const DebugIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'warning': return WarningIcon;
    case 'error': return ErrorIcon;
    case 'debug': return DebugIcon;
    default: return InfoIcon;
  }
};

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:32:15',
    level: 'info',
    source: 'System',
    message: 'Application started successfully',
    details: 'Version 2.1.0, Build 2024.01.15',
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:32:18',
    level: 'debug',
    source: 'AuthService',
    message: 'Initializing authentication module',
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:32:20',
    level: 'info',
    source: 'Database',
    message: 'Connected to database',
    details: 'Connection pool: 5/10',
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:35:42',
    level: 'warning',
    source: 'Network',
    message: 'High latency detected',
    details: 'Response time: 2.3s (threshold: 2s)',
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:42:11',
    level: 'error',
    source: 'API',
    message: 'Request failed',
    details: 'Status: 500, Endpoint: /api/v1/users',
  },
  {
    id: '6',
    timestamp: '2024-01-15 14:45:30',
    level: 'info',
    source: 'SyncService',
    message: 'Starting data synchronization',
  },
  {
    id: '7',
    timestamp: '2024-01-15 14:45:35',
    level: 'debug',
    source: 'SyncService',
    message: 'Processing 156 items',
  },
  {
    id: '8',
    timestamp: '2024-01-15 14:45:52',
    level: 'info',
    source: 'SyncService',
    message: 'Synchronization completed',
    details: '156 items processed, 3 errors',
  },
  {
    id: '9',
    timestamp: '2024-01-15 15:12:08',
    level: 'warning',
    source: 'Storage',
    message: 'Low disk space warning',
    details: 'Available: 2.1 GB (10% of total)',
  },
  {
    id: '10',
    timestamp: '2024-01-15 15:30:00',
    level: 'info',
    source: 'Scheduler',
    message: 'Scheduled task executed',
    details: 'Task: cleanup-temp-files',
  },
  {
    id: '11',
    timestamp: '2024-01-15 15:45:22',
    level: 'debug',
    source: 'Cache',
    message: 'Cache invalidated',
    details: 'Keys: user_preferences, theme_settings',
  },
  {
    id: '12',
    timestamp: '2024-01-15 16:00:00',
    level: 'info',
    source: 'System',
    message: 'Hourly health check passed',
  },
  {
    id: '13',
    timestamp: '2024-01-15 16:15:30',
    level: 'debug',
    source: 'UI',
    message: 'Main panel body wrapper margin applied: 0 var(--space-xl)',
  },
  {
    id: '14',
    timestamp: '2024-01-15 16:20:45',
    level: 'info',
    source: 'Layout',
    message: 'Margin enforcement confirmed across all viewers',
  },
  {
    id: '15',
    timestamp: '2024-01-15 16:30:12',
    level: 'warning',
    source: 'Performance',
    message: 'Large log list rendering',
    details: 'List size: 15 items',
  },
];

const LogEntryRow = ({ entry, expanded, onToggle }: { entry: LogEntry; expanded: boolean; onToggle: () => void }) => {
  const IconComponent = getLevelIcon(entry.level);
  
  return (
    <div className={`log-entry level-${entry.level}`} onClick={onToggle}>
      <div className="log-entry-main">
        <div className={`log-level-badge ${entry.level}`}>
          <IconComponent />
          <span>{entry.level.toUpperCase()}</span>
        </div>
        <div className="log-timestamp">{entry.timestamp}</div>
        <div className="log-source">[{entry.source}]</div>
        <div className="log-message">{entry.message}</div>
        <div className="log-expand-icon">
          {expanded ? '▼' : '▶'}
        </div>
      </div>
      
      {expanded && entry.details && (
        <div className="log-entry-details">
          <div className="log-details-label">Details:</div>
          <pre className="log-details-content">{entry.details}</pre>
        </div>
      )}
    </div>
  );
};

const LogViewer = ({ pocketId, pocketName }: { pocketId: string; pocketName: string }) => {
  const [logs] = useState<LogEntry[]>(mockLogEntries);
  const [filter, setFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const toggleLogExpand = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const logCounts = {
    all: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
    debug: logs.filter(l => l.level === 'debug').length,
  };

  return (
    <div className="log-viewer">
      <div className="log-entries-container">
        {filteredLogs.map((entry) => (
          <LogEntryRow 
            key={entry.id} 
            entry={entry} 
            expanded={expandedLogs.has(entry.id)}
            onToggle={() => toggleLogExpand(entry.id)}
          />
        ))}
      </div>

      <div className="log-footer">
        <span className="log-status">
          Showing {filteredLogs.length} of {logs.length} entries
        </span>
        <div className="log-actions">
          <Button className="small" variant="secondary">Export</Button>
          <Button className="small" variant="secondary">Clear</Button>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';

export default LogViewer;
