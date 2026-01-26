import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

export default function Header({ onSetBudget, currentBudget, activePeriod, setActivePeriod }) {
  const periods = ['week', 'month', 'year'];

  return (
    <header className="sticky top-0 z-20 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: Title Area */}
          <div className="flex-1">
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--neutral-900)',
              margin: 0,
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              Budget Dashboard
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--neutral-500)',
              margin: 0,
              fontWeight: '500'
            }}>
              Manage your finances and track spending
            </p>
          </div>

          {/* Right: Period Selector & Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Period Selector */}
            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '6px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              {periods.map(period => (
                <button
                  key={period}
                  onClick={() => setActivePeriod && setActivePeriod(period)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    backgroundColor: activePeriod === period ? 'var(--surface)' : 'transparent',
                    color: activePeriod === period ? 'var(--primary)' : 'var(--neutral-600)',
                    boxShadow: activePeriod === period ? 'var(--shadow-sm)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activePeriod !== period) {
                      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePeriod !== period) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                className="relative p-2.5 hover:bg-surface-secondary rounded-full transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                title="Notifications"
              >
                <FontAwesomeIcon 
                  icon={faBell} 
                  style={{
                    fontSize: '18px',
                    color: 'var(--neutral-600)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--surface)',
                  transform: 'translate(4px, -4px)'
                }}>
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
