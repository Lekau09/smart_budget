import React, { useState, useCallback } from 'react';
import AutoSMSProcessor from '../components/AutoSMSProcessor';
import BudgetTracker from '../components/BudgetTracker';
import SMSMessageProcessor from '../components/SMSMessageProcessor';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState(5000);
  const [transactionCount, setTransactionCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Called when budget needs updating
  const handleBudgetUpdate = useCallback((transaction) => {
    setBudget(prev => prev - transaction.amount);
    setTransactionCount(prev => prev + 1);
    setRefreshKey(prev => prev + 1);
  }, []);

  // Called when a transaction is added
  const handleTransactionAdded = useCallback((transactionId) => {
    console.log('Transaction saved:', transactionId);
    setRefreshKey(prev => prev + 1);
  }, []);

  if (!user) {
    return <div>Please log in first</div>;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: '#F8FAFC'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1F2937'
        }}>
          Welcome back, {user.name || 'User'}! 👋
        </h1>
        <p style={{
          margin: 0,
          color: '#6B7280',
          fontSize: '14px'
        }}>
          Your SMS transactions are being automatically processed and categorized
        </p>
      </div>

      {/* Budget Tracker */}
      <BudgetTracker 
        key={refreshKey}
        userId={user.id} 
        initialBudget={budget}
      />

      {/* Auto SMS Processor Status */}
      <AutoSMSProcessor
        userId={user.id}
        onTransactionAdded={handleTransactionAdded}
        onBudgetUpdate={handleBudgetUpdate}
      />

      {/* Manual SMS Processor (for additional control) */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1F2937'
        }}>
          📱 SMS Messages
        </h2>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#6B7280'
        }}>
          Review and manually process SMS messages for additional control
        </p>
        <SMSMessageProcessor 
          userId={user.id}
          onTransactionAdded={handleTransactionAdded}
        />
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6B7280' }}>
            Transactions Auto-Processed
          </p>
          <p style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#10B981'
          }}>
            {transactionCount}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6B7280' }}>
            Amount Deducted
          </p>
          <p style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#EF4444'
          }}>
            M{(5000 - budget).toFixed(2)}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6B7280' }}>
            Remaining Budget
          </p>
          <p style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#3B82F6'
          }}>
            M{budget.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #FCD34D',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '20px',
        fontSize: '14px',
        color: '#92400E'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          💡 Pro Tips:
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>High-confidence transactions (≥80%) are automatically saved and deducted</li>
          <li>Low-confidence transactions will request your confirmation</li>
          <li>Check notifications for real-time budget updates</li>
          <li>Review manually processed items for maximum control</li>
        </ul>
      </div>
    </div>
  );
}
