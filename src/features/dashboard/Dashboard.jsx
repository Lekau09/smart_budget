import React, { useEffect, useState } from 'react';
import useUserAuth from '../../hooks/useUserAuth';
import { useBudget } from '../../context/BudgetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, TrendingDown, Wallet, PiggyBank, Plus, Target, TrendingUp, ChevronRight } from 'lucide-react';
import PageContainer from '../../components/layouts/PageContainer';
import GridSection from '../../components/layouts/GridSection';
import LayoutRow from '../../components/layouts/LayoutRow';
import SetBudgetModal from '../../components/SetBudgetModal';
import AddExpenseModal from '../../../components/AddExpenseModal';
import { useNotification } from '../../context/NotificationContext';

// Chart colors - vibrant palette for different categories
const CATEGORY_COLORS = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Entertainment': '#FFE66D',
  'Shopping': '#95E1D3',
  'Utilities': '#A8E6CF',
  'Health': '#FF8B94',
  'Education': '#73A8FF',
  'Salary': '#90EE90',
  'Income': '#90EE90',
  'Other': '#B19CD9',
  'Groceries': '#FF6B6B',
  'Electricity': '#A8E6CF',
  'Water': '#87CEEB',
  'Internet': '#87CEEB'
};

const CHART_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#A8E6CF', '#FF8B94', '#73A8FF', '#B19CD9'];

function KPICard({ title, amount, stat, icon: Icon, isLoading }) {
  if (isLoading) {
    return (
      <div className="kpi-card">
        <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
        <div className="skeleton skeleton-amount" style={{ marginTop: '1rem' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '0.5rem' }}></div>
      </div>
    );
  }

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <h3 className="kpi-card-title">{title}</h3>
        {Icon && <div className="kpi-card-icon"><Icon size={16} /></div>}
      </div>
      <p className="kpi-card-amount">{amount}</p>
      <p className={`kpi-card-stat ${stat.type}`}>{stat.label}</p>
    </div>
  );
}

function SkeletonTransaction() {
  return <div className="skeleton skeleton-transaction"></div>;
}

