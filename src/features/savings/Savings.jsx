import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import GoalCard from "../../components/GoalCard";
import { useAuth } from "../../hooks/useAuth";
import { useBudget } from "../../context/BudgetContext";
import PageContainer from "../../components/layouts/PageContainer";
import { TrendingUp, PlusCircle, AlertCircle } from "lucide-react";

export default function Savings() {
  const { user } = useAuth();
  const { goals, loading, addGoal, updateGoal, updateGoalDetails, deleteGoal, fetchGoals } = useBudget();
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoalForSavings, setSelectedGoalForSavings] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [savingsLoading, setSavingsLoading] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");

  useEffect(() => {
    if (user?.id) fetchGoals();
  }, [user?.id]);

  async function handleAddGoal(e) {
    e.preventDefault();
    if (!goalName.trim() || !goalTarget || Number(goalTarget) <= 0) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSaving(true);
    try {
      await addGoal(goalName.trim(), Number(goalTarget), user.id);
      setGoalName("");
      setGoalTarget("");
      setCurrentAmount("");
      setShowForm(false);
      setMessage({ type: "success", text: `Created "${goalName.trim()}" goal` });
      await fetchGoals();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to create goal" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleEditGoal(e) {
    e.preventDefault();
    if (!editName.trim() || !editTarget || Number(editTarget) <= 0) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSaving(true);
    try {
      await updateGoalDetails(
        editingGoal.id,
        editName.trim(),
        Number(editTarget),
        user.id
      );
      setEditName("");
      setEditTarget("");
      setEditingGoal(null);
      setShowEditModal(false);
      setMessage({ type: "success", text: `Updated goal details` });
      await fetchGoals();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to update goal" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id, user.id);
      setMessage({ type: "success", text: "Goal deleted" });
      await fetchGoals();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete goal" });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAddSavings(e) {
    e.preventDefault();
    if (!savingsAmount || Number(savingsAmount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSavingsLoading(true);
    try {
      const currentSaved = Number(selectedGoalForSavings.current_amount) || 0;
      const newAmount = currentSaved + Number(savingsAmount);
      await updateGoal(
        selectedGoalForSavings.id,
        newAmount,
        user.id
      );
      setMessage({ type: "success", text: `Added M${Number(savingsAmount).toFixed(2)} to savings` });
      setSavingsAmount("");
      setShowAddSavingsModal(false);
      setSelectedGoalForSavings(null);
      await fetchGoals();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to add savings" });
    } finally {
      setSavingsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const monthlySavingsAverage = totalSaved > 0 ? (totalSaved / 3).toFixed(2) : 0; // Rough estimate

  if (loading) {
    return (
      <PageContainer variant="standard">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>↻</div>
          <p style={{ color: "#000000" }}>Loading your savings...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="standard">
      {/* Header Section - More Human Feel */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <TrendingUp size={24} style={{ color: "var(--primary-main)" }} />
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#000000",
            margin: 0,
            letterSpacing: "-0.5px"
          }}>Savings Goals</h1>
        </div>
        <p style={{
          fontSize: "16px",
          color: "#000000",
          margin: 0,
          marginTop: "4px"
        }}>Set goals, track progress, stay motivated</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div style={{
          padding: "12px 16px",
          marginBottom: "24px",
          backgroundColor: message.type === "success" ? "var(--success-light)" : "var(--danger-light)",
          color: message.type === "success" ? "var(--success-dark)" : "var(--danger-dark)",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {message.type === "success" ? "✓" : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Overview Cards - More Spacious */}
      {goals.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          {/* Total Saved */}
          <div style={{
            padding: "24px",
            backgroundColor: "var(--bg-primary)",
            borderRadius: "12px",
            border: "1px solid var(--border-light)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}>
            <p style={{ fontSize: "13px", color: "#000000", margin: 0, marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Saved</p>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#000000", margin: 0 }}>M{totalSaved.toFixed(2)}</div>
            <p style={{ fontSize: "12px", color: "#000000", margin: "8px 0 0 0" }}>{goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Monthly Average */}
          <div style={{
            padding: "24px",
            backgroundColor: "var(--bg-primary)",
            borderRadius: "12px",
            border: "1px solid var(--border-light)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}>
            <p style={{ fontSize: "13px", color: "#000000", margin: 0, marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Avg</p>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#000000", margin: 0 }}>M{monthlySavingsAverage}</div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "8px 0 0 0" }}>estimated per month</p>
          </div>

          {/* Total Target */}
          <div style={{
            padding: "24px",
            backgroundColor: "var(--bg-primary)",
            borderRadius: "12px",
            border: "1px solid var(--border-light)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Target</p>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>M{totalTarget.toFixed(2)}</div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "8px 0 0 0" }}>{overallProgress.toFixed(0)}% complete</p>
          </div>
        </div>
      )}

      {/* Overall Progress Bar */}
      {goals.length > 0 && (
        <div style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "12px",
          border: "1px solid var(--border-light)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Your Progress</h3>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-main)" }}>{overallProgress.toFixed(0)}%</span>
          </div>
          <div style={{
            height: "8px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              backgroundColor: overallProgress >= 100 ? "var(--success)" : overallProgress >= 70 ? "var(--warning)" : "var(--primary-main)",
              width: `${Math.min(overallProgress, 100)}%`,
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }} />
          </div>
        </div>
      )}

      {/* Add Goal Section */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "32px",
            backgroundColor: "transparent",
            border: "2px dashed var(--border-main)",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "var(--primary-main)",
            fontSize: "15px",
            fontWeight: 600,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-lighter)";
            e.currentTarget.style.borderColor = "var(--primary-main)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "var(--border-main)";
          }}
        >
          <PlusCircle size={20} />
          Create a New Savings Goal
        </button>
      )}

      {/* Add Goal Form */}
      {showForm && (
        <div style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "var(--primary-lighter)",
          borderRadius: "12px",
          border: "1px solid var(--primary-light)"
        }}>
          <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>New Savings Goal</h3>
          <form onSubmit={handleAddGoal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Goal Name</label>
              <input
                type="text"
                placeholder="e.g., Emergency Fund, Vacation"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: saving ? "var(--text-muted)" : "var(--primary-main)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s"
                }}
              >
                {saving ? "Creating..." : "Create Goal"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setGoalName("");
                  setGoalTarget("");
                  setCurrentAmount("");
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: "white",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoalId === goal.id}
              onToggle={() => {
                setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id);
              }}
              onAddSavings={(goal) => {
                setSelectedGoalForSavings(goal);
                setShowAddSavingsModal(true);
              }}
              onEdit={(goal) => {
                setEditingGoal(goal);
                setEditName(goal.goal_name);
                setEditTarget(goal.target_amount.toString());
                setShowEditModal(true);
              }}
              onDelete={handleDeleteGoal}
              onUpdate={updateGoal}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "48px 32px",
          textAlign: "center",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "12px",
          border: "1px solid var(--border-light)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>🎯</div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px 0" }}>No goals yet</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 20px 0", maxWidth: "300px", marginLeft: "auto", marginRight: "auto" }}>
            Start building your savings by creating your first goal. It only takes a minute!
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "var(--primary-main)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddSavingsModal && selectedGoalForSavings && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "420px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
              Add Savings
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px 0" }}>
              {selectedGoalForSavings.goal_name}
            </p>

            <div style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", marginBottom: "24px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 4px 0", fontWeight: 600 }}>Current Progress</p>
              <p style={{ fontSize: "16px", color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>
                M{Number(selectedGoalForSavings.current_amount).toFixed(2)} / M{Number(selectedGoalForSavings.target_amount).toFixed(2)}
              </p>
            </div>

            <form onSubmit={handleAddSavings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Amount to Add</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={savingsLoading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: savingsLoading ? "var(--text-muted)" : "var(--primary-main)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: savingsLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  {savingsLoading ? "Adding..." : "Add Savings"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSavingsModal(false);
                    setSavingsAmount("");
                    setSelectedGoalForSavings(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "420px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 24px 0", color: "var(--text-primary)" }}>
              Edit Goal
            </h2>

            <form onSubmit={handleEditGoal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Goal Name</label>
                <input
                  type="text"
                  placeholder="Goal name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: saving ? "var(--text-muted)" : "var(--primary-main)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGoal(null);
                    setEditName("");
                    setEditTarget("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
