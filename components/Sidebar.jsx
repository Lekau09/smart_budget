import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, faChevronRight,
  faGauge, faMoneyBillTransfer, 
  faChartLine, faBullseye, faCreditCard, faGear 
} from '@fortawesome/free-solid-svg-icons';
import SidebarItem from './SidebarItem';

export default function Sidebar({ isCollapsed, setIsCollapsed, onNavigate, activePage }) {
  const [isOpen, setIsOpen] = useState(true);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsCollapsed(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faGauge },
    { id: 'transactions', label: 'Transactions', icon: faMoneyBillTransfer, badge: null },
    { id: 'analytics', label: 'Analytics', icon: faChartLine },
    { id: 'goals', label: 'Goals', icon: faBullseye },
    { id: 'savings', label: 'Savings', icon: faCreditCard },
    { id: 'settings', label: 'Settings', icon: faGear }
  ];

  const handleNavigation = (itemId) => {
    if (typeof onNavigate === 'function') {
      onNavigate(itemId);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 40,
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 150ms ease',
          boxShadow: 'var(--shadow-md)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="md:hidden"
      >
        <FontAwesomeIcon 
          icon={isOpen ? faChevronLeft : faChevronRight} 
          style={{ fontSize: '16px', color: 'var(--neutral-600)' }}
        />
      </button>

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 30,
        height: '100%',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        width: isCollapsed ? '80px' : '280px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        '@media (min-width: 768px)': {
          position: 'relative',
          transform: 'none'
        }
      }}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 24px',
          height: '80px',
          borderBottom: '1px solid var(--border)',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(11, 95, 255, 0.2)',
            color: 'white',
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            S
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--neutral-900)',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                SmartBudget
              </h1>
              <p style={{
                fontSize: '11px',
                color: 'var(--neutral-500)',
                fontWeight: '600',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>
                Budget Manager
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                isActive={activePage === item.id}
                isCollapsed={isCollapsed}
                onClick={() => handleNavigation(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* Footer - Collapse Button */}
        {!isCollapsed && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px'
          }}>
            <button 
              onClick={() => setIsCollapsed(true)}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--neutral-600)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--neutral-600)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              title="Collapse sidebar"
            >
              <FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: '8px' }} />
              Collapse
            </button>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && window.innerWidth < 768 && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 20,
            display: 'none'
          }}
          className="md:hidden"
          onClick={toggleSidebar}
          role="presentation"
        />
      )}

      <style>{`
        @media (max-width: 767px) {
          button[class*="md:hidden"] {
            display: flex !important;
          }
          div[class*="md:hidden"] {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
