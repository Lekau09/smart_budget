/**
 * Gamification utilities for budgeting app
 * Tracks achievements, streaks, levels, and badges
 */

// Achievement badges
export const BADGES = {
  FIRST_TRANSACTION: {
    id: 'first_transaction',
    name: 'First Step',
    icon: '★',
    description: 'Add your first transaction',
    color: '#FF6B6B'
  },
  BUDGET_MASTER: {
    id: 'budget_master',
    name: 'Budget Master',
    icon: '◆',
    description: 'Stay under budget for 3 months',
    color: '#4ECDC4'
  },
  CONSISTENCY_STREAK: {
    id: 'consistency_streak',
    name: 'Consistency Streak',
    icon: '▲',
    description: 'Track expenses for 7 consecutive days',
    color: '#FF8C42'
  },
  SAVINGS_CHAMPION: {
    id: 'savings_champion',
    name: 'Savings Champion',
    icon: '◉',
    description: 'Save M5000 in a month',
    color: '#FFD700'
  },
  GOAL_MASTER: {
    id: 'goal_master',
    name: 'Goal Master',
    icon: '◈',
    description: 'Complete 3 savings goals',
    color: '#95E1D3'
  },
  EXPENSE_DETECTIVE: {
    id: 'expense_detective',
    icon: '◯',
    name: 'Expense Detective',
    description: 'Categorize 50 transactions',
    color: '#A8DADC'
  },
  LEVEL_5: {
    id: 'level_5',
    icon: '✦',
    name: 'Rising Star',
    description: 'Reach level 5',
    color: '#FFB703'
  },
  LEVEL_10: {
    id: 'level_10',
    icon: '✧',
    name: 'Financial Expert',
    description: 'Reach level 10',
    color: '#FB5607'
  }
};

/**
 * Calculate user level based on XP
 * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, etc.
 */
export function calculateLevel(totalXP) {
  let level = 1;
  let xpNeeded = 100;
  let cumulativeXP = 0;

  while (cumulativeXP + xpNeeded <= totalXP) {
    cumulativeXP += xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.2); // Increasing difficulty
  }

  return {
    level,
    currentLevelXP: totalXP - cumulativeXP,
    nextLevelXP: xpNeeded,
    progressPercent: Math.round(((totalXP - cumulativeXP) / xpNeeded) * 100)
  };
}

/**
 * Award XP for various activities
 */
export const XP_REWARDS = {
  ADD_TRANSACTION: 10,
  ADD_EXPENSE: 15,
  CREATE_GOAL: 25,
  COMPLETE_GOAL: 100,
  STAY_UNDER_BUDGET: 50,
  CATEGORIZE_EXPENSE: 5,
  SAVE_500: 25,
  SAVE_5000: 200,
  CONSISTENCY_DAILY: 5 // Daily bonus for tracking
};

/**
 * Check if user unlocked a badge
 */
export function checkBadges(stats) {
  const unlockedBadges = [];

  if (stats.totalTransactions >= 1) {
    unlockedBadges.push(BADGES.FIRST_TRANSACTION);
  }

  if (stats.underBudgetMonths >= 3) {
    unlockedBadges.push(BADGES.BUDGET_MASTER);
  }

  if (stats.consistencyStreak >= 7) {
    unlockedBadges.push(BADGES.CONSISTENCY_STREAK);
  }

  if (stats.totalSaved >= 5000) {
    unlockedBadges.push(BADGES.SAVINGS_CHAMPION);
  }

  if (stats.completedGoals >= 3) {
    unlockedBadges.push(BADGES.GOAL_MASTER);
  }

  if (stats.categorizedTransactions >= 50) {
    unlockedBadges.push(BADGES.EXPENSE_DETECTIVE);
  }

  const level = calculateLevel(stats.totalXP).level;
  if (level >= 5) {
    unlockedBadges.push(BADGES.LEVEL_5);
  }
  if (level >= 10) {
    unlockedBadges.push(BADGES.LEVEL_10);
  }

  return unlockedBadges;
}

/**
 * Format gamification stats for display
 */
export function formatGameStats(stats) {
  const level = calculateLevel(stats.totalXP || 0);

  return {
    level: level.level,
    xp: stats.totalXP || 0,
    currentLevelXP: level.currentLevelXP,
    nextLevelXP: level.nextLevelXP,
    progressPercent: level.progressPercent,
    streak: stats.consistencyStreak || 0,
    badges: checkBadges(stats)
  };
}

/**
 * Calculate performance metrics
 */
export function calculatePerformance(expenses, budget) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percentUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return {
    percentUsed: Math.round(percentUsed),
    message: percentUsed > 100 ? 'Over budget' : percentUsed >= 80 ? 'Caution zone' : 'On track',
    color: percentUsed > 100 ? '#FF6B6B' : percentUsed >= 80 ? '#FFD700' : '#4ECDC4'
  };
}

/**
 * Generate celebratory messages for achievements
 */
export const CELEBRATION_MESSAGES = {
  LEVEL_UP: (level) => `You've reached Level ${level}!`,
  GOAL_COMPLETE: (name) => `Goal "${name}" completed successfully`,
  BADGE_UNLOCK: (badge) => `${badge.icon} Unlocked: ${badge.name}`,
  UNDER_BUDGET: `You stayed under budget this month`,
  STREAK_START: `Tracking streak started`,
  STREAK_MILESTONE: (days) => `${days}-day tracking streak`
};
