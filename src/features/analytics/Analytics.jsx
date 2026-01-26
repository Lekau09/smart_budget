import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useAuth } from "../../hooks/useAuth";
import { useBudget } from "../../context/BudgetContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingUp, DollarSign, Target, Zap, TrendingDown, AlertCircle } from "lucide-react";
import PageContainer from "../../components/layouts/PageContainer";
import GridSection from "../../components/layouts/GridSection";
import LayoutRow from "../../components/layouts/LayoutRow";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const { user } = useAuth();
  const { budget, expensesByCategory, loading, fetchDashboard } = useBudget();
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    if (user?.id) {
      fetchDashboard(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
        <div style={{ textAlign: "center", color: "var(--slate-600)" }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading analytics…</div>
        </div>
      </div>
    );
  }

  const categories = expensesByCategory || [];
  
  const monthlyData = [
    { month: "Week 1", spent: 2500, budget: 3000 },
    { month: "Week 2", spent: 3200, budget: 3000 },
    { month: "Week 3", spent: 2800, budget: 3000 },
    { month: "Week 4", spent: 1900, budget: 3000 },
  ];

  const totalSpent = Number(budget?.total_spent) || 0;
  const monthlyBudget = Number(budget?.monthly_budget) || 0;
  const remaining = Math.max(monthlyBudget - totalSpent, 0);
  const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  return (
    <PageContainer variant="standard">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: '0.5rem',
          letterSpacing: '-0.5px'
        }}>Analytics</h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.5'
        }}>Understand your spending patterns and financial health</p>
      </div>

      {/* Time Range Selector */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {['7days', '30days', '90days'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* KPI Cards - 4 column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Monthly Budget</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>M{monthlyBudget.toFixed(2)}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Total Spent</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>M{totalSpent.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: percentageUsed > 80 ? 'var(--danger)' : 'var(--text-secondary)' }}>{percentageUsed.toFixed(0)}% used</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Remaining</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: remaining > 0 ? 'var(--success)' : 'var(--danger)' }}>M{remaining.toFixed(2)}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Total Saved</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>M{Number(budget.total_saved || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Budget Usage</h2>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: percentageUsed > 80 ? 'var(--danger)' : 'var(--primary-main)'
          }}>
            {percentageUsed.toFixed(0)}%
          </div>
        </div>
        <div style={{
          height: '6px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: percentageUsed > 80 ? 'var(--danger)' : percentageUsed > 50 ? 'var(--warning)' : 'var(--primary-main)',
            width: `${Math.min(percentageUsed, 100)}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>M{totalSpent.toFixed(2)} spent</span>
          <span>M{monthlyBudget.toFixed(2)} budget</span>
        </div>
      </div>

      {/* Charts Section - 2 column layout */}
      <LayoutRow ratio="equal" gap="lg">
        {/* Spending by Category */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Spending by Category</h2>
            </div>
          </div>

          {categories.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `M${Number(v).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>No spending data available yet</p>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Spending Trend</h2>
            </div>
          </div>

          {monthlyData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    formatter={(v) => `M${Number(v).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="spent" stroke={COLORS[0]} name="Spent" strokeWidth={2} dot={{ fill: COLORS[0], r: 4 }} />
                  <Line type="monotone" dataKey="budget" stroke={COLORS[1]} name="Budget" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: COLORS[1], r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>No trend data available yet</p>
            </div>
          )}
        </div>
      </LayoutRow>

      {/* Category Breakdown Table */}
      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Spending by Category</h2>
        </div>

        {categories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: '0.5rem' }}>
            {categories.map((cat, idx) => {
              const progress = cat.value > 0 ? (cat.value / totalSpent) * 100 : 0;
              return (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: '0.5rem' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: '0.5rem' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: COLORS[idx % COLORS.length]
                      }} />
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '13px' }}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>M{Number(cat.value).toFixed(2)}</span>
                  </div>
                  <div style={{
                    height: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: COLORS[idx % COLORS.length],
                      width: `${progress}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {progress.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No category data available</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
