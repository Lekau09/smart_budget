import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budget, setBudget] = useState({
    id: null,
    user_id: null,
    monthly_budget: 0,
    total_spent: 0,
    total_saved: 0
  });
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('sb:user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  // Fetch dashboard data (budget + expenses)
  const fetchDashboard = async (userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      console.warn('No user found, skipping dashboard fetch');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/get-dashboard.php?user_id=${user.id}`;
      console.log('Fetching dashboard from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dashboard data received:', data);

      if (data.success) {
        // Store complete budget object with id, monthly_budget, total_spent, total_saved
        console.log('Setting budget:', data.budget);
        setBudget(data.budget || {
          id: null,
          user_id: user.id,
          monthly_budget: 0,
          total_spent: 0,
          total_saved: 0
        });
        setExpenses(data.expenses || []);
        setExpensesByCategory(data.categories || []);
        setGoals(data.goals || []);
        console.log('All user data stored:', {
          budget: data.budget,
          expensesCount: (data.expenses || []).length,
          categoriesCount: (data.categories || []).length,
          goalsCount: (data.goals || []).length
        });
      } else {
        setError(data.error || 'Failed to fetch dashboard');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    const user = getCurrentUser();
    console.log('BudgetProvider mounted, user:', user);
    if (user?.id) {
      console.log('Fetching dashboard for user:', user.id);
      fetchDashboard(user.id);
    } else {
      console.warn('No user found in BudgetProvider useEffect');
    }
  }, []);

  // Fetch all expenses
  const fetchExpenses = async (limit = 50, offset = 0, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      console.warn('No user found, skipping expenses fetch');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/get-expenses.php?user_id=${user.id}&limit=${limit}&offset=${offset}`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses || []);
      } else {
        setError(data.error || 'Failed to fetch expenses');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async (description, amount, category, date, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/add-expense.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to add expense');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  };

  // Update budget
  const updateBudget = async (monthlyBudget, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/update-budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          monthly_budget: parseFloat(monthlyBudget),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Extract the monthly_budget value from the returned budget object
        setBudget(parseFloat(data.budget.monthly_budget));
        // Also refresh full dashboard to keep everything in sync
        await fetchDashboard(user.id);
        return data;
      } else {
        throw new Error(data.error || 'Failed to update budget');
      }
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/delete-expense.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to delete expense');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  // Update expense
  const updateExpense = async (expenseId, description, amount, category, date, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/update-expense.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to update expense');
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  // Fetch goals
  const fetchGoals = async (userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      console.warn('No user found, skipping goals fetch');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/get-goals.php?user_id=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setGoals(data.goals || []);
      } else {
        setError(data.error || 'Failed to fetch goals');
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add goal
  const addGoal = async (goalName, targetAmount, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/add-goal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          goal_name: goalName,
          target_amount: parseFloat(targetAmount),
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh goals
        await fetchGoals(user.id);
        return data;
      } else {
        throw new Error(data.error || 'Failed to add goal');
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      throw err;
    }
  };

  // Update goal progress
  const updateGoal = async (goalId, currentAmount, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/update-goal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to update goal');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      throw err;
    }
  };

  // Update goal details (name and target)
  const updateGoalDetails = async (goalId, goalName, targetAmount, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/update-goal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to update goal');
      }
    } catch (err) {
      console.error('Error updating goal details:', err);
      throw err;
    }
  };

  // Delete goal
  const deleteGoal = async (goalId, userId = null) => {
    const user = userId ? { id: userId } : getCurrentUser();
    if (!user || !user.id) {
      throw new Error('No user found');
    }

    try {
      const response = await fetch(`${API_BASE}/delete-goal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to delete goal');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  const value = {
    budget,
    expenses,
    expensesByCategory,
    goals,
    loading,
    error,
    fetchDashboard,
    fetchExpenses,
    addExpense,
    updateExpense,
    updateBudget,
    deleteExpense,
    fetchGoals,
    addGoal,
    updateGoal,
    updateGoalDetails,
    deleteGoal,
  };

  console.log('📦 BudgetContext value:', {
    budget: value.budget,
    expensesCount: value.expenses.length,
    categoriesCount: value.expensesByCategory.length,
    goalsCount: value.goals.length,
    loading: value.loading
  });

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