function TransactionItem({ transaction }) {
  const isExpense = Number(transaction.amount) > 0;
  const date = new Date(transaction.date);
  const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Get category color
  const categoryColors = {
    'Food': '#F59E0B',
    'Transport': '#3B82F6',
    'Entertainment': '#8B5CF6',
    'Shopping': '#EC4899',
    'Utilities': '#10B981',
    'Health': '#F87171',
    'Education': '#6366F1',
    'Other': '#6B7280'
  };
  
  const categoryColor = categoryColors[transaction.category] || '#6B7280';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      backgroundColor: 'var(--surface-secondary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      transition: 'all 200ms ease',
      cursor: 'pointer',
      marginBottom: '8px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--surface)';
      e.currentTarget.style.borderColor = categoryColor + '30';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: 0
      }}>
        {/* Category Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: categoryColor + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: categoryColor,
          flexShrink: 0,
          fontSize: '18px'
        }}>
          {isExpense ? (
            <TrendingDown size={20} />
          ) : (
            <Wallet size={20} />
          )}
        </div>
        
        {/* Transaction Details */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          minWidth: 0,
          flex: 1
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {transaction.description || 'Transaction'}
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)'
          }}>
            <span>{transaction.category || 'Other'}</span>
            <span>•</span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
      
      {/* Amount */}
      <p style={{
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-bold)',
        color: isExpense ? '#EF4444' : '#10B981',
        margin: 0,
        whiteSpace: 'nowrap',
        marginLeft: '12px'
      }}>
        {isExpense ? '−' : '+'}M{Math.abs(Number(transaction.amount)).toFixed(2)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUserAuth();
  const { budget, expenses, expensesByCategory, goals, loading, fetchDashboard, updateBudget } = useBudget();
  const { addNotification } = useNotification();
  const [error, setError] = useState('');
  const [timePeriod, setTimePeriod] = useState('month');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [budgetOverflowNotified, setBudgetOverflowNotified] = useState(false);

  console.log('🎯 Dashboard rendering - budget:', budget);

  useEffect(() => {
    if (user?.id) {
      fetchDashboard(user.id);
    }
  }, [user?.id]);

  // Watch for budget overflow
  useEffect(() => {
    const spent = Number(budget?.total_spent) || 0;
    const budgetAmount = Number(budget?.monthly_budget) || 0;
    
    if (budgetAmount > 0 && spent > budgetAmount && !budgetOverflowNotified) {
      const excess = (spent - budgetAmount).toFixed(2);
      addNotification(`You've exceeded your budget by M${excess}!`, 'warning', false);
      setBudgetOverflowNotified(true);
    } else if (spent <= budgetAmount) {
      setBudgetOverflowNotified(false);
    }
  }, [budget, budgetOverflowNotified, addNotification]);

  const formatCurrency = (value) => {
    const n = Number(value) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleBudgetUpdated = (newBudget) => {
    // Budget is already updated in context, just show notification
    addNotification('Budget updated successfully', 'success');
  };

  // Safely extract data from budget object with fallbacks
  const monthlyBudget = Number(budget?.monthly_budget) || 0;
  const totalSpent = Number(budget?.total_spent) || 0;
  // Calculate total saved from goals' current_amount, not from budget
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
  
  const spent = totalSpent;
  const remaining = monthlyBudget - (spent + totalSaved);
  const saved = totalSaved;
  const percentSpent = monthlyBudget > 0 ? Math.round((spent / monthlyBudget) * 100) : 0;

  console.log('🎯 Dashboard values:', { monthlyBudget, totalSpent, totalSaved, spent, remaining, saved, percentSpent, goalsCount: goals.length });

  // Prepare chart data from expensesByCategory with category-specific colors
  const chartData = (expensesByCategory || []).map((cat, idx) => {
    const categoryName = cat.name || cat.category || 'Other';
    const categoryColor = CATEGORY_COLORS[categoryName] || CHART_COLORS[idx % CHART_COLORS.length];
    return {
      name: categoryName,
      value: Number(cat.value) || 0,
      color: categoryColor
    };
  }).filter(item => item.value > 0);

  const recentTransactions = expenses.slice(0, 5) || [];

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(214, 69, 69, 0.1)',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '4px solid var(--danger)'
        }}>
          <p style={{ color: 'var(--danger)', fontWeight: 600, margin: 0 }}>Error Loading Dashboard</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer variant="standard">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '0.5rem'
          }}>Financial Overview</h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            margin: 0
          }}>Track your spending and savings with detailed insights</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}>
            {['week', 'month', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: timePeriod === period ? 'var(--primary)' : 'transparent',
                  color: timePeriod === period ? 'white' : 'var(--text-primary)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBudgetModal(true)}
          >
            <Calendar size={16} />
            Set Budget
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddExpenseModal(true)}
            style={{ backgroundColor: 'var(--success)', border: 'none' }}
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards - Fixed 4-column grid on desktop, responsive on mobile */}
      <div className="kpi-summary-grid">
        <KPICard
          title="Total Budget"
          amount={loading ? '' : `M${formatCurrency(monthlyBudget)}`}
          stat={{ type: 'neutral', label: 'Monthly allocation' }}
          icon={Wallet}
          isLoading={loading}
        />
        <KPICard
          title="Amount Spent"
          amount={loading ? '' : `M${formatCurrency(spent)}`}
          stat={{ type: percentSpent > 80 ? 'negative' : 'neutral', label: `${percentSpent}% of budget` }}
          icon={TrendingDown}
          isLoading={loading}
        />
        <KPICard
          title="Total Saved"
          amount={loading ? '' : `M${formatCurrency(saved)}`}
          stat={{ type: saved > 0 ? 'positive' : 'neutral', label: saved > 0 ? 'On track' : 'No savings yet' }}
          icon={PiggyBank}
          isLoading={loading}
        />
        <KPICard
          title="Remaining Budget"
          amount={loading ? '' : `M${formatCurrency(remaining)}`}
          stat={{ type: remaining > 0 ? 'positive' : 'negative', label: remaining > 0 ? 'Available' : 'Over budget' }}
          icon={Wallet}
          isLoading={loading}
        />
      </div>

      {/* Main Data Sections - 2 column layout on desktop */}
      <LayoutRow ratio="equal" gap="lg">
        {/* Expense Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h2 className="card-title">Expense Breakdown</h2>
            <select style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer'
            }}>
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>

          {loading ? (
            <div className="skeleton skeleton-chart"></div>
          ) : chartData.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}>
              <div style={{
                width: '100%',
                height: '300px',
                marginBottom: '1.5rem'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `M${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.75rem'
              }}>
                {chartData.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color
                      }}></div>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text-primary)'
                      }}>{item.name}</span>
                    </div>
                    <span style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)'
                    }}>M{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No expense data available</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Transactions</h2>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0'
              }}>
                Latest {recentTransactions.length} transactions
              </p>
            </div>
            <a href="/app/transactions" style={{
              fontSize: 'var(--font-size-sm)',
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              transition: 'color 0.2s ease',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block'
            }} 
            onMouseEnter={(e) => {
              e.target.style.color = '#1d4ed8';
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }} 
            onMouseLeave={(e) => {
              e.target.style.color = '#3b82f6';
              e.target.style.backgroundColor = 'transparent';
            }}>
              View All →
            </a>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...Array(3)].map((_, i) => (
                <SkeletonTransaction key={i} />
              ))}
            </div>
          ) : recentTransactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {recentTransactions.slice(0, 5).map((transaction, idx) => (
                <TransactionItem key={idx} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Wallet size={28} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0'
              }}>
                No transactions yet
              </p>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Start tracking your expenses to see them here
              </p>
            </div>
          )}
        </div>
      </LayoutRow>

      {/* Savings Goals Quick View */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Your Savings Goals</h2>
          <a href="/savings" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary-main)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer'
          }}>
            View All →
          </a>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '80px' }}></div>
            ))}
          </div>
        ) : goals && goals.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {goals.slice(0, 3).map((goal, idx) => {
              const progressPercent = Math.min(
                (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
                100
              );
              const remaining = Number(goal.target_amount) - Number(goal.current_amount);

              return (
                <div key={idx} style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                  e.currentTarget.style.borderColor = 'var(--primary-main)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '13px',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                      flex: 1
                    }}>
                      {goal.goal_name}
                    </h3>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'white',
                      backgroundColor: 'var(--primary-main)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      marginLeft: '0.5rem'
                    }}>
                      {Math.round(progressPercent)}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent >= 75 ? '#10B981' : progressPercent >= 50 ? '#F59E0B' : 'var(--primary-main)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem'
                  }}>
                    <span>M{Number(goal.current_amount).toFixed(2)} / M{Number(goal.target_amount).toFixed(2)}</span>
                    <span style={{ color: progressPercent >= 75 ? '#10B981' : progressPercent >= 50 ? '#F59E0B' : 'var(--primary-main)' }}>
                      M{remaining.toFixed(2)} remaining
                    </span>
                  </div>

                  <a href="/savings" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--primary-main)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: 'var(--font-weight-semibold)',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-main)'}
                  >
                    <Plus size={14} /> Add Savings
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Target size={28} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0'
            }}>
              No savings goals yet
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              <a href="/savings" style={{ color: 'var(--primary-main)', textDecoration: 'none' }}>Create your first goal</a> to start saving for what matters
            </p>
          </div>
        )}
      </div>

      <SetBudgetModal 
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        currentBudget={budget}
        userId={user?.id}
        onBudgetUpdated={handleBudgetUpdated}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAdd={() => {
          fetchDashboard(user?.id);
          addNotification('Expense added successfully!', 'success');
        }}
      />
    </PageContainer>
  );
}
