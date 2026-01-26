import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import GoalCard from "../../components/GoalCard";
import { useAuth } from "../../hooks/useAuth";
import { useBudget } from "../../context/BudgetContext";
import PageContainer from "../../components/layouts/PageContainer";
import GridSection from "../../components/layouts/GridSection";
import LayoutRow from "../../components/layouts/LayoutRow";

export default function Goals() {
  const { user } = useAuth();
  const { goals, loading, addGoal, updateGoal, deleteGoal, fetchGoals } = useBudget();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);  // Track expanded card

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) fetchGoals();
  }, [user?.id]);

  async function handleAddGoal(e) {
    e.preventDefault();
    if (!goalName.trim() || !targetAmount || Number(targetAmount) <= 0) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    try {
      await addGoal(goalName.trim(), Number(targetAmount));
      setGoalName("");
      setTargetAmount("");
      setCurrentAmount("");
      setDeadline("");
      setShowForm(false);
      setMessage({ type: "success", text: "Goal created successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to create goal" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setMessage({ type: "success", text: "Goal deleted successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to delete goal" });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const totalTargeted = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const overallProgress = totalTargeted > 0 ? (totalSaved / totalTargeted) * 100 : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
        <div style={{ textAlign: "center", color: "var(--slate-600)" }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading goals…</div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer variant="standard">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: '0.5rem'
        }}>Financial Goals</h1>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
          margin: 0
        }}>Plan and track your financial objectives with ease</p>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`message message-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === "success" ? "✓" : "!"} {message.text}
        </div>
      )}

      {error && (
        <div className="message message-error" style={{ marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Overall Progress */}
      {goals.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Overall Progress</h2>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
              {overallProgress.toFixed(0)}%
            </div>
          </div>
          <div style={{
            height: '12px',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              height: '100%',
              background: 'var(--gradient-primary)',
              width: `${overallProgress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          <GridSection cols="3" gap="md">
            <div style={{
              padding: "1rem",
              backgroundColor: "var(--surface-secondary)",
              borderRadius: "0.75rem"
            }}>
              <p className="card-subtitle" style={{ marginBottom: '0.5rem' }}>Total Target</p>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--primary)' }}>M{totalTargeted.toFixed(2)}</div>
            </div>
            <div style={{
              padding: "1rem",
              backgroundColor: "var(--surface-secondary)",
              borderRadius: "0.75rem"
            }}>
              <p className="card-subtitle" style={{ marginBottom: '0.5rem' }}>Total Saved</p>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--success)' }}>M{totalSaved.toFixed(2)}</div>
            </div>
            <div style={{
              padding: "1rem",
              backgroundColor: "var(--surface-secondary)",
              borderRadius: "0.75rem"
            }}>
              <p className="card-subtitle" style={{ marginBottom: '0.5rem' }}>Remaining</p>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--danger)' }}>M{(totalTargeted - totalSaved).toFixed(2)}</div>
            </div>
          </GridSection>
        </div>
      )}

      {/* Add Goal Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? '1.5rem' : 0, paddingBottom: showForm ? '1.5rem' : 0, borderBottom: showForm ? '1px solid var(--border)' : 'none' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Create New Goal</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "btn btn-sm btn-secondary" : "btn btn-sm btn-primary"}
          >
            {showForm ? "✕ Cancel" : "+ Create Goal"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddGoal} style={{ display: "grid", gap: '1.5rem' }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Vacation Fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Amount (M)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Amount (M)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Goals List - Vertical Stack */}
      {goals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoalId === goal.id}
              onToggle={() => {
                // Toggle: close if already open, open if closed
                setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id);
              }}
              onAddSavings={(goal) => {
                // For Goals page, you could add additional savings handling here if needed
                console.log('Add savings to goal:', goal);
              }}
              onDelete={handleDeleteGoal}
              onUpdate={updateGoal}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>—</div>
            <div style={{ fontWeight: '600', fontSize: 'var(--font-size-lg)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No goals yet
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Set financial goals and track your progress towards achieving them!
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-sm"
            >
              + Create Your First Goal
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
