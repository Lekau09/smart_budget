/**
 * gamification.js — Utility functions for SmartSpend gamification system
 */

export const BADGES = {
  FIRST_TRANSACTION: {
    id: 'first_transaction',
    name: 'First Step',
    icon: '🎯',
    description: 'Add your first transaction',
    color: '#EF4444',
  },
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Week Warrior',
    icon: '🔥',
    description: 'Track expenses for 7 consecutive days',
    color: '#F97316',
  },
  BUDGET_KEEPER: {
    id: 'budget_keeper',
    name: 'Budget Keeper',
    icon: '🛡️',
    description: 'Stay under budget for a full month',
    color: '#10B981',
  },
  SAVINGS_STARTER: {
    id: 'savings_starter',
    name: 'Saver',
    icon: '🐷',
    description: 'Save M500 in a month',
    color: '#F59E0B',
  },
  GOAL_GETTER: {
    id: 'goal_getter',
    name: 'Goal Getter',
    icon: '🏆',
    description: 'Complete your first savings goal',
    color: '#8B5CF6',
  },
  CATEGORIZER: {
    id: 'categorizer',
    name: 'Organizer',
    icon: '📂',
    description: 'Categorize 20 transactions',
    color: '#3B82F6',
  },
  RISING_STAR: {
    id: 'level_5',
    name: 'Rising Star',
    icon: '⭐',
    description: 'Reach Level 5',
    color: '#FBBF24',
  },
  SMS_PRO: {
    id: 'sms_pro',
    name: 'SMS Pro',
    icon: '📱',
    description: 'Auto-import 10 transactions via SMS',
    color: '#06B6D4',
  },
  ANALYST: {
    id: 'analyst',
    name: 'Analyst',
    icon: '📊',
    description: 'Check Analytics page 5 times',
    color: '#EC4899',
  },
  MONTH_MASTER: {
    id: 'month_master',
    name: 'Month Master',
    icon: '👑',
    description: 'Stay under budget 3 months in a row',
    color: '#D97706',
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Add a transaction after 10pm',
    color: '#6366F1',
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Add a transaction before 7am',
    color: '#F59E0B',
  },
};

/**
 * XP rewards for various actions
 */
export const XP_REWARDS = {
  ADD_TRANSACTION:     10,
  SMS_AUTO_IMPORT:     15,
  CREATE_GOAL:         25,
  COMPLETE_GOAL:      100,
  STAY_UNDER_BUDGET:   50,
  CATEGORIZE_EXPENSE:   5,
  DAILY_LOGIN:          5,
  MONTHLY_REVIEW:      20,
};

/**
 * Calculate level from total XP
 * Curve: 100, 120, 144, 172, ... (×1.2 each level)
 */
export function calculateLevel(totalXP) {
  let level = 1;
  let xpNeeded = 100;
  let cumulativeXP = 0;

  while (cumulativeXP + xpNeeded <= totalXP) {
    cumulativeXP += xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.2);
  }

  const currentLevelXP = totalXP - cumulativeXP;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100));

  return { level, currentLevelXP, nextLevelXP: xpNeeded, progressPercent };
}

export function checkBadges(stats) {
  const unlocked = [];

  if (stats.totalTransactions >= 1)       unlocked.push(BADGES.FIRST_TRANSACTION);
  if (stats.consistencyStreak >= 7)        unlocked.push(BADGES.WEEK_STREAK);
  if (stats.underBudgetMonths >= 1)        unlocked.push(BADGES.BUDGET_KEEPER);
  if (stats.totalSaved >= 500)             unlocked.push(BADGES.SAVINGS_STARTER);
  if (stats.completedGoals >= 1)           unlocked.push(BADGES.GOAL_GETTER);
  if (stats.categorizedTransactions >= 20) unlocked.push(BADGES.CATEGORIZER);
  if (stats.smsImported >= 10)             unlocked.push(BADGES.SMS_PRO);
  if ((calculateLevel(stats.totalXP || 0).level) >= 5) unlocked.push(BADGES.RISING_STAR);
  if (stats.underBudgetMonths >= 3)        unlocked.push(BADGES.MONTH_MASTER);

  return unlocked;
}

export const LEVEL_NAMES = [
  '', 'Beginner', 'Saver', 'Tracker', 'Planner',
  'Analyst', 'Pro', 'Expert', 'Master', 'Elite', 'Legend',
];

export const CELEBRATION_MESSAGES = {
  LEVEL_UP:          (level) => `🎉 You reached Level ${level} — ${LEVEL_NAMES[level] || 'Legend'}!`,
  GOAL_COMPLETE:     (name)  => `🏆 Goal "${name}" completed!`,
  BADGE_UNLOCK:      (badge) => `${badge.icon} Unlocked: ${badge.name}`,
  UNDER_BUDGET:      '✅ You stayed under budget this month!',
  STREAK_MILESTONE:  (days)  => `🔥 ${days}-day tracking streak!`,
};