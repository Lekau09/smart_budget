import React from 'react';

/**
 * EmptyState — reusable empty state component
 * Usage: <EmptyState icon="💸" title="No transactions yet"
 *          subtitle="Forward a bank SMS to get started"
 *          action="Add Expense" onAction={() => {}} />
 */
export default function EmptyState({ icon, title, subtitle, action, onAction, compact }) {
  return (
    <div className="empty-state" style={ compact ? { padding:'20px 16px' } : {} }>
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {action && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
