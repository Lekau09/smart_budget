import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useAuth } from "../../hooks/useAuth";
import { useBudget } from "../../context/BudgetContext";
import { Trash2, Filter, TrendingDown, ChevronDown, Clock, X as IconX } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faCartShopping, faCoffee, faBolt, faBus, faQuestionCircle, faCreditCard, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import PageContainer from "../../components/layouts/PageContainer";
import { useNotification } from "../../context/NotificationContext";
import AddExpenseModal from "../../../components/AddExpenseModal";

export default function Transactions() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { expenses, loading, addExpense, deleteExpense, fetchExpenses } = useBudget();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState("expense");

  const categories = [
    { name: "Food", icon: faUtensils, color: "#EF4444" },
    { name: "Transport", icon: faBus, color: "#3B82F6" },
    { name: "Entertainment", icon: faCoffee, color: "#8B5CF6" },
    { name: "Health", icon: faCreditCard, color: "#10B981" },
    { name: "Utilities", icon: faBolt, color: "#F59E0B" },
    { name: "Shopping", icon: faCartShopping, color: "#EC4899" },
    { name: "Other", icon: faQuestionCircle, color: "#64748B" }
  ];

  const categoryMap = categories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat }), {});

  useEffect(() => {
    if (user?.id) fetchExpenses();
  }, [user?.id]);

  useEffect(() => {
    setTransactions(expenses);
  }, [expenses]);

  async function handleAddTransaction(e) {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      addNotification("Please fill all fields with valid amount", "error");
      return;
    }

    setSaving(true);
    try {
      await addExpense(description.trim(), Number(amount), category || "Other", date);
      setDescription("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
      setType("expense");
      setShowForm(false);
      addNotification("Transaction added successfully", "success");
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to add transaction", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteExpense(id);
      addNotification("Transaction deleted successfully", "success");
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to delete transaction", "error");
    }
  }

  // Filter and sort
  let filteredTransactions = filterCategory === "All"
    ? transactions
    : transactions.filter(t => t.category === filterCategory);

  filteredTransactions = filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgTransaction = filteredTransactions.length > 0 ? (totalSpent / filteredTransactions.length).toFixed(2) : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>↻</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading transactions…</div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer variant="standard">
      {/* Header with Add Button */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>Transactions</h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>Track and manage all your transactions</p>
        </div>
        {/* Beautiful Add Transaction Button */}
        <button
          onClick={() => setShowAddExpenseModal(true)}
          style={{
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#0946CC',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(11, 95, 255, 0.3)',
            whiteSpace: 'nowrap',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0946CC';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(11, 95, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0946CC';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 95, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Add a new transaction"
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '16px' }} />
          Add Transaction
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`message message-${message.type}`} style={{ marginBottom: '1rem' }}>
          {message.type === "success" ? "✓" : "!"} {message.text}
        </div>
      )}

      {error && (
        <div className="message message-error" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchExpenses} className="btn btn-sm btn-danger">
            Retry
          </button>
        </div>
      )}

      {/* Summary Stats - Compact Grid */}
      {filteredTransactions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spent</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>M{totalSpent.toFixed(2)}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>M{avgTransaction}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>per transaction</p>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highest</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>M{Math.max(...filteredTransactions.map(t => Number(t.amount))).toFixed(2)}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>single transaction</p>
          </div>
        </div>
      )}

      {/* Filters and Sort - Compact Inline */}
      <div className="card" style={{ padding: '20px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '16px', alignItems: 'start' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setFilterCategory("All")}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              border: filterCategory === "All" ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filterCategory === "All" ? 'rgba(11, 95, 255, 0.1)' : 'transparent',
              color: filterCategory === "All" ? 'var(--primary)' : 'var(--text-primary)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: filterCategory === "All" ? '600' : '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (filterCategory !== "All") {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (filterCategory !== "All") {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.name}
              onClick={() => setFilterCategory(c.name)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: filterCategory === c.name ? `1px solid ${c.color}` : '1px solid var(--border)',
                backgroundColor: filterCategory === c.name ? c.color + '15' : 'transparent',
                color: filterCategory === c.name ? c.color : 'var(--text-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: filterCategory === c.name ? '600' : '500',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (filterCategory !== c.name) {
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterCategory !== c.name) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Add Transaction Form - Compact */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: '1rem 1.5rem', borderBottom: showForm ? '1px solid var(--border)' : 'none' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>New Transaction</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '0.625rem 1rem',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: showForm ? 'var(--surface-secondary)' : 'var(--primary)',
              color: showForm ? 'var(--text-primary)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!showForm) {
                e.target.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!showForm) {
                e.target.style.opacity = '1';
              }
            }}
          >
            {showForm ? <IconX size={16} /> : '+'} {showForm ? "Close" : "Add"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddTransaction} style={{ padding: '1.5rem', display: "grid", gap: '1rem' }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g., Coffee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--surface-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  border: 'none',
                  backgroundColor: saving ? 'var(--slate-400)' : 'var(--primary)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Transactions List - Beautiful Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            const catData = categories.find(c => c.name === t.category) || categories[6];
            const isIncome = t.type === 'income';
            const dateObj = new Date(t.date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let dateLabel = '';
            if (dateObj.toDateString() === today.toDateString()) {
              dateLabel = 'Today';
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
              dateLabel = 'Yesterday';
            } else {
              dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            return (
              <div
                key={t.id}
                style={{
                  backgroundColor: 'white',
                  border: `1px solid ${catData.color}20`,
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 200ms ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = catData.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${catData.color}20`;
                }}
              >
                {/* Background accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '80px',
                  height: '80px',
                  backgroundColor: catData.color,
                  borderRadius: '50%',
                  opacity: '0.05',
                  transform: 'translate(25%, -25%)'
                }} />

                {/* Header with icon and delete button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: catData.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: catData.color,
                    fontSize: '20px'
                  }}>
                    <FontAwesomeIcon icon={catData.icon} />
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF444415';
                      e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#999';
                    }}
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Description */}
                <h3 style={{
                  margin: '0 0 6px 0',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {t.description || "Transaction"}
                </h3>

                {/* Category and date */}
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {t.category} · {dateLabel}
                </p>

                {/* Note if exists */}
                {t.note && (
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    "{t.note}"
                  </p>
                )}

                {/* Amount */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: isIncome ? '#10B981' : catData.color,
                    letterSpacing: '-0.5px'
                  }}>
                    {isIncome ? '+' : '-'}M
                  </span>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: isIncome ? '#10B981' : catData.color
                  }}>
                    {Number(t.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              borderRadius: '12px', 
              backgroundColor: 'var(--surface-secondary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: '28px', color: '#bbb' }} />
            </div>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: "var(--neutral-900)" }}>
              No transactions yet
            </div>
            <div style={{ fontSize: '13px', marginBottom: '20px', color: '#888' }}>
              {filterCategory !== "All" ? "No transactions in this category." : "Start by adding your first transaction."}
            </div>
            {filterCategory !== "All" && (
              <button
                onClick={() => setFilterCategory("All")}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid var(--primary)',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                View All Transactions
              </button>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
