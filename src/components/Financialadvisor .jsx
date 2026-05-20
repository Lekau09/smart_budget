import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Brain } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../hooks/useAuth';

const SUGGESTED = [
  "Am I on track with my budget?",
  "Which category am I overspending in?",
  "How much will I spend by end of month?",
  "Can I afford M200 this weekend?",
  "Give me 3 tips to save more",
  "What is my daily spending rate?",
  "How many days until my budget runs out?",
  "What should I do when I get paid?",
];

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, padding:'2px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:7, height:7, borderRadius:'50%', background:'#9CA3AF',
          animation:'sbDot 1.2s infinite', animationDelay:`${i*0.2}s` }}/>
      ))}
      <style>{`@keyframes sbDot{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER ENGINE — handles virtually any personal finance question
// ─────────────────────────────────────────────────────────────────────────────
function generateAnswer(question, ctx, goals) {
  const q = question.toLowerCase().trim();
  const {
    budget, spent, remaining, pctUsed, daysLeft, daysElapsed,
    dailyRate, projected, categories, topCat, topCatAmount,
    daysUntilEmpty, willOverspend, overBy, monthName,
    totalTransactions, weeklyRate,
  } = ctx;

  const fmt   = v => `M${Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const fmts  = v => `M${Math.round(Number(v)).toLocaleString()}`;
  const dailyAllowance = daysLeft > 0 ? remaining / daysLeft : 0;
  const idealDaily     = budget > 0 ? budget / (daysElapsed + daysLeft) : 0;

  // Extract amount from question
  const extractAmount = () => {
    const m = q.match(/m\s*(\d[\d,]*\.?\d*)/i) || q.match(/(\d[\d,]*\.?\d*)\s*(maloti|loti|lsl)/i) || q.match(/(\d[\d,]+)/);
    return m ? parseFloat((m[1]||m[2]).replace(',','')) : null;
  };
  const amount = extractAmount();

  // Extract category
  const CAT_NAMES = ['food','groceries','transport','entertainment','health','utilities','shopping','subscriptions','other'];
  const mentionedCat = CAT_NAMES.find(c => q.includes(c));
  const catData = mentionedCat ? categories.find(c => c.category.toLowerCase() === mentionedCat) : null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const statusLine = () => willOverspend
    ? `⚠️ On pace to overspend by ${fmts(overBy)}`
    : `✅ On track — projected ${fmts(budget-projected)} under budget`;

  // ── GREETINGS ────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|howzit|hola|good morning|good afternoon|good evening|sup|yo)\b/.test(q)) {
    return `Hi! 👋 I'm your SmartSpend advisor. I know your real spending data so every answer I give uses your actual figures.\n\nQuick snapshot for ${monthName}:\n• Budget: ${fmt(budget)}\n• Spent: ${fmt(spent)} (${pctUsed}%)\n• Remaining: ${fmt(remaining)}\n• ${daysLeft} days left\n\n${statusLine()}\n\nAsk me anything!`;
  }

  // ── ON TRACK / STATUS ────────────────────────────────────────────────────
  if (/(on track|doing well|how am i|status|am i okay|am i good|progress)/.test(q)) {
    const idealByNow = budget * (daysElapsed / (daysElapsed + daysLeft));
    const diff = spent - idealByNow;
    if (diff <= idealByNow * 0.05) {
      return `✅ You are on track!\n\nIdeal spend by day ${daysElapsed}: ${fmts(idealByNow)}\nYour actual spend: ${fmt(spent)}\nDifference: ${fmt(Math.abs(diff))} ${diff < 0 ? 'under ✅' : 'over'}\n\nProjected month-end: ${fmts(projected)}\nBudget: ${fmt(budget)}\nSurplus: ${fmts(budget-projected)} ✅\n\nKeep spending at ${fmt(dailyAllowance)}/day and you'll finish comfortably.`;
    }
    return `⚠️ Slightly over pace.\n\nIdeal spend by day ${daysElapsed}: ${fmts(idealByNow)}\nYour actual spend: ${fmt(spent)} (+${fmts(diff)} over pace)\n\nProjected month-end: ${fmts(projected)} — ${fmts(overBy)} over budget.\n\nFix: reduce to ${fmt(dailyAllowance)}/day for the remaining ${daysLeft} days.\nTop category to cut: ${topCat} (${fmt(topCatAmount)}).`;
  }

  // ── FULL SUMMARY ─────────────────────────────────────────────────────────
  if (/(summary|overview|breakdown|report|tell me everything|full picture)/.test(q)) {
    const catLines = categories.slice(0,6).map(c =>
      `  • ${c.category}: ${fmt(c.spent_so_far)}${c.at_risk ? ' ⚠️' : ' ✅'}`).join('\n');
    return `📋 ${monthName} Full Summary\n\n━━ BUDGET ━━\n• Total: ${fmt(budget)}\n• Spent: ${fmt(spent)} (${pctUsed}%)\n• Remaining: ${fmt(remaining)}\n• Daily allowance: ${fmt(dailyAllowance)}/day\n\n━━ PACE ━━\n• Current rate: ${fmt(dailyRate)}/day\n• Ideal rate: ${fmt(idealDaily)}/day\n• Projected total: ${fmts(projected)}\n• Status: ${statusLine()}\n\n━━ CATEGORIES ━━\n${catLines || '  No data yet'}\n\n━━ TIME ━━\n• Day ${daysElapsed} of ${daysElapsed+daysLeft}\n• ${daysLeft} days remaining\n• Budget runway: ${daysUntilEmpty >= daysLeft ? 'Full month ✅' : `${daysUntilEmpty} days ⚠️`}`;
  }

  // ── MONTH-END PROJECTION ─────────────────────────────────────────────────
  if (/(end of month|month.?end|how much will i spend|spend by|projection|forecast|predict)/.test(q)) {
    if (willOverspend) {
      return `📈 Month-End Forecast\n\nAt ${fmt(dailyRate)}/day you will spend about ${fmts(projected)} — ${fmt(overBy)} over your ${fmt(budget)} budget.\n\nTo fix this over ${daysLeft} days:\n• Reduce to ${fmt(dailyAllowance)}/day\n• Cut ${topCat} spending (your biggest at ${fmt(topCatAmount)})\n• That means saving ${fmt(dailyRate - dailyAllowance)}/day from today\n\nWorst case: ${fmts(projected * 1.1)}\nBest case (if you cut): ${fmts(spent + dailyAllowance * daysLeft)}`;
    }
    return `📊 Month-End Forecast\n\nAt ${fmt(dailyRate)}/day you will spend about ${fmts(projected)} — ${fmts(budget-projected)} under budget! 🎉\n\nYou can still afford:\n• ${fmt(dailyAllowance)}/day comfortably\n• One-time splurge up to ${fmts(remaining * 0.4)} without risk\n\nBest case (if cautious): ${fmts(spent + dailyAllowance * 0.8 * daysLeft)}\nProjected: ${fmts(projected)}`;
  }

  // ── DAYS UNTIL BUDGET RUNS OUT ───────────────────────────────────────────
  if (/(run out|days left|how long|when will|runway|last me|budget.*last)/.test(q)) {
    if (daysUntilEmpty >= daysLeft) {
      return `✅ Budget Runway: Full Month\n\nYour ${fmt(remaining)} will last the entire ${daysLeft} remaining days (and beyond).\n\nAt ${fmt(dailyRate)}/day your money lasts ${daysUntilEmpty} more days.\nYou have ${fmt(dailyAllowance)}/day available — ${fmt(dailyAllowance - dailyRate)} more than you're spending.\n\nYou're in a comfortable position!`;
    }
    const runOutDate = new Date();
    runOutDate.setDate(runOutDate.getDate() + daysUntilEmpty);
    return `⚠️ Budget Runway: ${daysUntilEmpty} days\n\nAt ${fmt(dailyRate)}/day your ${fmt(remaining)} will run out around ${runOutDate.toLocaleDateString('en-US',{month:'short',day:'numeric'})} — ${daysLeft - daysUntilEmpty} days before month end.\n\nTo survive the full month:\n• Reduce to ${fmt(dailyAllowance)}/day\n• Cut ${topCat} by ${Math.round((dailyRate-dailyAllowance)/dailyRate*100)}%\n• Avoid non-essential purchases for the next ${Math.ceil(daysLeft/2)} days`;
  }

  // ── CAN I AFFORD / REALISTIC ─────────────────────────────────────────────
  if (/(can i afford|afford|realistic|i want to spend|should i buy|is it okay to|can i spend|is.*okay)/.test(q) && amount) {
    const afterSpend  = remaining - amount;
    const newDaily    = afterSpend / Math.max(daysLeft, 1);
    const pctOfRemain = Math.round((amount / remaining) * 100);
    if (amount <= remaining) {
      return `✅ Yes, you can afford ${fmts(amount)}.\n\nThat's ${pctOfRemain}% of your remaining ${fmt(remaining)}.\nAfter spending it you'd have ${fmt(afterSpend)} left — ${fmt(newDaily)}/day for ${daysLeft} days.\n\n${newDaily >= idealDaily * 0.7 ? '✅ You would still be on track.' : `⚠️ This would push your daily allowance to ${fmt(newDaily)}, below the ideal ${fmt(idealDaily)}.`}\n\n${catData ? `Your ${mentionedCat} total so far: ${fmt(catData.spent_so_far)}.` : ''}`;
    }
    return `❌ You cannot afford ${fmts(amount)} right now.\n\nYou only have ${fmt(remaining)} remaining — ${fmts(amount - remaining)} short.\n\nOptions:\n• Spend ${fmts(remaining * 0.5)} now and save the rest for later\n• Wait ${Math.ceil((amount-remaining)/Math.max(dailyAllowance-dailyRate, 1))} days until you've saved enough\n• Look for a cheaper alternative under ${fmts(remaining * 0.4)}`;
  }

  // ── WHAT CAN I BUY / AFFORD WITH ─────────────────────────────────────────
  if (/(what can i|what.*afford|afford with|buy with|spend.*on)/.test(q) && amount) {
    return `💡 With ${fmts(amount)} you could:\n\n• ${Math.floor(amount/50)} KFC meals (~M50 each)\n• ${Math.floor(amount/100)} taxi trips or bus rides (~M100)\n• ${Math.floor(amount/200)} grocery runs (~M200 for basics)\n• ${Math.floor(amount/300)} entertainment outings (~M300)\n\nNote: you currently have ${fmt(remaining)} remaining for the month, so spending ${fmts(amount)} would leave ${fmt(remaining-amount)} — ${fmt((remaining-amount)/Math.max(daysLeft,1))}/day for ${daysLeft} days.`;
  }

  // ── WHAT IF SCENARIOS ────────────────────────────────────────────────────
  if (/(what if|if i spend|if i cut|if i save|suppose|scenario)/.test(q) && amount) {
    const isSpending = /(spend|buy|purchase|pay)/.test(q);
    if (isSpending) {
      const newRemaining = remaining - amount;
      const newProjected = spent + amount + (dailyRate * daysLeft);
      return `📊 What-If: Spending ${fmts(amount)}\n\nRemaining after: ${fmt(Math.max(0, newRemaining))}\nNew daily allowance: ${fmt(Math.max(0,newRemaining)/Math.max(daysLeft,1))}/day\nNew month-end projection: ${fmts(newProjected)}\n\n${newProjected > budget ? `⚠️ You would end the month ${fmts(newProjected-budget)} over budget.` : `✅ You would still finish within budget with ${fmts(budget-newProjected)} to spare.`}`;
    } else {
      const savedDaily  = dailyRate - (amount / Math.max(daysLeft,1));
      const newProj     = spent + savedDaily * daysLeft;
      return `📊 What-If: Saving ${fmts(amount)} more\n\nRequired daily cut: ${fmt(amount/Math.max(daysLeft,1))}/day\nNew daily target: ${fmt(Math.max(0,savedDaily))}/day\nNew month-end projection: ${fmts(newProj)}\n\n${newProj <= budget ? `✅ Achievable! That's ${fmts(budget-newProj)} under budget.` : `⚠️ Still ${fmts(newProj-budget)} over budget — cut more.`}`;
    }
  }

  // ── SAVE / CUT BACK ─────────────────────────────────────────────────────
  if (/(save|cut back|reduce|spend less|lower|decrease|budget.*tight|help.*budget)/.test(q)) {
    const target   = amount || Math.round(overBy > 0 ? overBy : budget * 0.1);
    const newDaily = (remaining - target) / Math.max(daysLeft, 1);
    const savings  = [];
    categories.slice(0,3).forEach(c => {
      if (c.at_risk) savings.push(`• Cut ${c.category} by 30% → save ${fmts(c.daily_rate * 0.3 * daysLeft)}`);
    });
    if (!savings.length && topCat) savings.push(`• Cut ${topCat} by 20% → save ${fmts(topCatAmount * 0.2)}`);
    savings.push(`• Reduce to ${fmt(Math.max(dailyAllowance,0))}/day → save ${fmts(Math.max(0,(dailyRate-dailyAllowance)*daysLeft))}`);
    return `💡 How to Save ${fmts(target)} More\n\nCurrent daily: ${fmt(dailyRate)}\nTarget daily: ${fmt(Math.max(0,newDaily))}\n\nBest opportunities:\n${savings.join('\n')}\n\n${newDaily < 0 ? `⚠️ Saving ${fmts(target)} isn't possible this month — try ${fmts(remaining * 0.25)} instead.` : `✅ Reducing to ${fmt(newDaily)}/day will save you ${fmts(target)} by month end.`}`;
  }

  // ── OVERSPENDING CATEGORY ────────────────────────────────────────────────
  if (/(overspend|over budget|too much|which category|most money|biggest expense|where.*money going|where.*spend)/.test(q)) {
    const atRisk = categories.filter(c => c.at_risk);
    if (!topCat) return `I don't have enough spending data yet. Send a few more transactions and I'll identify your spending patterns.`;
    if (!atRisk.length) {
      return `✅ No categories are overspending!\n\nYour spending distribution:\n${categories.slice(0,5).map(c=>`  • ${c.category}: ${fmt(c.spent_so_far)} (${Math.round(c.spent_so_far/spent*100)}%)`).join('\n')}\n\nHighest category: ${topCat} at ${fmt(topCatAmount)}\n\nAll categories are within reasonable limits. Keep it up!`;
    }
    return `⚠️ Categories at risk:\n\n${atRisk.map(c=>`  • ${c.category}\n    Spent: ${fmt(c.spent_so_far)}\n    Projected: ${fmts(c.projected_total)}\n    Over fair share by: ${fmts(c.projected_total - c.fair_share)}`).join('\n\n')}\n\nAction: Limit ${atRisk[0].category} to ${fmt(catData?.fair_share/Math.max(daysLeft,1) || 0)}/day for the rest of the month.`;
  }

  // ── SPECIFIC CATEGORY ───────────────────────────────────────────────────
  if (mentionedCat && !/(what is|explain|define)/.test(q)) {
    if (!catData) return `No ${mentionedCat} transactions recorded yet this month.\n\nYou have ${fmt(remaining)} remaining overall. Once you spend on ${mentionedCat} I'll track it automatically.`;
    const monthPct = Math.round(catData.projected_total / budget * 100);
    return `📂 ${catData.category} Analysis\n\nSpent so far: ${fmt(catData.spent_so_far)}\nDaily rate: ${fmt(catData.daily_rate)}/day\nProjected month-end: ${fmts(catData.projected_total)} (${monthPct}% of your budget)\nFair share: ${fmts(catData.fair_share)}\n\nStatus: ${catData.at_risk
      ? `⚠️ AT RISK — projected to exceed fair share by ${fmts(catData.projected_total - catData.fair_share)}.\nLimit to ${fmt((catData.fair_share - catData.spent_so_far) / Math.max(daysLeft,1))}/day to stay in range.`
      : `✅ Within budget range.`}\n\nThis represents ${Math.round(catData.spent_so_far/spent*100)}% of your total spending.`;
  }

  // ── DAILY / WEEKLY RATE ─────────────────────────────────────────────────
  if (/(daily|per day|average|rate|weekly|per week)/.test(q)) {
    const isWeekly = /(weekly|per week|week)/.test(q);
    if (isWeekly) {
      return `📊 Weekly Spending\n\nThis week: ${fmt(weeklyRate * 7)}\nWeekly allowance: ${fmts(dailyAllowance * 7)}\nIdeal weekly: ${fmts(idealDaily * 7)}\n\n${weeklyRate * 7 > idealDaily * 7 ? `⚠️ Spending ${fmts(weeklyRate*7 - idealDaily*7)} more than ideal per week.` : `✅ Within your weekly budget.`}\n\nRemaining for ${daysLeft} days: ${fmt(remaining)}`;
    }
    return `📊 Daily Spending Rate\n\nYour rate: ${fmt(dailyRate)}/day\nIdeal rate: ${fmt(idealDaily)}/day\nRemaining allowance: ${fmt(dailyAllowance)}/day\n\nDifference: ${dailyRate > idealDaily
      ? `⚠️ Spending ${fmt(dailyRate - idealDaily)} more than ideal`
      : `✅ ${fmt(idealDaily - dailyRate)} under ideal`}\n\nAt current rate, you'll spend ${fmts(projected)} by month end (budget: ${fmt(budget)}).`;
  }

  // ── REMAINING BUDGET ────────────────────────────────────────────────────
  if (/(remaining|left|balance|how much do i have|available|left over)/.test(q)) {
    return `💰 Remaining Budget\n\nYou have ${fmt(remaining)} left for ${monthName}.\n\n• Daily allowance: ${fmt(dailyAllowance)}/day for ${daysLeft} days\n• Weekly allowance: ${fmts(dailyAllowance*7)}/week\n• One-time budget: up to ${fmts(remaining*0.4)} without risk\n\n${willOverspend
      ? `⚠️ Warning: at ${fmt(dailyRate)}/day you'll overspend by ${fmts(overBy)}.`
      : `✅ At ${fmt(dailyRate)}/day you'll stay within budget.`}`;
  }

  // ── PAYDAY ADVICE ───────────────────────────────────────────────────────
  if (/(payday|paid|salary|get paid|income|receive money|just got paid)/.test(q)) {
    return `💵 Payday Financial Plan\n\nWhen you get paid, do this in order:\n\n1. Pay fixed bills first (rent, LEC, water)\n2. Set aside ${fmts(budget)} for this month's budget\n3. Transfer ${fmts(budget * 0.2)} to savings immediately\n4. Emergency fund top-up if needed\n5. Only then spend on wants\n\nYour current budget is ${fmt(budget)}/month.\nAt ${fmt(dailyRate)}/day you can manage ${daysLeft} more days on ${fmt(remaining)} remaining.\n\nRule of thumb: 50% needs, 30% wants, 20% savings.`;
  }

  // ── COMPARE CATEGORIES ──────────────────────────────────────────────────
  if (/(compare|comparison|versus|vs|difference between)/.test(q)) {
    if (categories.length < 2) return `I need more spending data to compare categories. You currently have ${categories.length} active category.`;
    const top2 = categories.slice(0,2);
    return `📊 Category Comparison\n\n${top2[0].category} vs ${top2[1].category}:\n\n  ${top2[0].category}: ${fmt(top2[0].spent_so_far)} (${Math.round(top2[0].spent_so_far/spent*100)}% of spending)\n  ${top2[1].category}: ${fmt(top2[1].spent_so_far)} (${Math.round(top2[1].spent_so_far/spent*100)}% of spending)\n\nDifference: ${fmt(top2[0].spent_so_far - top2[1].spent_so_far)} more on ${top2[0].category}.\n\n${top2[0].at_risk ? `⚠️ ${top2[0].category} is at risk of overspending.` : `✅ Both are within reasonable limits.`}`;
  }

  // ── SAVINGS GOALS ───────────────────────────────────────────────────────
  if (/(goal|saving for|target|saving.*laptop|saving.*rent|saving.*holiday|saving.*car|saving.*phone)/.test(q)) {
    const goalMatch = q.match(/(laptop|car|phone|rent|holiday|vacation|house|trip)/);
    const item = goalMatch ? goalMatch[1] : 'your goal';
    const savingsPerMonth = budget - projected;
    return `🎯 Savings Goal Planning\n\nAt your current pace you'll save about ${fmts(Math.max(0, savingsPerMonth))} this month.\n\n${amount
      ? `For your ${item} costing ${fmts(amount)}:\n• Months to save: ${Math.ceil(amount / Math.max(savingsPerMonth, 1))}\n• Monthly saving needed: ${fmts(amount / 3)} (3 months)\n• Monthly saving needed: ${fmts(amount / 6)} (6 months)\n\n${savingsPerMonth >= amount/3 ? '✅ You can achieve this in 3 months at current savings rate.' : `⚠️ You need to save more. Currently saving ${fmts(savingsPerMonth)}/month.`}`
      : `Use the Savings section to set a specific goal and track progress.\n\nYou have ${fmt(remaining)} remaining this month — putting ${fmts(remaining*0.3)} into savings now would build good habits.`}`;
  }

  // ── WORST SPENDING / BEST DAY ────────────────────────────────────────────
  if (/(worst|best|highest|most expensive|biggest|largest)/.test(q) && /(day|week|time|spend)/.test(q)) {
    return `📊 Spending Patterns\n\nHighest category: ${topCat} — ${fmt(topCatAmount)}\nThis is ${Math.round(topCatAmount/spent*100)}% of total spending.\n\n${categories.slice(0,3).map((c,i) => `${i+1}. ${c.category}: ${fmt(c.spent_so_far)}`).join('\n')}\n\nBiggest risk: ${categories.find(c=>c.at_risk)?.category || 'None currently'}\n\nMost spending typically happens on weekends and at month start — be extra careful then.`;
  }

  // ── TIPS / GENERAL ADVICE ────────────────────────────────────────────────
  if (/(tip|advice|suggest|help me|how can i|what should|improve|better|smarter|wise)/.test(q)) {
    const tips = [];
    if (willOverspend) tips.push(`Reduce spending to ${fmt(dailyAllowance)}/day — you're at ${fmt(dailyRate)}/day`);
    if (topCat) tips.push(`Cut ${topCat} (your biggest spend at ${fmt(topCatAmount)}) by 20–30%`);
    const atRisk = categories.filter(c => c.at_risk);
    if (atRisk.length) tips.push(`Watch ${atRisk.map(c=>c.category).join(', ')} — projected to overspend`);
    tips.push(`Save ${fmts(budget*0.2)} (20% of budget) before spending on wants`);
    tips.push(`Track daily: open SmartSpend each morning and check your remaining allowance`);
    tips.push(`Avoid spending more than ${fmt(remaining*0.15)} on any single non-essential purchase`);
    tips.push(`Cook at home 3–4 times a week to cut Food/Groceries spending significantly`);
    tips.push(`Use the 24-hour rule: wait a day before any purchase over ${fmts(remaining*0.1)}`);
    return `💡 Financial Tips for ${monthName}:\n\n${tips.slice(0,5).map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
  }

  // ── SAVINGS RATE / PERCENTAGE ────────────────────────────────────────────
  if (/(saving rate|savings rate|percentage|percent|how much.*save|saving.*percentage)/.test(q)) {
    const savingsRate = budget > 0 ? Math.max(0, Math.round(((budget-projected)/budget)*100)) : 0;
    return `📊 Savings Rate\n\nProjected savings this month: ${fmts(Math.max(0,budget-projected))} (${savingsRate}%)\n\nSpending: ${pctUsed}% of budget\nSaving: ${savingsRate}% of budget\n\nFinancial benchmarks:\n• 10% savings = minimum healthy\n• 20% savings = good standard\n• 30%+ savings = excellent\n\n${savingsRate >= 20 ? `✅ You're at ${savingsRate}% — excellent!` : savingsRate >= 10 ? `✅ You're at ${savingsRate}% — good, aim for 20%.` : `⚠️ You're at ${savingsRate}% — try to save more.`}`;
  }

  // ── BUDGET QUESTION ──────────────────────────────────────────────────────
  if (/(my budget|budget is|what.*budget|budget.*month|how much.*budget)/.test(q)) {
    return `💼 Your Budget\n\n${monthName} budget: ${fmt(budget)}\n\nBreakdown:\n• Spent: ${fmt(spent)} (${pctUsed}%)\n• Remaining: ${fmt(remaining)}\n• Daily allowance: ${fmt(dailyAllowance)}/day\n• Current rate: ${fmt(dailyRate)}/day\n\n${dailyRate <= dailyAllowance ? '✅ Spending within budget limits.' : `⚠️ Spending ${fmt(dailyRate-dailyAllowance)} over daily limit.`}\n\nTo change your budget, click "Set Budget" on the Dashboard.`;
  }

  // ── TRANSACTIONS ────────────────────────────────────────────────────────
  if (/(transaction|spent on|purchases|expenses|what.*buy|what.*paid|history)/.test(q)) {
    const catLines = categories.map(c => `  • ${c.category}: ${fmt(c.spent_so_far)} (${Math.round(c.spent_so_far/Math.max(spent,1)*100)}%)`).join('\n');
    return `🧾 ${monthName} Transactions\n\nTotal: ${fmt(spent)} across ${totalTransactions} transactions\n\nBy category:\n${catLines || '  No transactions yet'}\n\nTop spend: ${topCat || 'None'} — ${fmt(topCatAmount)}\nAverage transaction: ${fmt(spent/Math.max(totalTransactions,1))}`;
  }

  // ── EMERGENCY FUND ──────────────────────────────────────────────────────
  if (/(emergency fund|emergency|rainy day|unexpected|safety net)/.test(q)) {
    const target3m = dailyRate * 90;
    const target6m = dailyRate * 180;
    return `🛡️ Emergency Fund\n\nAn emergency fund covers 3–6 months of expenses for unexpected events (job loss, medical bills, car repairs).\n\nYour spending: ${fmt(dailyRate)}/day\n3-month target: ${fmts(target3m)}\n6-month target: ${fmts(target6m)}\n\nHow to build it:\n• Save ${fmts(budget*0.1)}/month → full in ${Math.ceil(target3m/(budget*0.1))} months\n• Save ${fmts(budget*0.2)}/month → full in ${Math.ceil(target3m/(budget*0.2))} months\n\nKeep it in a separate bank account you don't touch.`;
  }

  // ── DEBT ADVICE ─────────────────────────────────────────────────────────
  if (/(debt|loan|borrow|owe|credit|interest|pay off|repay)/.test(q)) {
    return `💳 Debt Management Advice\n\n1. List all debts with their interest rates\n2. Pay minimums on all debts first\n3. Then attack the highest-interest debt first (avalanche method)\n4. Or pay the smallest balance first for motivation (snowball method)\n\nYour budget is ${fmt(budget)}/month. After essential spending of ${fmt(spent)}, you have ${fmt(remaining)} available — allocate at least ${fmts(remaining*0.3)} towards debt repayment if possible.\n\nRule: Never borrow to pay other debt unless the new rate is significantly lower.`;
  }

  // ── INVESTMENT ADVICE ────────────────────────────────────────────────────
  if (/(invest|stock|shares|returns|grow money|put my money|financial future)/.test(q)) {
    return `📈 Investment Basics\n\nBefore investing, ensure:\n1. Emergency fund is fully funded\n2. High-interest debt is paid off\n3. You have stable monthly income\n\nIn Lesotho, options include:\n• Bank fixed deposits (low risk, 4–8% return)\n• Government bonds (low risk)\n• Unit trusts / mutual funds\n• Lesotho Stock Exchange\n\nWith your current budget of ${fmt(budget)}/month, aim to invest ${fmts(budget*0.1)}–${fmts(budget*0.2)}/month once your spending is stable.\n\nRule: Only invest money you won't need for 3+ years.`;
  }

  // ── INFLATION / ECONOMY ─────────────────────────────────────────────────
  if (/(inflation|economy|cost of living|prices|expensive|prices.*rise|rising cost)/.test(q)) {
    return `📊 Inflation & Your Budget\n\nInflation means prices rise over time. If inflation is 6%:\n• Something costing ${fmt(budget)} today costs ${fmts(budget*1.06)} next year\n• Your effective buying power decreases\n\nTo combat inflation:\n• Increase your income when possible\n• Invest in assets that grow above inflation\n• Buy non-perishables in bulk when on sale\n• Reduce discretionary spending (entertainment, dining out)\n\nYour current budget of ${fmt(budget)}/month should increase by at least 6% per year to maintain the same lifestyle.`;
  }

  // ── 50/30/20 RULE ───────────────────────────────────────────────────────
  if (/(50.30.20|rule|50 30 20|budget rule|how.*split|allocate|divide.*budget)/.test(q)) {
    return `📐 The 50/30/20 Budget Rule\n\nApplied to your ${fmt(budget)} budget:\n\n• 50% Needs: ${fmts(budget*0.5)}/month\n  (rent, food, transport, utilities)\n\n• 30% Wants: ${fmts(budget*0.3)}/month\n  (entertainment, eating out, shopping)\n\n• 20% Savings/Debt: ${fmts(budget*0.2)}/month\n  (savings goals, emergency fund, debt)\n\nYour current spending by category:\n${categories.slice(0,4).map(c=>`  • ${c.category}: ${fmt(c.spent_so_far)}`).join('\n') || '  No data yet'}\n\nAdjust your categories to fit this rule for healthy finances.`;
  }

  // ── WEEKEND SPENDING ────────────────────────────────────────────────────
  if (/(weekend|friday|saturday|sunday|going out|night out)/.test(q)) {
    const weekendBudget = dailyAllowance * 2;
    return `🎉 Weekend Budget\n\nBased on your remaining budget:\nWeekend allowance: ${fmts(weekendBudget)}\n\n${amount
      ? amount <= weekendBudget
        ? `✅ Spending ${fmts(amount)} this weekend is fine. That leaves ${fmt(remaining-amount)} for the rest of the month.`
        : `⚠️ ${fmts(amount)} is over your weekend allowance of ${fmts(weekendBudget)}. Consider ${fmts(weekendBudget)} instead.`
      : `You can spend up to ${fmts(weekendBudget)} this weekend without disrupting your budget.\n\nRemaining for the full month: ${fmt(remaining)}\nDays left after weekend: ${daysLeft - 2}`}`;
  }

  // ── INCOME / SALARY ─────────────────────────────────────────────────────
  if (/(income|salary|earn|how much.*earn|wage)/.test(q)) {
    return `💼 Income & Budget Relationship\n\nYour set budget: ${fmt(budget)}/month\n\nFor this budget to be sustainable:\n• Budget should be 70–80% of take-home income\n• Implied income: ${fmts(budget/0.75)}–${fmts(budget/0.70)}/month\n\nIf you earn more:\n• Increase savings first (aim 20%)\n• Don't increase lifestyle spending immediately\n\nCurrent spending rate: ${pctUsed}% of budget in ${daysElapsed} days.`;
  }

  // ── THANK YOU ────────────────────────────────────────────────────────────
  if (/(thank|thanks|appreciate|helpful|great|good job|awesome|well done)/.test(q)) {
    return `You're welcome! 😊\n\nRemember:\n• Remaining: ${fmt(remaining)} for ${daysLeft} more days\n• Daily allowance: ${fmt(dailyAllowance)}/day\n• Status: ${statusLine()}\n\nKeep tracking and I'll keep giving you accurate, personalised insights!`;
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────
  return `Here's your current financial snapshot for ${monthName}:\n\n• Budget: ${fmt(budget)}\n• Spent: ${fmt(spent)} (${pctUsed}%)\n• Remaining: ${fmt(remaining)}\n• Daily allowance: ${fmt(dailyAllowance)}/day for ${daysLeft} days\n• Projected total: ${fmts(projected)}\n• ${statusLine()}\n\nI can answer questions about:\n💰 Budget & spending  📊 Projections  🎯 Savings goals\n💳 Debt  📈 Investing  💡 Tips & advice\n\nTry asking something more specific!`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FinancialAdvisor() {
  const { user }                                 = useAuth();
  const { budget, expenses, expensesByCategory, goals } = useBudget();

  const INITIAL_MSG = [
    { role:'assistant', text:"Hi! I'm your SmartSpend advisor. I know your real spending data and can answer almost any finance question. What would you like to know?" }
  ];

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(INITIAL_MSG);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  // Reset chat when user changes (logout → login as different user)
  const prevUserId = useRef(user?.id);
  useEffect(() => {
    if (user?.id !== prevUserId.current) {
      setMessages(INITIAL_MSG);
      setInput('');
      setShowSugg(true);
      setOpen(false);
      prevUserId.current = user?.id;
    }
  }, [user?.id]);

  // Drag state — persists position across open/close
  const [pos,      setPos]      = useState({ x: window.innerWidth - 76, y: window.innerHeight - 76 });
  const [dragging, setDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStart  = useRef({ mx:0, my:0, bx:0, by:0 });

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { mx: clientX, my: clientY, bx: pos.x, by: pos.y };
    setDragging(true);
    setHasDragged(false);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStart.current.mx;
      const dy = clientY - dragStart.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasDragged(true);
      const newX = Math.max(26, Math.min(window.innerWidth  - 26, dragStart.current.bx + dx));
      const newY = Math.max(26, Math.min(window.innerHeight - 26, dragStart.current.by + dy));
      setPos({ x: newX, y: newY });
    };
    const onEnd = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onEnd);
    };
  }, [dragging]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 200); }, [open]);

  const buildContext = () => {
    const today       = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    const dayOfMonth  = today.getDate();
    const daysLeft    = daysInMonth - dayOfMonth;
    const monthName   = today.toLocaleString('default',{ month:'long', year:'numeric' });

    const totalBudget = Number(budget?.monthly_budget) || 0;
    const totalSpent  = Number(budget?.total_spent)    || 0;
    const totalSaved  = Number(budget?.total_saved)    || 0;
    const remaining   = Math.max(0, totalBudget - totalSpent - totalSaved);
    const pctUsed     = totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0;
    const dailyRate   = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const projected   = dailyRate * daysInMonth;
    const numCats     = Math.max((expensesByCategory||[]).length, 1);

    const cats = (expensesByCategory||[]).map(c => ({
      category:       c.name||c.category,
      spent_so_far:   Number(c.value)||0,
      daily_rate:     dayOfMonth > 0 ? (Number(c.value)||0)/dayOfMonth : 0,
      projected_total:dayOfMonth > 0 ? ((Number(c.value)||0)/dayOfMonth)*daysInMonth : 0,
      fair_share:     totalBudget/numCats,
      at_risk:        dayOfMonth > 0 && (((Number(c.value)||0)/dayOfMonth)*daysInMonth) > (totalBudget/numCats)*1.2,
    })).sort((a,b) => b.spent_so_far - a.spent_so_far);

    // Weekly rate from expenses (last 7 days)
    const weekAgo = new Date(today - 7*86400000);
    const weekSpend = (expenses||[]).filter(e => new Date(e.date) >= weekAgo)
      .reduce((s,e) => s + Number(e.amount), 0);

    return {
      budget:totalBudget, spent:totalSpent, remaining, pctUsed,
      daysLeft, daysElapsed:dayOfMonth, dailyRate, projected,
      overBy:Math.max(0,projected-totalBudget),
      willOverspend:projected>totalBudget,
      daysUntilEmpty:dailyRate>0?Math.floor(remaining/dailyRate):999,
      categories:cats, topCat:cats[0]?.category||'', topCatAmount:cats[0]?.spent_so_far||0,
      monthName, totalTransactions:(expenses||[]).length,
      weeklyRate: weekSpend/7,
    };
  };

  const sendMessage = async (text) => {
    // Privacy: Verify user is logged in before processing
    if (!user?.id) {
      alert('Please log in to use the advisor');
      return;
    }
    
    const userText = (text||input).trim();
    if (!userText||loading) return;
    setInput(''); 
    // Keep suggested questions visible instead of hiding them
    setMessages(prev => [...prev, { role:'user', text:userText }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      const ctx    = buildContext();
      const answer = generateAnswer(userText, ctx, goals||[]);
      setMessages(prev => [...prev, { role:'assistant', text:answer }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', text:"I couldn't process that. Try asking about your budget, spending rate, or a specific category." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {!open && (
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          onClick={() => { if (!hasDragged) setOpen(true); }}
          style={{
            position:'fixed',
            left: pos.x - 26,
            top:  pos.y - 26,
            zIndex:9000, width:52, height:52, borderRadius:'50%',
            background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',
            cursor: dragging ? 'grabbing' : 'grab',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(59,130,246,0.4)',
            userSelect:'none', touchAction:'none',
            transition: dragging ? 'none' : 'box-shadow 0.2s',
          }}>
          <Brain size={22} color="white"/>
          {/* Pulse ring */}
          <span style={{ position:'absolute', inset:-4, borderRadius:'50%',
            border:'2px solid rgba(59,130,246,0.4)',
            animation: dragging ? 'none' : 'sbPulse 2s infinite' }}/>
          <style>{`@keyframes sbPulse{0%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
        </div>
      )}

      {open && (
        <div style={{
          position:'fixed', left: Math.max(8, Math.min(window.innerWidth-368, pos.x-180)), top: Math.max(8, Math.min(window.innerHeight-568, pos.y-540)), zIndex:9000,
          width:360, height:560, background:'var(--bg-primary,white)',
          borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.18)',
          border:'1px solid var(--border-light,#E5E7EB)',
          display:'flex', flexDirection:'column',
          animation:'sbUp 250ms cubic-bezier(0.34,1.56,0.64,1)', overflow:'hidden' }}>
          <style>{`@keyframes sbUp{from{transform:translateY(30px) scale(0.92);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}`}</style>

          <div style={{ background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',
            padding:'14px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Brain size={16} color="white"/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'white' }}>SmartSpend Advisor</p>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.8)' }}>Powered by your spending data · Free</p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%',
              width:28, height:28, cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', color:'white' }}>
              <X size={14}/>
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 0' }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:12,
                flexDirection:m.role==='user'?'row-reverse':'row', alignItems:'flex-start' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0,
                  background:m.role==='user'?'#3B82F6':'#EFF6FF',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:700, color:m.role==='user'?'white':'#1D4ED8' }}>
                  {m.role==='user'?'Me':'AI'}
                </div>
                <div style={{ maxWidth:'82%', padding:'9px 13px',
                  borderRadius:m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',
                  background:m.role==='user'?'#3B82F6':'var(--bg-secondary,#F9FAFB)',
                  color:m.role==='user'?'white':'var(--text-primary,#111827)',
                  fontSize:13, lineHeight:1.6, whiteSpace:'pre-line' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:8, marginBottom:12, alignItems:'flex-start' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'#EFF6FF',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:700, color:'#1D4ED8', flexShrink:0 }}>AI</div>
                <div style={{ padding:'9px 13px', borderRadius:'4px 14px 14px 14px',
                  background:'var(--bg-secondary,#F9FAFB)' }}><TypingDots/></div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {showSugg && (
            <div style={{ padding:'8px 14px', flexShrink:0 }}>
              <p style={{ fontSize:11, color:'var(--text-muted,#9CA3AF)', marginBottom:6 }}>Try asking</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {SUGGESTED.slice(0,4).map((s,i) => (
                  <button key={i} onClick={() => sendMessage(s)} style={{
                    padding:'5px 10px', border:'1px solid var(--border-light,#E5E7EB)',
                    borderRadius:99, fontSize:11, background:'none',
                    color:'var(--text-secondary,#6B7280)', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#3B82F6';e.currentTarget.style.color='#3B82F6';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-light,#E5E7EB)';e.currentTarget.style.color='var(--text-secondary,#6B7280)';}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border-light,#E5E7EB)',
            display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && sendMessage()}
              placeholder="Ask anything about your finances..."
              disabled={loading}
              style={{ flex:1, padding:'8px 12px',
                border:'1px solid var(--border-light,#E5E7EB)', borderRadius:99,
                fontSize:13, outline:'none', background:'var(--bg-secondary,#F9FAFB)',
                color:'var(--text-primary,#111827)' }}/>
            <button onClick={() => sendMessage()} disabled={loading||!input.trim()} style={{
              width:34, height:34, borderRadius:'50%',
              background:input.trim()?'#3B82F6':'#E5E7EB', border:'none',
              cursor:input.trim()?'pointer':'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'background 0.15s', flexShrink:0 }}>
              <Send size={14} color={input.trim()?'white':'#9CA3AF'}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}