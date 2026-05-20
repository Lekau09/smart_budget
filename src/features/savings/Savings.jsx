import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBudget } from '../../context/BudgetContext';
import PageContainer from '../../components/layouts/PageContainer';
import { Plus, Target, Edit2, Trash2, CheckCircle, X, PiggyBank } from 'lucide-react';

function GoalCard({ goal, onAddSavings, onEdit, onDelete }) {
  const pct       = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100);
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);
  const done      = pct >= 100;

  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: `1px solid ${done ? 'var(--success)' : 'var(--border-light)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: '20px 22px',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            {done && <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {goal.goal_name}
            </h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Target: M{Number(goal.target_amount).toLocaleString()}
          </p>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 12 }}>
          <button onClick={() => onEdit(goal)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 5, borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(goal.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 5, borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            M{Number(goal.current_amount).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: done ? 'var(--success-light)' : 'var(--primary-lighter)',
            color: done ? 'var(--success-dark)' : 'var(--primary-main)',
          }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)',
          borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.5s ease',
            width: `${pct}%`,
            background: done ? 'var(--success)'
                      : pct >= 75 ? '#10B981'
                      : pct >= 50 ? 'var(--warning)'
                      : 'var(--primary-main)',
          }} />
        </div>
        {!done && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0', textAlign: 'right' }}>
            M{remaining.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} to go
          </p>
        )}
      </div>

      {/* Add savings button */}
      {!done && (
        <button onClick={() => onAddSavings(goal)} style={{
          width: '100%', padding: '9px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'var(--primary-main)', color: 'white',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <Plus size={14} /> Add Savings
        </button>
      )}
      {done && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '9px', background: 'var(--success-light)',
          borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
          color: 'var(--success-dark)' }}>
          <CheckCircle size={14} /> Goal Reached!
        </div>
      )}
    </div>
  );
}

export default function Savings() {
  const { user } = useAuth();
  const { goals, loading, addGoal, updateGoal, updateGoalDetails, deleteGoal, fetchGoals } = useBudget();

  const [message,   setMessage]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [goalName,  setGoalName]  = useState('');
  const [goalTarget,setGoalTarget]= useState('');

  const [showAddSavingsModal,     setShowAddSavingsModal]     = useState(false);
  const [showEditModal,           setShowEditModal]           = useState(false);
  const [selectedGoalForSavings,  setSelectedGoalForSavings]  = useState(null);
  const [editingGoal,             setEditingGoal]             = useState(null);
  const [savingsAmount,           setSavingsAmount]           = useState('');
  const [savingsLoading,          setSavingsLoading]          = useState(false);
  const [editName,   setEditName]   = useState('');
  const [editTarget, setEditTarget] = useState('');

  useEffect(() => {
    if (user?.id) fetchGoals();
  }, [user?.id]);

  const msg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddGoal = async e => {
    e.preventDefault();
    if (!goalName.trim() || !goalTarget || Number(goalTarget) <= 0) {
      msg('error', 'Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await addGoal(goalName.trim(), Number(goalTarget), user.id);
      setGoalName(''); setGoalTarget(''); setShowForm(false);
      msg('success', `Goal "${goalName.trim()}" created`);
      await fetchGoals();
    } catch(err) { msg('error', err.message || 'Failed to create goal'); }
    finally { setSaving(false); }
  };

  const handleEditGoal = async e => {
    e.preventDefault();
    if (!editName.trim() || !editTarget || Number(editTarget) <= 0) {
      msg('error', 'Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await updateGoalDetails(editingGoal.id, editName.trim(), Number(editTarget), user.id);
      setEditingGoal(null); setShowEditModal(false);
      msg('success', 'Goal updated');
      await fetchGoals();
    } catch(err) { msg('error', err.message || 'Failed to update goal'); }
    finally { setSaving(false); }
  };

  const handleDeleteGoal = async id => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id, user.id);
      msg('success', 'Goal deleted');
      await fetchGoals();
    } catch(err) { msg('error', 'Failed to delete goal'); }
  };

  const handleAddSavings = async e => {
    e.preventDefault();
    if (!savingsAmount || Number(savingsAmount) <= 0) {
      msg('error', 'Enter a valid amount'); return;
    }
    setSavingsLoading(true);
    try {
      const newAmt = Number(selectedGoalForSavings.current_amount||0) + Number(savingsAmount);
      await updateGoal(selectedGoalForSavings.id, newAmt, user.id);
      msg('success', `M${Number(savingsAmount).toFixed(2)} added`);
      setSavingsAmount(''); setShowAddSavingsModal(false); setSelectedGoalForSavings(null);
      await fetchGoals();
    } catch(err) { msg('error', err.message || 'Failed'); }
    finally { setSavingsLoading(false); }
  };

  const totalSaved    = goals.reduce((s,g) => s + Number(g.current_amount), 0);
  const totalTarget   = goals.reduce((s,g) => s + Number(g.target_amount),  0);
  const overallPct    = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const monthlyAvg    = totalSaved > 0 ? (totalSaved / 3).toFixed(2) : '0.00';

  const modalBase = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
  };
  const modalCard = {
    background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
    padding: 28, maxWidth: 380, width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  };

  return (
    <PageContainer variant="standard">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)',
            margin: 0, letterSpacing: '-0.4px' }}>Savings Goals</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Set goals, track progress, stay motivated
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
          background: 'var(--primary-main)', color: 'white', border: 'none',
          borderRadius: 'var(--radius-lg)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* Alert */}
      {message && (
        <div style={{
          padding: '10px 14px', marginBottom: 16, borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? 'var(--success-dark)' : 'var(--danger-dark)',
          fontSize: 13, fontWeight: 500, border: `1px solid ${message.type==='success'?'var(--success)':'var(--danger)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Overview stats */}
      {goals.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Saved',   value: `M${totalSaved.toFixed(2)}`,  sub: `${goals.length} goal${goals.length!==1?'s':''}`, accent: '#10B981' },
              { label: 'Monthly Avg',   value: `M${monthlyAvg}`,             sub: 'Estimated per month',    accent: '#3B82F6' },
              { label: 'Total Target',  value: `M${totalTarget.toFixed(2)}`, sub: `${overallPct.toFixed(0)}% complete`, accent: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 18px', background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
                borderTop: `3px solid ${s.accent}` }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 4px',
                  textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '3px 0 0' }}>{s.sub}</p>
              </div>
            ))}
          </div>
          {/* Overall progress */}
          <div style={{ padding: '14px 18px', background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
            marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Overall Progress
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-main)' }}>
                {overallPct.toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-tertiary)',
              borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99,
                width: `${Math.min(overallPct, 100)}%`,
                background: overallPct >= 100 ? 'var(--success)' : overallPct >= 70 ? 'var(--warning)' : 'var(--primary-main)',
                transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </>
      )}

      {/* New goal form */}
      {showForm && (
        <div style={{ marginBottom: 20, padding: '20px 22px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              New Savings Goal
            </h3>
            <button onClick={() => setShowForm(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.4px' }}>Goal Name</label>
              <input type="text" placeholder="e.g. Emergency Fund, Laptop"
                value={goalName} onChange={e => setGoalName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 14, background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.4px' }}>Target Amount (M)</label>
              <input type="number" placeholder="0.00" min="0" step="0.01"
                value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                style={{ width: '100%', padding: '10px 12px',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 14, background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{
                flex: 1, padding: '9px', background: 'none',
                border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{
                flex: 2, padding: '9px', background: 'var(--primary-main)',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 700, color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {goals.map((g,i) => (
            <GoalCard key={g.id || i} goal={g}
              onAddSavings={g => { setSelectedGoalForSavings(g); setShowAddSavingsModal(true); }}
              onEdit={g => { setEditingGoal(g); setEditName(g.goal_name); setEditTarget(g.target_amount); setShowEditModal(true); }}
              onDelete={handleDeleteGoal} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-tertiary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <PiggyBank size={26} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No savings goals yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, maxWidth: 260 }}>
            Create your first goal to start tracking your savings progress.
          </p>
          <button onClick={() => setShowForm(true)} style={{
            marginTop: 8, padding: '10px 20px', background: 'var(--primary-main)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-lg)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Create First Goal
          </button>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddSavingsModal && selectedGoalForSavings && (
        <div style={modalBase} onClick={() => setShowAddSavingsModal(false)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Add to Savings
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Goal: <strong>{selectedGoalForSavings.goal_name}</strong>
            </p>
            <form onSubmit={handleAddSavings}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.4px' }}>Amount (M)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" autoFocus
                value={savingsAmount} onChange={e => setSavingsAmount(e.target.value)}
                style={{ width: '100%', padding: '11px 14px',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 20, fontWeight: 700, color: 'var(--primary-main)',
                  background: 'var(--bg-primary)', boxSizing: 'border-box', marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setShowAddSavingsModal(false)} style={{
                  flex: 1, padding: '10px', background: 'none',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 14, cursor: 'pointer', color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={savingsLoading} style={{
                  flex: 2, padding: '10px', background: 'var(--primary-main)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 14, fontWeight: 700, color: 'white',
                  cursor: savingsLoading ? 'not-allowed' : 'pointer', opacity: savingsLoading ? 0.7 : 1 }}>
                  {savingsLoading ? 'Saving...' : 'Add Savings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <div style={modalBase} onClick={() => setShowEditModal(false)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
              Edit Goal
            </h2>
            <form onSubmit={handleEditGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.4px' }}>Goal Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)', fontSize: 14,
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.4px' }}>Target Amount (M)</label>
                <input type="number" min="0" step="0.01" value={editTarget} onChange={e => setEditTarget(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)', fontSize: 14,
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{
                  flex: 1, padding: '10px', background: 'none',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 14, cursor: 'pointer', color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  flex: 2, padding: '10px', background: 'var(--primary-main)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 14, fontWeight: 700, color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}