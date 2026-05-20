import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, X } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function AlertBanner({ userId, totalSpent, monthlyBudget }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (userId && monthlyBudget > 0) {
      fetch(`${API_BASE}/budget-alerts.php?user_id=${userId}`).catch(() => {});
    }
  }, [userId, totalSpent]);

  if (!monthlyBudget || monthlyBudget <= 0 || dismissed) return null;

  const pct       = (totalSpent / monthlyBudget) * 100;
  const remaining = monthlyBudget - totalSpent;

  let alert = null;

  if (pct >= 100) {
    alert = {
      bg: '#fef2f2', border: '#ef4444',
      icon: <AlertTriangle size={15} color="#ef4444" />,
      text: `Budget exceeded by M${(totalSpent - monthlyBudget).toFixed(2)}`,
      sub:  'You have spent more than your monthly budget.',
      color: '#ef4444', barColor: '#ef4444',
    };
  } else if (pct >= 90) {
    alert = {
      bg: '#fff7ed', border: '#f97316',
      icon: <AlertTriangle size={15} color="#f97316" />,
      text: `${pct.toFixed(0)}% of budget used — critical`,
      sub:  `Only M${remaining.toFixed(2)} remaining this month.`,
      color: '#f97316', barColor: '#f97316',
    };
  } else if (pct >= 75) {
    alert = {
      bg: '#fffbeb', border: '#f59e0b',
      icon: <TrendingUp size={15} color="#f59e0b" />,
      text: `${pct.toFixed(0)}% of budget used`,
      sub:  `M${remaining.toFixed(2)} left this month.`,
      color: '#f59e0b', barColor: '#f59e0b',
    };
  } else if (pct >= 50) {
    alert = {
      bg: '#f0fdf4', border: '#10b981',
      icon: <CheckCircle size={15} color="#10b981" />,
      text: `On track — ${pct.toFixed(0)}% used`,
      sub:  `M${remaining.toFixed(2)} remaining. Good pace.`,
      color: '#10b981', barColor: '#10b981',
    };
  }

  if (!alert) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '10px 14px', marginBottom: 14,
      background: alert.bg,
      border: `1px solid ${alert.border}`,
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {alert.icon}
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: alert.color }}>
            {alert.text}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
            {alert.sub}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 72, height: 5, background: 'rgba(0,0,0,0.08)',
          borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${Math.min(pct, 100)}%`,
            background: alert.barColor,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <button onClick={() => setDismissed(true)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 2, display: 'flex',
          alignItems: 'center',
        }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}