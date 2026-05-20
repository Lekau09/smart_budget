import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE } from "../config/api";
import { useAuth } from "../hooks/useAuth";

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budget, setBudget] = useState({
    id: null,
    user_id: null,
    monthly_budget: 0,
    total_spent: 0,
    total_saved: 0,
  });
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [prediction, setPrediction] = useState({
    predicted_spend: null,
    predicted_deviation: null,
    confidence: null,
    months_used: 0,
    loading: false,
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("sb:user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  // Prefer authenticated user from AuthProvider when available
  const { user: authUser } = useAuth();

  const getActiveUser = (userId = null) => {
    if (userId) {
      console.log("[getActiveUser] Using passed userId:", userId);
      return { id: userId };
    }
    if (authUser && authUser.id) {
      console.log("[getActiveUser] Using authUser.id:", authUser.id);
      return authUser;
    }
    const stored = getCurrentUser();
    console.log("[getActiveUser] Falling back to localStorage user:", stored);
    return stored;
  };

  // Fetch dashboard data (budget + expenses)
  const fetchDashboard = async (userId = null, period = {}) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      console.warn("[fetchDashboard] No user found, skipping dashboard fetch");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Build URL with month and year parameters if provided
      const params = new URLSearchParams({ user_id: user.id });
      if (period.month) params.append("month", period.month);
      if (period.year) params.append("year", period.year);

      const url = `${API_BASE}/get-dashboard.php?${params.toString()}`;
      console.log(
        "[fetchDashboard] Making request to:",
        url,
        "for user_id:",
        user.id,
        "period:",
        period,
      );
      const response = await fetch(url);
      console.log("[fetchDashboard] Response status:", response.status);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      console.log("[fetchDashboard] Data received for user_id:", user.id, data);

      if (data.success) {
        // Store complete budget object with id, monthly_budget, total_spent, total_saved
        console.log("Setting budget:", data.budget);
        setBudget(
          data.budget || {
            id: null,
            user_id: user.id,
            monthly_budget: 0,
            total_spent: 0,
            total_saved: 0,
          },
        );
        setExpenses(data.expenses || []);
        setExpensesByCategory(data.categories || []);
        setGoals(data.goals || []);
        console.log("All user data stored:", {
          budget: data.budget,
          expensesCount: (data.expenses || []).length,
          categoriesCount: (data.categories || []).length,
          goalsCount: (data.goals || []).length,
        });
      } else {
        setError(data.error || "Failed to fetch dashboard");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount
  // When provider mounts or authenticated user changes, fetch their dashboard
  useEffect(() => {
    console.log("[BudgetProvider] authUser changed:", authUser);
    const user = getActiveUser();
    console.log("[BudgetProvider] getActiveUser returned:", user);
    if (user?.id) {
      console.log("[BudgetProvider] Fetching dashboard for user ID:", user.id);
      fetchDashboard(user.id);
    } else {
      console.warn("[BudgetProvider] No user found - clearing data");
      // Clear any previously loaded user data when logged out
      setBudget({
        id: null,
        user_id: null,
        monthly_budget: 0,
        total_spent: 0,
        total_saved: 0,
      });
      setExpenses([]);
      setExpensesByCategory([]);
      setGoals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Fetch all expenses
  const fetchExpenses = async (limit = 50, offset = 0, userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      console.warn("No user found, skipping expenses fetch");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/get-expenses.php?user_id=${user.id}&limit=${limit}&offset=${offset}`,
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses || []);
      } else {
        setError(data.error || "Failed to fetch expenses");
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all transactions (expenses + SMS extracted transactions)
  const fetchAllTransactions = async (
    limit = 100,
    offset = 0,
    userId = null,
  ) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      console.warn("No user found, skipping all transactions fetch");
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/get-all-transactions.php?user_id=${user.id}&limit=${limit}&offset=${offset}`,
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setExpenses(data.transactions || []);
        return data.transactions || [];
      } else {
        setError(data.error || "Failed to fetch transactions");
        return [];
      }
    } catch (err) {
      console.error("Error fetching all transactions:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async (
    description,
    amount,
    category,
    date,
    userId = null,
  ) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/add-expense.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          description,
          amount: parseFloat(amount),
          category,
          date,
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh dashboard data
        await fetchDashboard(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to add expense");
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    }
  };

  // Update budget
  const updateBudget = async (monthlyBudget, userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/update-budget.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          monthly_budget: parseFloat(monthlyBudget),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Use full budget object returned by API
        setBudget(
          data.budget || {
            id: null,
            user_id: user.id,
            monthly_budget: parseFloat(monthlyBudget),
            total_spent: 0,
            total_saved: 0,
          },
        );
        // Also refresh full dashboard to keep everything in sync
        await fetchDashboard(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to update budget");
      }
    } catch (err) {
      console.error("Error updating budget:", err);
      throw err;
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId, userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/delete-expense.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          expense_id: expenseId,
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh dashboard data
        await fetchDashboard(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  };

  // Update expense
  const updateExpense = async (
    expenseId,
    description,
    amount,
    category,
    date,
    userId = null,
  ) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/update-expense.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          expense_id: expenseId,
          description: description,
          amount: parseFloat(amount),
          category: category,
          date: date,
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh dashboard data
        await fetchDashboard(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to update expense");
      }
    } catch (err) {
      console.error("Error updating expense:", err);
      throw err;
    }
  };

  // Fetch goals
  const fetchGoals = async (userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      console.warn("No user found, skipping goals fetch");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/get-goals.php?user_id=${user.id}`,
      );
      const data = await response.json();

      if (data.success) {
        setGoals(data.goals || []);
      } else {
        setError(data.error || "Failed to fetch goals");
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add goal
  const addGoal = async (goalName, targetAmount, userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    const now = new Date();
    try {
      const response = await fetch(`${API_BASE}/add-goal.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          goal_name: goalName,
          target_amount: parseFloat(targetAmount),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh goals
        await fetchGoals(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to add goal");
      }
    } catch (err) {
      console.error("Error adding goal:", err);
      throw err;
    }
  };

  // Update goal progress
  const updateGoal = async (goalId, currentAmount, userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/update-goal.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          goal_id: goalId,
          current_amount: parseFloat(currentAmount),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh goals
        await fetchGoals(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to update goal");
      }
    } catch (err) {
      console.error("Error updating goal:", err);
      throw err;
    }
  };

  // Update goal details (name and target)
  const updateGoalDetails = async (
    goalId,
    goalName,
    targetAmount,
    userId = null,
  ) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/update-goal.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          goal_id: goalId,
          goal_name: goalName.trim(),
          target_amount: parseFloat(targetAmount),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh goals
        await fetchGoals(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to update goal");
      }
    } catch (err) {
      console.error("Error updating goal details:", err);
      throw err;
    }
  };

  // Delete goal
  const deleteGoal = async (goalId, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error("No user found");
    }

    try {
      const response = await fetch(`${API_BASE}/delete-goal.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          goal_id: goalId,
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh goals
        await fetchGoals(user.id);
        return data;
      } else {
        throw new Error(data.error || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
      throw err;
    }
  };

  // Fetch prediction for next month
  const fetchPrediction = useCallback(async (userId = null) => {
    const user = getActiveUser(userId);
    if (!user || !user.id) {
      console.warn("[fetchPrediction] No user found, skipping prediction fetch");
      return;
    }

    setPrediction((prev) => ({ ...prev, loading: true, error: null }));
    console.log("[fetchPrediction] Starting fetch for user_id:", user.id);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_BASE}/get-prediction.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[fetchPrediction] Response status:", response.status);

      if (!response.ok) {
        // Try to parse error response from API
        try {
          const errorData = await response.json();
          const errorMsg = errorData.error || `API returned status ${response.status}`;
          console.warn("[fetchPrediction] API error:", errorMsg, errorData);
          setPrediction((prev) => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));
          return;
        } catch (parseError) {
          // If we can't parse the error response, use the status
          throw new Error(`API returned status ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("[fetchPrediction] Data received:", data);

      if (data.success && data.predicted_spend !== undefined) {
        setPrediction({
          predicted_spend: data.predicted_spend,
          predicted_deviation: data.predicted_deviation,
          confidence: data.confidence,
          months_used: data.months_used,
          prediction_method: data.prediction_method || null,
          loading: false,
          error: null,
        });
        console.log("[fetchPrediction] Prediction set successfully");
      } else {
        const errorMsg = data.error || "Failed to fetch prediction";
        console.warn("[fetchPrediction] Prediction failed:", errorMsg);
        setPrediction((prev) => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
      }
    } catch (err) {
      const errorMsg = err.name === "AbortError"
        ? "Prediction request timed out"
        : err.message;
      console.error("[fetchPrediction] Error:", errorMsg);
      setPrediction((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const value = {
    budget,
    expenses,
    expensesByCategory,
    goals,
    prediction,
    loading,
    error,
    fetchDashboard,
    fetchExpenses,
    fetchAllTransactions,
    addExpense,
    updateExpense,
    updateBudget,
    deleteExpense,
    fetchGoals,
    addGoal,
    updateGoal,
    updateGoalDetails,
    deleteGoal,
    fetchPrediction,
  };

  console.log("📦 BudgetContext value:", {
    budget: value.budget,
    expensesCount: value.expenses.length,
    categoriesCount: value.expensesByCategory.length,
    goalsCount: value.goals.length,
    loading: value.loading,
  });

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
