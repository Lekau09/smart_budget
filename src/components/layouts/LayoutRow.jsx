import React from 'react';

/**
 * LayoutRow - Horizontal layout row for side-by-side content
 * Useful for 2-column layouts (e.g., filters + content, summary + chart)
 */
const LayoutRow = ({ 
  children, 
  ratio = 'equal', // 'equal', '1-2', '2-1', '1-3', '3-1', '2-3', '3-2'
  gap = 'lg',
  className = ''
}) => {
  const ratioMap = {
    'equal': 'row-ratio-equal',     // 1fr 1fr
    '1-2': 'row-ratio-1-2',         // 1fr 2fr
    '2-1': 'row-ratio-2-1',         // 2fr 1fr
    '1-3': 'row-ratio-1-3',         // 1fr 3fr
    '3-1': 'row-ratio-3-1',         // 3fr 1fr
    '2-3': 'row-ratio-2-3',         // 2fr 3fr
    '3-2': 'row-ratio-3-2'          // 3fr 2fr
  };

  const gapMap = {
    'xs': 'gap-xs',
    'sm': 'gap-sm',
    'md': 'gap-md',
    'lg': 'gap-lg',
    'xl': 'gap-xl'
  };

  return (
    <div 
      className={`layout-row ${ratioMap[ratio] || ratioMap.equal} ${gapMap[gap] || gapMap.lg} ${className}`}
    >
      {children}
    </div>
  );
};

export default LayoutRow;
