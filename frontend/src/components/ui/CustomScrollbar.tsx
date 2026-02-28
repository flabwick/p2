import React from 'react';
import './CustomScrollbar.css';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A reusable scrollbar component with subtle, minimal styling
 * consistent with the app's aesthetic.
 */
export function CustomScrollbar({ children, className = '' }: CustomScrollbarProps) {
  return (
    <div className={`custom-scrollbar ${className}`}>
      {children}
    </div>
  );
}
