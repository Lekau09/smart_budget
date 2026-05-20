import React, { useEffect, useState } from 'react';
import useUserAuth from '../../hooks/useUserAuth';
import { useBudget } from '../../context/BudgetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Calendar, TrendingDown, Wallet, PiggyBank, Plus, Target,
  TrendingUp, BarChart2, ShoppingBag, Zap, Heart, Bus,
  Coffee, ShoppingCart, HelpCircle, AlertTriangle, CheckCircle,
  ArrowUpRight, RefreshCw, CreditCard
} from 'lucide-react';
import PageContainer from '../../components/layouts/PageContainer';
import LayoutRow from '../../components/layouts/LayoutRow';
import SetBudgetModal from '../../components/SetBudgetModal';
import AddExpenseModal from '../../../components/AddExpenseModal';
import AutoSMSProcessor from '../../components/AutoSMSProcessor';
import AlertBanner from '../../components/AlertBanner';
import GamificationCard from '../../components/GamificationCard';
import OnboardingWizard from '../../components/OnboardingWizard';
import useOnboarding from '../../hooks/useOnboarding';           // ← LINE 1 ADDED
import { useNotification } from '../../context/NotificationContext';
import ExportButton from '../../components/ExportButton';

// ── Category config ────────────────────────────────────────────
const CATEGORIES = {
  Food:          { color: '#EF4444', icon: Coffee },
  Groceries:     { color: '#F59E0B', icon: ShoppingCart },
  Transport:     { color: '#3B82F6', icon: Bus },
  Entertainment: { color: '#8B5CF6', icon: Zap },
  Health:        { color: '#10B981', icon: Heart },
  Utilities:     { color: '#FBBF24', icon: Zap },
  Shopping:      { color: '#EC4899', icon: ShoppingBag },
  Subscriptions: { color: '#06B6D4', icon: CreditCard },
  Other:         { color: '#64748B', icon: HelpCircle },
  Income:        { color: '#4CAF50', icon: ArrowUpRight },
  Salary:        { color: '#4CAF50', icon: ArrowUpRight },
  Education:     { color: '#6366F1', icon: BarChart2 },
  Bills:         { color: '#FF9800', icon: Zap },
};

