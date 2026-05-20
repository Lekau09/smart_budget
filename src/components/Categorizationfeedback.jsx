/**
 * CategorizationFeedback
 * A small animated confirmation that slides in from the bottom-right
 * after a transaction is categorized — gives the user HCI feedback.
 *
 * Usage in Transactions.jsx:
 *   import CategorizationFeedback from '../../components/CategorizationFeedback';
 *   const [feedback, setFeedback] = useState(null);
 *
 *   // After successful categorization:
 *   setFeedback({ store: item.description, category: category });
 *
 *   // In JSX:
 *   <CategorizationFeedback data={feedback} onDone={() => setFeedback(null)} />
 */

import React, { useEffect } from 'react';
import { Check, Brain } from 'lucide-react';

const CAT_COLORS = {
  Food:          '#EF4444',
  Groceries:     '#F59E0B',
  Transport:     '#3B82F6',
  Entertainment: '#8B5CF6',
  Health:        '#10B981',
  Utilities:     '#FBBF24',
  Shopping:      '#EC4899',
  Subscriptions: '#06B6D4',
  Other:         '#64748B',
};

export default function CategorizationFeedback({ data, onDone }) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [data]);

  if (!data) return null;

  const color = CAT_COLORS[data.category] || '#64748B';

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      background: 'var(--bg-primary)',
      border: `1.5px solid ${color}`,
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      animation: 'cfSlideIn 300ms cubic-bezier(0.34,1.56,0.64,1)',
      maxWidth: 300,
    }}>
      {/* Category color circle with check */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: color + '15',
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Check size={16} color={color} strokeWidth={2.5} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          Categorized as {data.category}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.store || 'Transaction'} saved
        </p>
        {data.aiLearning && (
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8B5CF6',
            display: 'flex', alignItems: 'center', gap: 4 }}>
            <Brain size={11} /> AI is learning from this
          </p>
        )}
      </div>

      <style>{`
        @keyframes cfSlideIn {
          from { transform: translateX(120px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}