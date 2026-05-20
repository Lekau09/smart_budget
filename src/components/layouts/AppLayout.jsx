import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from './Navbar';

/**
 * AppLayout - Master layout component
 * Provides persistent sidebar + top navbar + main content area
 * Desktop-first, responsive structure
 */
const AppLayout = ({ 
  children, 
  sidebarCollapsed = false, 
  onSidebarToggle 
}) => {
  return (
    <div className="app-layout">
      {/* Left Sidebar - Persistent on desktop, collapsible */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={onSidebarToggle}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Navigation Bar */}
        <Navbar onToggle={onSidebarToggle} />

        {/* Page Content - Scrollable area */}
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