// ── KPI Card ───────────────────────────────────────────────────
function KPICard({ title, amount, stat, icon: Icon, isLoading, accent }) {
  if (isLoading) return (
    <div className="kpi-card">
      <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      <div className="skeleton skeleton-amount" style={{ marginTop: '1rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '45%', marginTop: '0.5rem' }} />
    </div>
  );
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${accent || 'var(--primary-main)'}` }}>
      <div className="kpi-card-header">
        <h3 className="kpi-card-title">{title}</h3>
        {Icon && (
          <div className="kpi-card-icon" style={{ color: accent || 'var(--primary-main)',
            background: (accent || 'var(--primary-main)') + '15' }}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className="kpi-card-amount">{amount}</p>
      <p className={`kpi-card-stat ${stat.type}`}>{stat.label}</p>
    </div>
  );
}

function SkeletonTransaction() {
  return <div className="skeleton skeleton-transaction" />;
}

function TransactionItem({ transaction }) {
  const isExpense = Number(transaction.amount) > 0;
  const date      = new Date(transaction.date);
  const timeStr   = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const cfg       = CATEGORIES[transaction.category] || CATEGORIES.Other;
  const CatIcon   = cfg.icon;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-primary)',
      transition: 'all 150ms ease', cursor: 'default', marginBottom: '6px',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
      e.currentTarget.style.borderColor = cfg.color + '40';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
      e.currentTarget.style.borderColor = 'var(--border-light)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          backgroundColor: cfg.color + '12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, flexShrink: 0,
        }}>
          <CatIcon size={16} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {transaction.description || 'Transaction'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0',
            display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: cfg.color, fontWeight: 500 }}>{transaction.category || 'Other'}</span>
            <span style={{ opacity: 0.4 }}>&middot;</span>
            <span>{timeStr}</span>
          </p>
        </div>
      </div>
      <p style={{
        fontSize: 13, fontWeight: 700,
        color: isExpense ? 'var(--danger)' : 'var(--success)',
        margin: 0, whiteSpace: 'nowrap', marginLeft: 12,
      }}>
        {isExpense ? '-' : '+'}M{Math.abs(Number(transaction.amount)).toFixed(2)}
      </p>
    </div>
  );
}

function EmptyStateInline({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 20px', textAlign: 'center', gap: 8 }}>
      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-tertiary)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon size={22} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0,
        maxWidth: 260, lineHeight: 1.5 }}>{subtitle}</p>}
      {action && (
        <button onClick={onAction} style={{
          marginTop: 8, padding: '8px 18px',
          background: 'var(--primary-main)', color: 'white',
          border: 'none', borderRadius: 'var(--radius-lg)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>{action}</button>
      )}
    </div>
  );
}

function WeekSummary({ budget, expensesByCategory, selectedMonth, selectedYear }) {
  // Use budget.total_spent (from PHP) — always accurate regardless of how many
  // transactions are loaded in the expenses array
  const total        = Number(budget?.total_spent) || 0;
  const txCount      = Number(budget?.transaction_count) || 0;

  // Top category from expensesByCategory (also from PHP, complete data)
  const topCat = (expensesByCategory || []).length > 0
    ? [...expensesByCategory].sort((a,b) => Number(b.value) - Number(a.value))[0]
    : null;
  const topCatName = topCat?.name || topCat?.category || null;

  if (total === 0) return null;

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthName   = MONTH_NAMES[(selectedMonth - 1)] || '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', marginBottom: 16,
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      borderLeft: '3px solid var(--primary-main)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BarChart2 size={16} style={{ color: 'var(--primary-main)', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthName} {selectedYear}: M{total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} spent
          </span>
          {topCatName && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
              · Top category: {topCatName}
            </span>
          )}
        </div>
      </div>
      {txCount > 0 && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {txCount} transaction{txCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const { user }                = useUserAuth();
  const {
    budget, expenses, expensesByCategory, goals,
    loading, fetchDashboard, updateGoal
  }                             = useBudget();
  const { addNotification }     = useNotification();

  // ← LINE 2 ADDED: replaces the old useState + useEffect for onboarding
  const { showOnboarding, completeOnboarding } = useOnboarding(user);

  const [error, setError]                         = useState('');
  const [showBudgetModal, setShowBudgetModal]       = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
  const [selectedGoalForSavings, setSelectedGoalForSavings] = useState(null);
  const [savingsAmount, setSavingsAmount]           = useState('');
  const [savingsLoading, setSavingsLoading]         = useState(false);
  const [budgetOverflowNotified, setBudgetOverflowNotified] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear());

  useEffect(() => {
    if (user?.id) fetchDashboard(user.id, { month: selectedMonth, year: selectedYear });
  }, [user?.id, selectedMonth, selectedYear]);

  useEffect(() => {
    const handler = e => {
      const { month, year } = e.detail || {};
      if (month) setSelectedMonth(month);
      if (year)  setSelectedYear(year);
    };
    window.addEventListener('periodChanged', handler);
    return () => window.removeEventListener('periodChanged', handler);
  }, []);

  useEffect(() => {
    const spent  = Number(budget?.total_spent)    || 0;
    const total  = Number(budget?.monthly_budget) || 0;
    if (total > 0 && spent > total && !budgetOverflowNotified) {
      addNotification(`Budget exceeded by M${(spent - total).toFixed(2)}`, 'warning', false);
      setBudgetOverflowNotified(true);
    } else if (spent <= total) {
      setBudgetOverflowNotified(false);
    }
  }, [budget, budgetOverflowNotified, addNotification]);

  const fmt = v => (Number(v)||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });

  const STANDARD = ['Food','Groceries','Transport','Entertainment','Health','Utilities','Shopping','Subscriptions','Other'];
  const chartData = (() => {
    const m = {};
    STANDARD.forEach(c => { m[c] = 0; });
    (expensesByCategory||[]).forEach(c => {
      const k = STANDARD.includes(c.name||c.category) ? (c.name||c.category) : 'Other';
      m[k] += Number(c.value)||0;
    });
    return STANDARD.map(n => ({ name:n, value:m[n], color:CATEGORIES[n]?.color||'#64748B' })).filter(i=>i.value>0);
  })();

  const recentTx    = (expenses||[]).slice(0,5);
  const totalSpent  = Number(budget?.total_spent)    || 0;
  const totalBudget = Number(budget?.monthly_budget) || 0;
  const totalSaved  = Number(budget?.total_saved)    || 0;
  const remaining   = totalBudget - totalSpent - totalSaved;

  const handleAddSavings = async e => {
    e.preventDefault();
    if (!savingsAmount || Number(savingsAmount) <= 0) { addNotification('Enter a valid amount','error'); return; }
    setSavingsLoading(true);
    try {
      await updateGoal(selectedGoalForSavings.id,
        Number(selectedGoalForSavings.current_amount||0) + Number(savingsAmount), user.id);
      addNotification(`M${Number(savingsAmount).toFixed(2)} added to savings`,'success');
      setSavingsAmount(''); setShowAddSavingsModal(false); setSelectedGoalForSavings(null);
      await fetchDashboard(user.id);
    } catch(err) { addNotification(err.message||'Failed','error'); }
    finally { setSavingsLoading(false); }
  };

  if (error) return (
    <div style={{ padding:'2rem' }}>
      <div style={{ padding:'1.5rem', background:'var(--danger-light)',
        borderRadius:'var(--radius-lg)', borderLeft:'4px solid var(--danger)' }}>
        <p style={{ color:'var(--danger)', fontWeight:600, margin:0 }}>Error Loading Dashboard</p>
        <p style={{ color:'var(--text-secondary)', fontSize:13, margin:'4px 0 0' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <PageContainer variant="standard">
      <AutoSMSProcessor
        userId={user?.id}
        onTransactionAdded={() => fetchDashboard(user?.id, { month:selectedMonth, year:selectedYear })}
        onBudgetUpdate={()    => fetchDashboard(user?.id, { month:selectedMonth, year:selectedYear })}
      />

      <AlertBanner userId={user?.id} totalSpent={totalSpent} monthlyBudget={totalBudget} />
      <WeekSummary budget={budget} expensesByCategory={expensesByCategory} selectedMonth={selectedMonth} selectedYear={selectedYear} />

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'1.75rem', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)',
            margin:0, letterSpacing:'-0.4px' }}>Financial Overview</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'4px 0 0' }}>
            {new Date().toLocaleDateString('en-US',{ month:'long', year:'numeric' })}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <ExportButton userId={user?.id} month={selectedMonth} year={selectedYear} />
          <button className="btn btn-secondary" onClick={() => setShowBudgetModal(true)}
            style={{ fontSize:13 }}>
            <Calendar size={14} /> Set Budget
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddExpenseModal(true)}
            style={{ fontSize:13 }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-summary-grid" style={{ marginBottom:'1.5rem' }}>
        <KPICard title="Monthly Budget"
          amount={loading ? '' : `M${fmt(totalBudget)}`}
          stat={{ type:'neutral', label:'Allocated this month' }}
          icon={Wallet} accent="#3B82F6" isLoading={loading} />
        <KPICard title="Amount Spent"
          amount={loading ? '' : `M${fmt(totalSpent)}`}
          stat={{ type: totalSpent > totalBudget ? 'negative':'neutral',
            label:`${Math.round((totalSpent/(totalBudget||1))*100)}% of budget` }}
          icon={TrendingDown} accent="#EF4444" isLoading={loading} />
        <KPICard title="Total Saved"
          amount={loading ? '' : `M${fmt(totalSaved)}`}
          stat={{ type: totalSaved>0?'positive':'neutral',
            label: totalSaved>0?'Across all goals':'No savings yet' }}
          icon={PiggyBank} accent="#10B981" isLoading={loading} />
        <KPICard title="Remaining"
          amount={loading ? '' : remaining < 0 ? `-M${fmt(Math.abs(remaining))}` : `M${fmt(remaining)}`}
          stat={{ type: remaining>0?'positive':'negative',
            label: remaining>0?'Available to spend':'Over budget' }}
          icon={remaining>0?CheckCircle:AlertTriangle}
          accent={remaining>0?'#10B981':'#EF4444'} isLoading={loading} />
      </div>

      {/* Gamification / Achievements — moved to prominent top position */}
      <div style={{ marginBottom:'1.5rem' }}>
        <GamificationCard userId={user?.id} />
      </div>

      {/* Main layout */}
      <LayoutRow ratio="equal" gap="lg">

        {/* Left — Expense Breakdown */}
        <div className="card" style={{ display:'flex', flexDirection:'column' }}>
          <div className="card-header">
            <h2 className="card-title">Expense Breakdown</h2>
            <a href="/app/analytics" style={{ fontSize:13, color:'var(--primary-main)',
              textDecoration:'none', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
              Analytics <ArrowUpRight size={13} />
            </a>
          </div>

          {loading ? <div className="skeleton skeleton-chart" /> :
           chartData.length > 0 ? (
            <>
              <div style={{ width:'100%', height:280, position:'relative',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                      paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {chartData.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v=>`M${Number(v).toFixed(2)}`}
                      contentStyle={{ background:'var(--bg-primary)',
                        border:'1px solid var(--border-light)',
                        borderRadius:'var(--radius-lg)', fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:'absolute', top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                  <p style={{ margin:'0 0 1px', fontSize:11, color:'var(--text-muted)',
                    textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:500 }}>Total</p>
                  <p style={{ margin:0, fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>
                    M{fmt(chartData.reduce((s,i)=>s+i.value,0))}
                  </p>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {chartData.slice(0,6).map((item,i) => {
                  const total = chartData.reduce((s,x)=>s+x.value,0);
                  const pct   = total>0 ? Math.round((item.value/total)*100) : 0;
                  const Ic    = CATEGORIES[item.name]?.icon || HelpCircle;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center',
                      justifyContent:'space-between', padding:'8px 10px',
                      borderRadius:'var(--radius-md)',
                      background:'var(--bg-secondary)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%',
                          backgroundColor:item.color, flexShrink:0 }} />
                        <Ic size={13} style={{ color:item.color }} />
                        <span style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>
                          {item.name}
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>{pct}%</span>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
                          M{fmt(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyStateInline icon={BarChart2}
              title="No expenses this month"
              subtitle="Add an expense or forward a bank SMS to see your breakdown."
              action="Add Expense" onAction={()=>setShowAddExpenseModal(true)} />
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Recent Transactions</h2>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:'2px 0 0' }}>
                  Last {recentTx.length} entries
                </p>
              </div>
              <a href="/app/transactions" style={{ fontSize:13, color:'var(--primary-main)',
                textDecoration:'none', fontWeight:600,
                display:'flex', alignItems:'center', gap:4 }}>
                View all <ArrowUpRight size={13} />
              </a>
            </div>

            {loading ? (
              [...Array(3)].map((_,i)=><SkeletonTransaction key={i}/>)
            ) : recentTx.length > 0 ? (
              recentTx.map((t,i)=><TransactionItem key={i} transaction={t}/>)
            ) : (
              <EmptyStateInline icon={TrendingDown}
                title="No transactions yet"
                subtitle="Forward a bank SMS or add an expense to get started."
                action="Add Expense" onAction={()=>setShowAddExpenseModal(true)} />
            )}
          </div>

          {/* Savings Goals */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Savings Goals</h2>
              <a href="/app/savings" style={{ fontSize:13, color:'var(--primary-main)',
                textDecoration:'none', fontWeight:600,
                display:'flex', alignItems:'center', gap:4 }}>
                View all <ArrowUpRight size={13} />
              </a>
            </div>

            {loading ? (
              [...Array(2)].map((_,i)=><div key={i} className="skeleton" style={{height:72,marginBottom:8}}/>)
            ) : goals?.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {goals.slice(0,3).map((g,i)=>{
                  const pct = Math.min((Number(g.current_amount)/Number(g.target_amount))*100,100);
                  return (
                    <div key={i} style={{ padding:'12px 14px',
                      background:'var(--bg-secondary)', borderRadius:'var(--radius-md)',
                      border:'1px solid var(--border-light)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:13, fontWeight:600,
                          color:'var(--text-primary)' }}>{g.goal_name}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                            M{Number(g.current_amount).toFixed(0)} / M{Number(g.target_amount).toFixed(0)}
                          </span>
                          <button onClick={()=>{setSelectedGoalForSavings(g);setShowAddSavingsModal(true);}}
                            style={{ display:'flex', alignItems:'center', gap:3,
                              padding:'4px 10px', background:'var(--primary-main)',
                              color:'white', border:'none', borderRadius:99,
                              fontSize:11, fontWeight:600, cursor:'pointer' }}>
                            <Plus size={11}/> Add
                          </button>
                        </div>
                      </div>
                      <div style={{ height:5, background:'var(--border-light)',
                        borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99,
                          width:`${pct}%`,
                          background: pct>=100?'var(--success)':pct>=75?'#10B981':pct>=50?'#F59E0B':'var(--primary-main)',
                          transition:'width 0.4s ease' }} />
                      </div>
                      <div style={{ textAlign:'right', fontSize:10,
                        color:'var(--text-muted)', marginTop:3 }}>{Math.round(pct)}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyStateInline icon={Target}
                title="No savings goals"
                subtitle="Set a goal and start building your savings."
                action="Create Goal" onAction={()=>window.location.href='/app/savings'} />
            )}
          </div>
        </div>
      </LayoutRow>

      {/* Set Budget Modal */}
      <SetBudgetModal isOpen={showBudgetModal} onClose={()=>setShowBudgetModal(false)}
        currentBudget={budget} userId={user?.id}
        month={selectedMonth} year={selectedYear}
        onBudgetUpdated={()=>{ fetchDashboard(user?.id, { month:selectedMonth, year:selectedYear }); addNotification('Budget updated — dashboard refreshed','success'); }} />

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={showAddExpenseModal} onClose={()=>setShowAddExpenseModal(false)}
        onAdd={()=>{ fetchDashboard(user?.id); addNotification('Expense added','success'); }} />

      {/* Add Savings Modal */}
      {showAddSavingsModal && selectedGoalForSavings && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={()=>setShowAddSavingsModal(false)}>
          <div style={{ background:'var(--bg-primary)', borderRadius:'var(--radius-xl)',
            padding:'28px', maxWidth:380, width:'90%',
            boxShadow:'0 20px 40px rgba(0,0,0,0.15)' }}
            onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 4px',
              color:'var(--text-primary)' }}>Add to Savings</h2>
            <p style={{ color:'var(--text-secondary)', marginBottom:20, fontSize:13 }}>
              Goal: <strong>{selectedGoalForSavings.goal_name}</strong>
            </p>
            <form onSubmit={handleAddSavings}>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'var(--text-secondary)', marginBottom:6,
                textTransform:'uppercase', letterSpacing:'0.4px' }}>Amount (M)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00"
                value={savingsAmount} onChange={e=>setSavingsAmount(e.target.value)}
                style={{ width:'100%', padding:'11px 14px',
                  border:'1px solid var(--border-main)',
                  borderRadius:'var(--radius-md)', fontSize:18, fontWeight:700,
                  color:'var(--primary-main)', boxSizing:'border-box',
                  background:'var(--bg-primary)', outline:'none' }}
                onFocus={e=>e.target.style.borderColor='var(--primary-main)'}
                onBlur={e=>e.target.style.borderColor='var(--border-main)'}
                disabled={savingsLoading} autoFocus />
              <div style={{ display:'flex', gap:8, marginTop:20 }}>
                <button type="button" disabled={savingsLoading}
                  onClick={()=>{setShowAddSavingsModal(false);setSavingsAmount('');setSelectedGoalForSavings(null);}}
                  style={{ flex:1, padding:'10px', background:'none',
                    border:'1px solid var(--border-main)',
                    borderRadius:'var(--radius-md)', fontSize:14, cursor:'pointer',
                    color:'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={savingsLoading}
                  style={{ flex:2, padding:'10px', background:'var(--primary-main)',
                    border:'none', borderRadius:'var(--radius-md)',
                    fontSize:14, fontWeight:700, color:'white',
                    cursor:savingsLoading?'not-allowed':'pointer',
                    opacity:savingsLoading?0.7:1 }}>
                  {savingsLoading?'Saving...':'Add Savings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ← LINE 3: Onboarding wizard — shows once for every new user */}
      {showOnboarding && (
        <OnboardingWizard user={user} onComplete={completeOnboarding} />
      )}

    </PageContainer>
  );
}