import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBudget } from '../../context/BudgetContext';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  TrendingDown,
  AlertCircle,
  Coffee, ShoppingCart, Bus, Heart, ShoppingBag, HelpCircle, BarChart2, CreditCard
} from "lucide-react";
import PageContainer from "../../components/layouts/PageContainer";
import GridSection from "../../components/layouts/GridSection";
import LayoutRow from "../../components/layouts/LayoutRow";

const CATEGORY_COLORS = {
  Food: '#EF4444', Groceries: '#F59E0B', Transport: '#3B82F6',
  Entertainment: '#8B5CF6', Health: '#10B981', Utilities: '#FBBF24',
  Shopping: '#EC4899', Subscriptions: '#06B6D4', Other: '#64748B',
};
const CATEGORY_ICONS = {
  Food: Coffee, Groceries: ShoppingCart, Transport: Bus,
  Entertainment: Zap, Health: Heart, Utilities: Zap,
  Shopping: ShoppingBag, Subscriptions: CreditCard, Other: HelpCircle,
};
const STANDARD = ['Food','Groceries','Transport','Entertainment','Health','Utilities','Shopping','Subscriptions','Other'];

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      padding: '18px 20px', background: 'var(--bg-primary)',
      border: `1px solid var(--border-light)`, borderRadius: 'var(--radius-lg)',
      borderTop: `3px solid ${accent||'var(--primary-main)'}`,
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px',
        textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const { budget, expenses, expensesByCategory, loading, fetchDashboard, fetchPrediction, prediction } = useBudget();

  const {
    predicted_spend,
    predicted_deviation,
    confidence,
    months_used,
    prediction_method,
    loading: predictionLoading,
    error: predictionError,
  } = prediction || {};

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  useEffect(() => {
    if (user?.id)
      fetchDashboard(user.id, { month: selectedMonth, year: selectedYear });
  }, [user?.id, selectedMonth, selectedYear]);

  useEffect(() => {
    const handler = e => {
      const { month, year } = e.detail || {};
      if (month) setSelectedMonth(month);
      if (year) setSelectedYear(year);
    };
    window.addEventListener('periodChanged', handler);
    return () => window.removeEventListener('periodChanged', handler);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPrediction(user.id);
    }
  }, [user?.id, fetchPrediction]); // fetchPrediction is now stable (useCallback)

  const categories = (() => {
    const m = {};
    STANDARD.forEach(c => { m[c] = 0; });
    (expensesByCategory || []).forEach(c => {
      const k = STANDARD.includes(c.name||c.category) ? (c.name||c.category) : 'Other';
      m[k] += Number(c.value) || 0;
    });
    return STANDARD.map(n => ({ name: n, value: m[n] })).filter(i => i.value > 0);
  })();

  const monthlyBudget = Number(budget?.monthly_budget) || 0;
  const totalSpent = Number(budget?.total_spent) || 0;
  const totalSaved = Number(budget?.total_saved) || 0;
  const remaining = Math.max(monthlyBudget - totalSpent - totalSaved, 0);
  const pctUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const weeklyBudget = monthlyBudget / 4;

  const weeklyData = (() => {
    const w = [
      { name: 'Wk 1', spent: 0, budget: weeklyBudget },
      { name: 'Wk 2', spent: 0, budget: weeklyBudget },
      { name: 'Wk 3', spent: 0, budget: weeklyBudget },
      { name: 'Wk 4', spent: 0, budget: weeklyBudget },
    ];
    (expenses || []).forEach(e => {
      const day = new Date(e.date).getDate();
      const idx = Math.min(Math.floor((day - 1) / 7), 3);
      w[idx].spent += Number(e.amount) || 0;
    });
    return w;
  })();

  const fmt = v => `M${Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  if (loading) return (
    <PageContainer variant="standard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[...Array(4)].map((_,i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    </PageContainer>
  );

  return (
    <PageContainer variant="standard">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Understand your spending patterns and financial health
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard label="Monthly Budget" value={fmt(monthlyBudget)} sub="Allocated" accent="#3B82F6" />
        <StatCard label="Total Spent" value={fmt(totalSpent)} sub={`${pctUsed.toFixed(0)}% used`} accent={pctUsed > 80 ? '#EF4444' : '#F59E0B'} />
        <StatCard label="Remaining" value={fmt(remaining)} sub={remaining > 0 ? 'Available' : 'Over budget'} accent={remaining > 0 ? '#10B981' : '#EF4444'} />
        <StatCard label="Total Saved" value={fmt(totalSaved)} sub="Across all goals" accent="#8B5CF6" />
      </div>

      {/* Predicted Spend Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--primary-main)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              Predicted Spend
            </h2>
            {prediction_method && prediction_method !== 'ml_model' && (
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--warning, #F59E0B)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Estimate
              </span>
            )}
          </div>
        </div>

        {predictionLoading ? (
          <div className="skeleton" style={{ height: 60 }}></div>
        ) : predictionError ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 8,
            padding: '20px 0',
            textAlign: 'center'
          }}>
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
              {predictionError.includes('Insufficient data') || predictionError.includes('No budget set')
                ? 'Not enough data to generate prediction. Add expenses for at least 4 months and set a monthly budget.'
                : predictionError
              }
            </p>
          </div>
        ) : predicted_spend ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {fmt(predicted_spend)}
                </span>
              </div>
              <div style={{
                background: predicted_deviation > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: predicted_deviation > 0 ? 'var(--danger)' : 'var(--success)',
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {predicted_deviation > 0 ? '+' : ''}{fmt(Math.abs(predicted_deviation))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Budget: {fmt(monthlyBudget)}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Predicted: {fmt(predicted_spend)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((predicted_spend / monthlyBudget) * 100, 100)}%`,
                  height: '100%',
                  background: predicted_deviation > 0 ? 'var(--danger)' : 'var(--success)',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }}></div>
              </div>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
              {months_used >= 4 ? (
                <>Model confidence: {Math.round((confidence || 0) * 100)}% based on {months_used || 0} months of data</>
              ) : (
                <>Preliminary estimate • {Math.round((confidence || 0) * 100)}% confidence • {months_used || 0} month{(months_used !== 1) ? 's' : ''} of data</>
              )}
              {prediction_method && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  ({prediction_method.replace(/_/g, ' ')})
                </span>
              )}
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Not enough data. Add expenses for at least 4 months to get predictions.
          </p>
        )}
      </div>

      {/* Charts row */}
      <LayoutRow ratio="equal" gap="lg">
        {/* Spending by category � bar chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending by Category</h2>
          </div>
          {categories.length > 0 ? (
            <>
              <div style={{ height: 240, marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0,4,4,0]} maxBarSize={18}>
                      {categories.map((c,i) => (<Cell key={i} fill={CATEGORY_COLORS[c.name]||'#64748B'} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map((c,i) => {
                  const total = categories.reduce((s,x)=>s+x.value,0);
                  const pct = total > 0 ? Math.round((c.value/total)*100) : 0;
                  const Icon = CATEGORY_ICONS[c.name] || HelpCircle;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c.name]||'#64748B', flexShrink: 0 }} />
                        <Icon size={13} style={{ color: CATEGORY_COLORS[c.name]||'#64748B' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(c.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <BarChart2 size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
              No spending data yet
            </div>
          )}
        </div>

        {/* Weekly spending trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Weekly Spending</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs budget</span>
          </div>
          <div style={{ height: 240, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v=>`M${v}`} width={60} />
                <Tooltip formatter={v=>fmt(v)} contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 12 }} />
                <Line type="monotone" dataKey="spent" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Spent" />
                <Line type="monotone" dataKey="budget" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#9CA3AF', r: 3 }} name="Budget" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 24, height: 2, background: '#3B82F6', display: 'inline-block', borderRadius: 2 }} />
              Spent
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 24, height: 2, background: '#D1D5DB', display: 'inline-block', borderRadius: 2, borderTop: '2px dashed #D1D5DB' }} />
              Budget
            </span>
          </div>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {weeklyData.map((w,i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center', borderTop: `2px solid ${w.spent > w.budget ? '#EF4444' : '#10B981'}` }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{w.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>M{w.spent.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </LayoutRow>
    </PageContainer>
  );
}
