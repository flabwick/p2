import React from 'react';

export const FeedViewer: React.FC = () => {
  return (
    <div className="viewer-container">
      <h2>Feed Viewer</h2>
      <div className="feed-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="feed-card">
            <h3>Feed Event #{i}</h3>
            <p>This is a simulated feed event showing enforcement of the invisible but strict margin. Note how this card's border starts exactly at the margin boundary.</p>
          </div>
        ))}
      </div>
    </div>
  );
};
