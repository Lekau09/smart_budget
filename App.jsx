import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import TransactionsPage from './components/TransactionsPage.jsx';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    console.log('[App] mounted, currentPage=', currentPage);
  }, [currentPage]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f1724', fontFamily: 'Inter, system-ui' }}>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
        <strong>SmartBudget — Debug Shell</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setCurrentPage('dashboard')} style={{ marginRight: 8 }}>Dashboard</button>
          <button onClick={() => setCurrentPage('transactions')}>Transactions</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <aside style={{ width: 240 }}>
          {typeof Sidebar === 'function' ? (
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onNavigate={setCurrentPage} activePage={currentPage} />
          ) : (
            <div style={{ padding: 12 }}>Sidebar</div>
          )}
        </aside>

        <main style={{ flex: 1, padding: 18 }}>
          {currentPage === 'transactions' ? <TransactionsPage /> : <Dashboard />}
        </main>
      </div>
    </div>
  );
}
