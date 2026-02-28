import React from 'react';

export const DeskViewer: React.FC = () => {
  return (
    <div className="viewer-container">
      <h2>Desk Viewer</h2>
      <div className="feed-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="feed-card">
            <h3>Document_{i}.pdf</h3>
            <p>Physical file reference for document {i} with metadata and storage location.</p>
          </div>
        ))}
      </div>
    </div>
  );
};
