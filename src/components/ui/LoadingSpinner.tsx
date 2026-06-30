import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  overlay = false,
  label = 'Loading...',
}) => {
  const sizeMap = { sm: 20, md: 36, lg: 52 };
  const px = sizeMap[size];

  const spinner = (
    <div className={`spinner-wrap spinner-${size}`} role="status" aria-label={label}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="18" cy="18" r="14" stroke="var(--border-default)" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r="14"
          stroke="var(--color-primary-500)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="88"
          strokeDashoffset="66"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          style={{ transformOrigin: 'center', originX: '18px', originY: '18px' }}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="spinner-overlay" aria-busy="true">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
