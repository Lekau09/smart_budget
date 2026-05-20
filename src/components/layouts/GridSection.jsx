import React from 'react';

/**
 * GridSection - Flexible grid-based layout section
 * Desktop-first: 2-3 columns on desktop, responsive on smaller screens
 * Replaces excessive vertical stacking with horizontal organization
 */
const GridSection = ({ 
  children, 
  cols = 'auto', // 'auto', '2', '3', '4' or '12' (for 12-col grid)
  gap = 'lg', // 'xs', 'sm', 'md', 'lg', 'xl'
  className = ''
}) => {
  // Map cols to grid classes
  const colsMap = {
    'auto': 'grid-cols-auto',  // auto-fit columns
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
    '12': 'grid-cols-12'
  };

  // Map gap to spacing classes
  const gapMap = {
    'xs': 'gap-xs',
    'sm': 'gap-sm',
    'md': 'gap-md',
    'lg': 'gap-lg',
    'xl': 'gap-xl'
  };

  return (
    <div 
      className={`grid-section ${colsMap[cols] || colsMap.auto} ${gapMap[gap] || gapMap.lg} ${className}`}
    >
      {children}
    </div>
  );
};

export default GridSection;
