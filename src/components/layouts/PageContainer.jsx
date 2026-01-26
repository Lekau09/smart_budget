import React from 'react';

/**
 * PageContainer - Wraps all page content with proper spacing and max-width
 * Provides consistent padding and responsive margins across desktop/mobile
 * NO narrow max-width constraints - uses full available width on desktop
 */
const PageContainer = ({ 
  children, 
  variant = 'standard', // 'standard', 'compact', 'full'
  className = '' 
}) => {
  // variant: standard = normal padding, compact = less padding, full = edge-to-edge
  const variantClasses = {
    standard: 'page-container-standard',
    compact: 'page-container-compact',
    full: 'page-container-full'
  };

  return (
    <div className={`page-container ${variantClasses[variant] || variantClasses.standard} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
