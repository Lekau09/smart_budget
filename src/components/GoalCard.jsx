import React, { useState } from 'react';
import './GoalCard.css';

/**
 * Professional fintech-grade goal card component
 * Features:
 * - Compact collapsed state showing essential info
 * - Smooth expand/collapse animation
 * - Semantic progress colors
 * - Only one card expanded at a time
 * - Keyboard accessible
 */
export default function GoalCard({
  goal,
  isExpanded,
  onToggle,
  onAddSavings,
  onDelete,
  onEdit,
  onUpdate
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate progress percentage
  const progress = goal.target_amount
    ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100
    : 0;

  // Calculate remaining amount
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  // Determine progress color based on percentage
  const getProgressColor = (percent) => {
    if (percent <= 0) return 'neutral';
    if (percent <= 30) return 'neutral';
    if (percent <= 70) return 'primary';
    if (percent < 100) return 'amber';
    return 'success';
  };

  // Determine status label
  const getStatus = () => {
    if (progress >= 100) return 'Completed';
    if (goal.deadline) {
      const daysLeft = Math.ceil(
        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft < 0) return 'Behind';
      // Calculate if on track based on time and progress
      const daysTotal = Math.ceil(
        (new Date(goal.deadline) - new Date(goal.created_at)) / (1000 * 60 * 60 * 24)
      );
      const expectedProgress = (
        ((daysTotal - daysLeft) / daysTotal) * 100
      );
      if (progress >= expectedProgress * 0.9) return 'On Track';
      return 'Behind';
    }
    return 'On Track';
  };

  const handleKeyDown = (e) => {
    // Allow Enter or Space to expand/collapse
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const status = getStatus();
  const statusColor = status === 'Completed' ? 'success' : status === 'Behind' ? 'danger' : 'neutral';

  return (
    <div
      className={`goal-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
    >
      {/* Collapsed State Content */}
      <div className="goal-card-collapsed">
        {/* Header: Goal Name and Percentage */}
        <div className="goal-card-header">
          <h3 className="goal-card-title">{goal.goal_name}</h3>
          <div className="goal-card-percentage">{progress.toFixed(0)}%</div>
        </div>

        {/* Progress Bar */}
        <div className="goal-card-progress-wrapper">
          <div className={`goal-card-progress-bar ${getProgressColor(progress)}`}>
            <div
              className="goal-card-progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Amounts: Saved / Target */}
        <div className="goal-card-amounts">
          <span className="goal-card-amount">
            M{Number(goal.current_amount).toFixed(2)} / M{Number(goal.target_amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Expanded State Content */}
      {isExpanded && (
        <div className="goal-card-expanded">
          {/* Divider */}
          <div className="goal-card-divider" />

          {/* Details Grid */}
          <div className="goal-card-details">
            {/* Saved Amount */}
            <div className="goal-card-detail-item">
              <div className="goal-card-detail-label">Saved</div>
              <div className="goal-card-detail-value">M{Number(goal.current_amount).toFixed(2)}</div>
            </div>

            {/* Target Amount */}
            <div className="goal-card-detail-item">
              <div className="goal-card-detail-label">Target</div>
              <div className="goal-card-detail-value">M{Number(goal.target_amount).toFixed(2)}</div>
            </div>

            {/* Remaining */}
            <div className="goal-card-detail-item">
              <div className="goal-card-detail-label">Remaining</div>
              <div className={`goal-card-detail-value ${remaining <= 0 ? 'completed' : ''}`}>
                M{Math.max(remaining, 0).toFixed(2)}
              </div>
            </div>

            {/* Status */}
            <div className="goal-card-detail-item">
              <div className="goal-card-detail-label">Status</div>
              <div className={`goal-card-status ${statusColor}`}>{status}</div>
            </div>

            {/* Deadline (if present) */}
            {goal.deadline && (
              <div className="goal-card-detail-item">
                <div className="goal-card-detail-label">Deadline</div>
                <div className="goal-card-detail-value">
                  {new Date(goal.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="goal-card-actions">
            <button
              className="goal-card-btn goal-card-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(goal);
              }}
              title="Edit this goal"
            >
              ✎ Edit
            </button>
            <button
              className="goal-card-btn goal-card-btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                onAddSavings(goal);
              }}
              title="Add savings to this goal"
            >
              + Add Savings
            </button>
            <button
              className="goal-card-btn goal-card-btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${goal.goal_name}"?`)) {
                  onDelete(goal.id);
                }
              }}
              title="Delete this goal"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
