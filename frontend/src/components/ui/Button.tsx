import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  className?: string;
};

// Standardized button with 90s keyboard press animation
export const Button = ({ children, onClick, active, title, className = '' }: ButtonProps) => {
  return (
    <motion.button
      className={`std-button ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
      whileTap={{ 
        y: 3,
        boxShadow: '0 0 0 transparent'
      }}
      whileHover={{ 
        y: -1,
        boxShadow: '0 4px 0 var(--depth-color)'
      }}
      style={{
        background: active ? 'var(--accent-deep-teal)' : 'var(--paper-ivory)',
        color: active ? 'var(--paper-ivory)' : 'var(--ink-black)',
        border: 'var(--border-medium)',
        boxShadow: '0 4px 0 var(--depth-color)',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s'
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
