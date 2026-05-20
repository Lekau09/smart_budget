import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export default function BudgetTracker({ userId, initialBudget = 5000 }) {
  const [budget, setBudget] = useState(initialBudget);
  const [spent, setSpent] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadBudgetData();
    }
  }, [userId]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      // Fetch from your backend API
      const response = await fetch(`/api/get-budget.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setBudget(data.budget || initialBudget);
        setSpent(data.spent || 0);
        setCategoryBreakdown(data.breakdown || {});
      }
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const remaining = budget - spent;
  const percentUsed = (spent / budget) * 100;
  const isOverBudget = remaining < 0;

  const getWarningColor = () => {
    if (isOverBudget) return '#DC2626'; // Red
    if (percentUsed > 80) return '#EA580C'; // Orange
    if (percentUsed > 60) return '#FBBF24'; // Yellow
    return '#10B981'; // Green
  };

  const categories = [
    { name: 'Food', icon: '🍴', color: '#FF6B6B' },
    { name: 'Groceries', icon: '🛒', color: '#4ECDC4' },
    { name: 'Transport', icon: '🚌', color: '#FFE66D' },
    { name: 'Entertainment', icon: '🎭', color: '#A8D8EA' },
    { name: 'Health', icon: '💊', color: '#AA96DA' },
    { name: 'Utilities', icon: '⚡', color: '#FCBAD3' },
    { name: 'Shopping', icon: '🛍️', color: '#A0C4FF' },
    { name: 'Other', icon: '❓', color: '#D4D4D8' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          💰 Budget Dashboard
        </h2>
        <button
          onClick={loadBudgetData}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Budget Display */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Total Budget */}
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.9 }}>
              Total Budget
            </p>
            <p style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              M{budget.toFixed(2)}
            </p>
          </div>

          {/* Total Spent */}
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.9 }}>
              Total Spent
            </p>
            <p style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF6B6B'
            }}>
              M{spent.toFixed(2)}
            </p>
          </div>

          {/* Remaining */}
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.9 }}>
              Remaining
            </p>
            <p style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: isOverBudget ? '#FF6B6B' : '#4ADE80'
            }}>
              M{remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: getWarningColor(),
              height: '100%',
              width: `${Math.min(percentUsed, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            opacity: 0.9
          }}>
            {percentUsed.toFixed(1)}% of budget used
          </p>
        </div>

        {/* Warning if over budget */}
        {isOverBudget && (
          <div style={{
            background: 'rgba(255,107,107,0.2)',
            border: '1px solid #FF6B6B',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            color: '#FFE0E0'
          }}>
            <AlertCircle size={18} />
            <span>⚠️ Budget exceeded by M{Math.abs(remaining).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: 0.9
        }}>
          📊 Spending by Category
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          {categories.map((cat) => {
            const amount = categoryBreakdown[cat.name] || 0;
            const pct = budget > 0 ? (amount / budget) * 100 : 0;
            return (
              <div
                key={cat.name}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                  {cat.icon}
                </div>
                <p style={{
                  margin: '0 0 6px 0',
                  fontSize: '11px',
                  opacity: 0.8
                }}>
                  {cat.name}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: amount > 0 ? '#FFE0B2' : 'rgba(255,255,255,0.5)'
                }}>
                  M{amount.toFixed(2)}
                </p>
                {amount > 0 && (
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '10px',
                    opacity: 0.7
                  }}>
                    {pct.toFixed(1)}% of total
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
