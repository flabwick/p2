import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: React.CSSProperties;
};

// Standardized button with 90s keyboard press animation
export const Button = ({ children, onClick, active, title, className = '', variant = 'primary', style }: ButtonProps) => {
  const isSmall = className.includes('small');
  const isSquare = className.includes('square');
  const isProminent = className.includes('prominent');
  
  const getVariantStyles = (): React.CSSProperties => {
    // When active, use the active color scheme
    if (active) {
      return {
        background: 'var(--accent-deep-teal)',
        color: 'var(--paper-ivory)',
        border: 'var(--border-medium)',
      };
    }
    
    if (variant === 'secondary') {
      return {
        background: 'var(--paper-cream)',
        color: 'var(--ink-black)',
        border: 'var(--border-medium)',
      };
    }
    
    if (variant === 'ghost') {
      return {
        background: 'transparent',
        color: 'var(--ink-medium)',
        border: '1px solid transparent',
        boxShadow: 'none',
      };
    }
    
    // Primary variant (not active) - subtle highlight for prominent buttons
    if (isProminent) {
      return {
        background: 'var(--paper-cream)',
        color: 'var(--ink-black)',
        border: 'var(--border-medium)',
      };
    }
    
    // Regular primary (not active)
    return {
      background: 'var(--paper-ivory)',
      color: 'var(--ink-black)',
      border: 'var(--border-medium)',
    };
  };

  const variantStyles = getVariantStyles();

  // For square/prominent buttons, ensure proper sizing
  const sizeStyle = isSquare || isProminent
    ? { 
        width: isSmall ? 28 : (isProminent ? 44 : 40), 
        height: isSmall ? 28 : (isProminent ? 44 : 40),
        padding: 0,
        flexShrink: 0,
      } 
    : {};

  return (
    <motion.button
      className={`std-button ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
      whileTap={{ 
        y: 2
      }}
      style={{
        ...variantStyles,
        boxShadow: 'none',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: isSmall ? '0.75rem' : '0.875rem',
        minWidth: isSquare ? (isSmall ? 28 : 40) : undefined,
        ...sizeStyle,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
