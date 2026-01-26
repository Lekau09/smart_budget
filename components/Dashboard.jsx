import React, { useEffect, useState } from 'react';
import FixedHeader from './FixedHeader';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPiggyBank, faChartLine, faWallet, faCoins
} from '@fortawesome/free-solid-svg-icons';
import SummaryCard from './SummaryCard';
import ExpenseChart from './ExpenseChart';
import RecentTransactions from './RecentTransactions';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard({ onSetBudget }) {
  const { user } = useAuth();
  const { budget, expenses, expensesByCategory, loading, updateBudget } = useBudget();
  const [activePeriod, setActivePeriod] = useState('month');

  // Safe currency formatter
  const formatCurrency = (value) => {
    const n = Number(value);
    if (!isFinite(n)) return 'M0.00';
    return `M${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Budget calculation clarification:
  // Total budget = Set budget (monthly_budget)
  // Amount spent = Sum of transactions/expenses (total_spent)
  // Monthly spending = Amount saved for a particular product (total_saved)
  // Remaining budget = Total budget - (Amount spent + Monthly spending)

  const totalBudget = Number(budget?.monthly_budget) || 0;
  const amountSpent = Number(budget?.total_spent) || 0;
  const monthlySaving = Number(budget?.total_saved) || 0;
  const remainingBudget = totalBudget - (amountSpent + monthlySaving);
  
  const percentageUsed = totalBudget > 0 ? ((amountSpent / totalBudget) * 100).toFixed(1) : 0;
  const percentageSaved = totalBudget > 0 ? ((monthlySaving / totalBudget) * 100).toFixed(1) : 0;
  
  const hasNoBudget = totalBudget === 0;
  const isOverBudget = remainingBudget < 0;
  const hasExpenses = expenses && expenses.length > 0;

  const handleSetBudget = async () => {
    const newBudget = prompt('Enter your monthly budget:', totalBudget);
    if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
      try {
        await updateBudget(parseFloat(newBudget));
      } catch (err) {
        alert('Failed to update budget: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <FixedHeader />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--neutral-600)', fontSize: '14px', fontWeight: '500' }}>
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <FixedHeader />
      <Header activePeriod={activePeriod} setActivePeriod={setActivePeriod} />
      
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px',
        background: 'var(--bg)'
      }}>
        {/* Top Section - Title & Action */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--neutral-900)',
              margin: 0,
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Your Financial Overview
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--neutral-500)',
              margin: 0,
              fontWeight: '500'
            }}>
              Track your budget, spending, and savings all in one place
            </p>
          </div>
          
          {hasNoBudget && (
            <div style={{
              padding: '16px 20px',
              backgroundColor: 'var(--info-light)',
              borderLeft: '4px solid var(--info)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <p style={{
                margin: 0,
                color: 'var(--neutral-800)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Get started by setting your monthly budget
              </p>
              <button
                onClick={handleSetBudget}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Set Budget
              </button>
            </div>
          )}
        </div>

        {/* KPI Cards Grid - 4 column desktop, 2 tablet, 1 mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Card 1: Total Budget */}
          <SummaryCard
            icon={faWallet}
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            subValue={hasNoBudget ? 'Not set' : 'per month'}
            progress={0}
            isPrimary={false}
            isEmpty={hasNoBudget}
          />
          
          {/* Card 2: Amount Spent */}
          <SummaryCard
            icon={faChartLine}
            title="Amount Spent"
            value={formatCurrency(amountSpent)}
            subValue={`${percentageUsed}% of budget`}
            progress={Math.min(parseFloat(percentageUsed) || 0, 100)}
            progressColor={percentageUsed > 100 ? 'var(--error)' : percentageUsed > 80 ? 'var(--warning)' : 'var(--success)'}
            isPrimary={false}
          />
          
          {/* Card 3: Monthly Saving */}
          <SummaryCard
            icon={faPiggyBank}
            title="Monthly Saving"
            value={formatCurrency(monthlySaving)}
            subValue={`${percentageSaved}% saved`}
            progress={Math.min(parseFloat(percentageSaved) || 0, 100)}
            progressColor="var(--success)"
            isPrimary={false}
          />
          
          {/* Card 4: Remaining Budget (PRIMARY) */}
          <SummaryCard
            icon={faCoins}
            title="Remaining Budget"
            value={formatCurrency(remainingBudget)}
            subValue={isOverBudget ? 'Over budget' : 'Available'}
            progress={totalBudget > 0 ? Math.max(0, ((remainingBudget / totalBudget) * 100)) : 0}
            progressColor={isOverBudget ? 'var(--error)' : 'var(--success)'}
            isPrimary={true}
            isOverBudget={isOverBudget}
          />
        </div>

        {/* Action Button */}
        {!hasNoBudget && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '32px'
          }}>
            <button
              onClick={handleSetBudget}
              style={{
                padding: '10px 24px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              Edit Budget
            </button>
          </div>
        )}

        {/* Charts and Transactions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          <ExpenseChart data={expensesByCategory} isEmpty={!hasExpenses} />
          <RecentTransactions transactions={expenses.slice(0, 8)} isEmpty={!hasExpenses} />
        </div>
      </div>
    </div>
  );
}
