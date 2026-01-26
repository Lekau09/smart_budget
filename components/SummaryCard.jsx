import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SummaryCard({ 
  icon, 
  title, 
  value, 
  subValue,
  progress = 0,
  progressColor = 'var(--success)',
  isPrimary = false,
  isEmpty = false,
  isOverBudget = false
}) {
  return (
    <div style={{
      background: isPrimary 
        ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' 
        : 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: isPrimary ? 'none' : '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: isPrimary 
        ? '0 10px 28px rgba(11, 95, 255, 0.12)' 
        : 'var(--shadow-sm)',
      transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      cursor: 'pointer',
      minHeight: '200px',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = isPrimary 
        ? '0 16px 40px rgba(11, 95, 255, 0.18)' 
        : 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-4px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = isPrimary 
        ? '0 10px 28px rgba(11, 95, 255, 0.12)' 
        : 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Decorative Background Element */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: isPrimary 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(11, 95, 255, 0.05)',
        opacity: 0.5
      }} />

      {/* Header: Title + Icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{
          fontSize: '12px',
          fontWeight: '700',
          color: isPrimary ? 'rgba(255, 255, 255, 0.85)' : 'var(--neutral-600)',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          {title}
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isPrimary 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'var(--primary-light)',
          flexShrink: 0,
          backdropFilter: 'blur(8px)'
        }}>
          <FontAwesomeIcon 
            icon={icon} 
            style={{
              fontSize: '18px',
              color: isPrimary ? '#fff' : 'var(--primary)'
            }}
          />
        </div>
      </div>

      {/* Value Section */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: isPrimary ? '#fff' : 'var(--neutral-900)',
          margin: '0 0 6px 0',
          letterSpacing: '-0.7px',
          lineHeight: 1
        }}>
          {value}
        </div>
        <p style={{
          fontSize: '13px',
          color: isPrimary ? 'rgba(255, 255, 255, 0.75)' : 'var(--neutral-500)',
          margin: 0,
          fontWeight: '500'
        }}>
          {subValue}
        </p>
      </div>

      {/* Progress Bar */}
      {progress > 0 && !isEmpty && (
        <div style={{ 
          marginTop: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            height: '8px',
            background: isPrimary 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'var(--surface-secondary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              background: progressColor,
              borderRadius: 'var(--radius-full)',
              transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 0 16px ${progressColor}50`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            </div>
          </div>
          <p style={{
            fontSize: '12px',
            color: isPrimary 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'var(--neutral-600)',
            margin: '8px 0 0 0',
            fontWeight: '600'
          }}>
            {Math.round(progress)}% Complete
          </p>
        </div>
      )}

      {/* Over Budget Indicator */}
      {isOverBudget && (
        <div style={{
          fontSize: '12px',
          color: '#fff',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(239, 68, 68, 0.15)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          Over budget
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
