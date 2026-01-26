import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function SetBudgetModal({ isOpen, onClose, onSave, currentBudget }) {
  const [budget, setBudget] = useState(currentBudget || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(budget) > 0) {
      onSave(parseFloat(budget));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} role="presentation" />
      <div className="relative bg-surface rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Set Monthly Budget</h2>
          <button 
            onClick={onClose}
            className="btn-ghost btn-icon"
            aria-label="Close dialog"
            title="Close this dialog"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label className="form-label">
              Budget Amount (M)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input"
              placeholder="Enter your monthly budget..."
              required
              aria-label="Budget amount"
            />
            <div className="form-hint">
              Set your target monthly spending limit
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              aria-label="Cancel setting budget"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              aria-label="Save monthly budget"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
