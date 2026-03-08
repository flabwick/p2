import React from 'react';

export const LogViewer: React.FC = () => {
  return (
    <div className="viewer-container">
      <h2>Log Viewer</h2>
      <div className="canvas-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="canvas-card">
            <h3>System_Log_2026-02-28_T{i}:00</h3>
            <p>Process ID: {1000 + i} | Status: OK | Margin Test: SUCCESS</p>
          </div>
        ))}
      </div>
    </div>
  );
};
