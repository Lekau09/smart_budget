# SmartSpend - Complete Project Documentation

> **Consolidated from 180+ redundant documentation files into one comprehensive guide.**
> Last updated: April 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Architecture Overview](#2-architecture-overview)
3. [Design System](#3-design-system)
4. [App Workflow & Features](#4-app-workflow--features)
5. [Backend Integration](#5-backend-integration)
6. [Database Setup](#6-database-setup)
7. [ML Prediction System](#7-ml-prediction-system)
8. [SMS Forwarder & Auto-Processing](#8-sms-forwarder--auto-processing)
9. [Apache & Network Configuration](#9-apache--network-configuration)
10. [Savings Goals Refactor](#10-savings-goals-refactor)
11. [Deployment & Production](#11-deployment--production)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Getting Started

### Prerequisites

- **Node.js 18+** — for frontend
- **XAMPP** (Apache + MySQL + PHP 7.4+) — for backend
- **Python 3.8+** — for SMS processing (optional)

### Quick Start

**1. Start XAMPP**
- Open XAMPP Control Panel
- Click **Start** on both **Apache** and **MySQL**
- Confirm both say "Running"

**2. Install Frontend Dependencies**
```powershell
cd c:\xampp\htdocs\smart_budget
npm install
```

**3. Start the App**
```powershell
# Local access only
npm run dev

# Network access (for phone/other devices)
npm run dev -- --host
```

**4. Open in Browser**
- Local: `http://localhost:5173`
- Network: `http://YOUR_IP:5173`

### First-Time Setup

1. **Sign Up** — Create an account with email, password, name, and phone number
2. **Set Budget** — Enter your monthly budget on the Dashboard
3. **Add Expenses** — Record your spending via "Add Expense"
4. **Create Savings Goals** — Set targets for vacation, emergency fund, etc.
5. **Allocate Savings** — Use "+ Add Savings" on any goal card

---

## 2. Architecture Overview

### Project Structure

```
smart_budget/
├── src/                              # React frontend
│   ├── components/                   # Reusable UI components
│   │   ├── Sidebar.jsx               # Navigation sidebar
│   │   ├── Navbar.jsx                # Top navigation bar
│   │   ├── SetBudgetModal.jsx        # Budget setting modal
│   │   ├── AddExpenseModal.jsx       # Expense entry modal
│   │   ├── GoalCard.jsx              # Savings goal card (collapsible)
│   │   ├── Layouts/                  # Page layout components
│   │   └── ...
│   ├── features/                     # Page-level components
│   │   ├── dashboard/Dashboard.jsx   # Main dashboard
│   │   ├── transactions/Transactions.jsx
│   │   ├── savings/Savings.jsx
│   │   └── analytics/Analytics.jsx
│   ├── context/                      # React Context providers
│   │   ├── BudgetContext.jsx         # Global budget state
│   │   ├── AuthContext.jsx           # Authentication state
│   │   └── NotificationContext.jsx   # Toast notifications
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.jsx
│   │   ├── useBudget.jsx
│   │   └── ...
│   ├── router/AppRouter.jsx          # React Router configuration
│   ├── config/api.js                 # API base URLs
│   └── index.css                     # Global styles + CSS variables
├── backend/                          # PHP backend APIs
│   ├── api/                          # REST API endpoints
│   │   ├── signup.php
│   │   ├── login.php
│   │   ├── get-dashboard.php
│   │   ├── update-budget.php
│   │   ├── add-expense.php
│   │   ├── delete-expense.php
│   │   ├── get-goals.php
│   │   ├── add-goal.php
│   │   ├── update-goal.php
│   │   ├── delete-goal.php
│   │   └── ...
│   ├── config/                       # Database configuration
│   └── database.sql                  # Schema
├── public/                           # Static assets
├── package.json
└── vite.config.js
```

### Data Flow

```
┌─────────────┐     HTTP Requests     ┌──────────────┐
│   React UI  │ ────────────────────> │  PHP APIs    │
│  (Frontend) │ <──────────────────── │  (Backend)   │
└──────┬──────┘      JSON Responses   └─────────────┘
       │                                     │
       │  State Management                   │  Database
       ▼                                     ▼
┌─────────────┐                       ┌──────────────┐
│  Context    │                       │   MySQL      │
│  Providers  │                       │   Database   │
└─────────────┘                       └──────────────┘
```

### Key Architectural Patterns

- **State Management**: React Context API (`BudgetContext`, `AuthContext`)
- **Routing**: React Router v6 (protected routes with `<ProtectedRoute>`)
- **API Communication**: `fetch()` with JSON, centralized `API_BASE` config
- **Styling**: CSS variables in `index.css`, component-scoped styles
- **Authentication**: JWT tokens stored in localStorage

---

## 3. Design System

### Color Palette

#### Primary Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--primary-main` | `#0B5FFF` | Buttons, links, active states |
| `--primary-lighter` | `#EEF4FF` | Hover backgrounds |
| `--primary-lightest` | `#F5F9FF` | Subtle tints |

#### Neutral Colors
| Level | Value | Usage |
|-------|-------|-------|
| 900 | `#051033` | Primary text, headlines |
| 700 | `#2B2F36` | Body text |
| 500 | `#6B7280` | Secondary/muted text |
| 300 | `#D1D5DB` | Borders, dividers |
| 100 | `#F3F4F6` | Light backgrounds |
| 50 | `#F9FAFB` | Page background |

#### Semantic Colors
| Purpose | Color | Light Variant |
|---------|-------|---------------|
| Success | `#10B981` | `#D1FAE5` |
| Warning | `#F59E0B` | `#FEF3C7` |
| Danger | `#EF4444` | `#FEE2E2` |

#### Category Colors (Analytics)
| Category | Color |
|----------|-------|
| Food | `#EF4444` |
| Groceries | `#F59E0B` |
| Transport | `#3B82F6` |
| Entertainment | `#8B5CF6` |
| Health | `#10B981` |
| Utilities | `#FBBF24` |
| Shopping | `#EC4899` |
| Other | `#64748B` |

### Typography

```css
/* Font Stack */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Type Scale */
Page titles:    28px / 800 weight
Section titles: 20px / 700 weight
Subheadings:    16px / 600 weight
Body text:      14px / 500 weight
Secondary:      13px / 500 weight
Captions:       12px / 400 weight
```

### Button System

```jsx
/* Available Classes */
btn-primary      /* Main actions (blue) */
btn-secondary    /* Alternative actions (gray) */
btn-success      /* Positive actions (green) */
btn-danger       /* Destructive actions (red) */
btn-warning      /* Cautionary actions (orange) */
btn-ghost        /* Minimal text-only (transparent) */
btn-outline      /* Bordered alternative */

/* Sizes */
btn-small        /* 8px padding */
btn              /* 11px padding (default) */
btn-large        /* 14px padding */
```

### Spacing System

```css
--s-xxs: 4px;
--s-xs:  8px;
--s-sm:  12px;
--s-md:  16px;
--s-lg:  24px;
--s-xl:  32px;
--s-2xl: 48px;
```

### Border Radius

| Value | Usage |
|-------|-------|
| 4px | Small elements |
| 8px | Buttons, cards, modals |
| 12px | Large containers |
| 999px | Circles, pills |

### Shadows

```css
xs:  0 1px 2px rgba(0,0,0,0.05)   /* Subtle hover */
sm:  0 2px 4px rgba(0,0,0,0.05)   /* Card hover */
md:  0 4px 6px rgba(0,0,0,0.1)    /* Floating */
lg:  0 10px 15px rgba(0,0,0,0.1)  /* Modals */
xl:  0 20px 25px rgba(0,0,0,0.1)  /* Maximum elevation */
```

### HCI Principles

1. **Visual Hierarchy** — Clear type scale guides the eye
2. **Consistency** — Unified CSS variables across all pages
3. **Accessibility** — WCAG AA contrast ratios, focus states, ARIA labels
4. **Feedback** — Hover states, loading spinners, toast notifications
5. **User Control** — Modal dismissal, undo capability, clear cancellation
6. **Error Prevention** — Input validation, confirmation dialogs

---

## 4. App Workflow & Features

### Pages

#### Dashboard
**Purpose:** Central hub for financial overview and quick actions

**Sections:**
- **Financial Overview** — Month-at-a-glance header
- **Time Period Filter** — Week/Month/Year snapshots
- **KPI Cards** (4-column grid):
  - Monthly Budget
  - Total Spent
  - Remaining Budget
  - Total Saved
- **Expense Breakdown** — Pie chart by category
- **Recent Transactions** — Latest 5 expenses
- **Savings Goals Preview** — Top 3 goals with progress bars and "+ Add Savings"

**Quick Actions:**
- "Set Budget" — Open budget modal
- "Add Expense" — Record new spending
- "Add Savings" — Contribute to any goal

#### Transactions
**Purpose:** View and manage individual expense records

**Features:**
- Full expense list with category, description, amount, date
- Add/Edit/Delete expenses
- Filter by category
- Sort by date or amount

#### Savings
**Purpose:** Create, manage, and track financial goals

**Features:**
- Overall stats: Total Saved, Active Goals, Average Progress
- Goal cards with progress bars (color-coded by completion)
- Create new goals (name + target amount)
- "+ Add Savings" on each goal (modal with amount entry)
- Delete goals with confirmation
- Collapsible card design (click to expand/collapse)

#### Analytics
**Purpose:** Detailed analysis of spending patterns

**Features:**
- KPI summary cards
- Predicted Spend card (ML-based forecast)
- Spending by Category (horizontal bar chart)
- Weekly Spending Trend (line chart vs budget)
- Per-category spending breakdown with percentages

### Core Workflows

#### Setting Up Your Budget
```
1. Dashboard → "Set Budget" button
2. Enter monthly budget (e.g., M10,000)
3. System calculates:
   - Total Spent (from expenses)
   - Remaining = Budget - Spent
```

#### Creating a Savings Goal
```
1. Navigate to Savings page
2. Enter goal name and target amount
3. Goal appears in grid with 0% progress
4. Click "+ Add Savings" to contribute
```

#### Contributing to a Savings Goal
```
1. Click "+ Add Savings" on any goal card
2. Modal opens showing current progress
3. Enter contribution amount
4. Progress bar updates immediately
5. Success notification confirms
```

#### Tracking Monthly Spending
```
1. Dashboard → View expense breakdown pie chart
2. Check Recent Transactions section
3. For details → "View All" → Transactions page
4. Dashboard updates automatically
```

### Data Relationships

```
Budget (root)
├── Expenses (reduce available budget)
│   ├── Tracked in Transactions
│   ├── Aggregated in Analytics
│   └── Shown as "Total Spent"
├── Savings Goals (allocate remaining budget)
│   ├── Created in Savings
│   ├── Tracked with progress bars
│   └── Updated via "+ Add Savings"
└── Remaining = Budget - Spent
```

### Real-Time Sync

All pages update automatically when:
- Adding/editing/deleting an expense
- Setting or changing budget
- Creating/updating/deleting a goal
- Adding money to a goal

### State Management (BudgetContext)

```javascript
{
  budget: { id, user_id, monthly_budget, total_spent, total_saved },
  expenses: [{ id, category, description, amount, date }],
  expensesByCategory: [{ name, value }],
  goals: [{ id, goal_name, target_amount, current_amount }],
  prediction: { predicted_spend, predicted_deviation, confidence, months_used },
  loading: boolean,
  error: string|null,
  // Methods
  fetchDashboard, fetchExpenses, addExpense, updateExpense,
  deleteExpense, updateBudget, fetchGoals, addGoal,
  updateGoal, updateGoalDetails, deleteGoal, fetchPrediction
}
```

---

## 5. Backend Integration

### API Base Configuration

```javascript
// src/config/api.js
export const API_BASE = "http://localhost:8080/smart_budget/backend/api";
export const ML_API_BASE = "http://localhost:5000";  // ML prediction service
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `signup.php` | Register new user |
| POST | `login.php` | Authenticate user |
| GET | `get-dashboard.php?user_id=X&month=M&year=Y` | Full dashboard data |
| POST | `update-budget.php` | Set/update monthly budget |
| GET | `get-expenses.php?user_id=X&limit=N&offset=O` | Paginated expenses |
| POST | `add-expense.php` | Record new expense |
| POST | `delete-expense.php` | Remove expense |
| POST | `update-expense.php` | Modify expense |
| GET | `get-goals.php?user_id=X` | All savings goals |
| POST | `add-goal.php` | Create new goal |
| POST | `update-goal.php` | Update goal progress |
| POST | `delete-goal.php` | Remove goal |
| POST | `get-prediction.php` | ML spending forecast |
| GET | `get-all-transactions.php` | Combined expenses + SMS transactions |

### Request/Response Format

All APIs use JSON:

```javascript
// Request
{
  "user_id": 10,
  "monthly_budget": 5000,
  "category_budgets": [...]  // optional
}

// Response
{
  "success": true,
  "budget": { "id": 1, "monthly_budget": 5000, ... },
  "expenses": [...],
  "categories": [...],
  "goals": [...]
}
```

### Authentication Flow

1. User signs up via `signup.php` → JWT token generated
2. Token stored in `localStorage` (`sb:token`)
3. User data stored in `localStorage` (`sb:user`)
4. `<ProtectedRoute>` checks auth before rendering pages
5. `useAuth` hook provides login/logout/user state

### BudgetContext Initialization

```javascript
// BudgetProvider mounts → fetches dashboard for current user
useEffect(() => {
  if (user?.id) {
    fetchDashboard(user.id);
  }
}, [user]);
```

---

## 6. Database Setup

### Database Name
`smart_budget` (or `sms_financial` for SMS features)

### Main Tables

```sql
-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  monthly_budget DECIMAL(12,2) DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_saved DECIMAL(12,2) DEFAULT 0,
  month INT,
  year INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Expenses
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Savings Goals
CREATE TABLE savings_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Category Budgets
CREATE TABLE category_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  allocated_amount DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);
```

### Setup Instructions

**XAMPP (MySQL):**
```powershell
# 1. Start MySQL in XAMPP Control Panel
# 2. Create database
mysql -u root -p
CREATE DATABASE smart_budget;
USE smart_budget;
SOURCE database.sql;
```

**Connection Test:**
```powershell
cd c:\xampp\htdocs\smart_budget\backend
python -c "import pymysql; print('OK')"
```

---

## 7. ML Prediction System

### Overview

SmartSpend uses machine learning to predict users' end-of-month spending based on their historical budget vs. actual spending patterns. The system helps users understand if they're likely to exceed their budget.

### How It Works

```
User Expense History (Database)
    ↓
Monthly Aggregation (PHP - get-prediction.php)
    ↓
Feature Construction (4-month deviations)
    ↓
ML Prediction (Python - SGDRegressor)
    ↓
Predicted Spend + Confidence Score
    ↓
Frontend Display (Analytics Page)
```

### Prediction Methods by Data Availability

The system uses **progressive prediction** - different methods based on how much data the user has:

| Months of Data | Method | Confidence | Description |
|----------------|--------|------------|-------------|
| **0 months** | Budget Baseline | 20% | Uses budget as prediction (assume user spends their budget) |
| **1 month** | Single Month | 30% | Uses that month's actual spending |
| **2 months** | Simple Average | 50% | Average of the two months |
| **3 months** | Trend-Adjusted | 65% | Average + 25% weight on recent trend |
| **4+ months** | ML Model (SGDRegressor) | 79%+ | Full machine learning prediction |

### ML Model Architecture

**Algorithm:** SGDRegressor (Stochastic Gradient Descent)

**Features:**
- Month 1 deviation from budget
- Month 2 deviation from budget
- Month 3 deviation from budget
- Month 4 deviation from budget

**Target:** Month 5 deviation from budget

**Training:**
- Pre-trained on 500+ user records
- Current R² Score: **0.809** (explains 80.9% of variance)
- MAE: M224.56 (average prediction error)

### Files & Endpoints

| File | Purpose |
|------|---------|
| `backend/api/get-prediction.php` | Main prediction endpoint, handles progressive methods |
| `backend/ml/predict.php` | PHP bridge to Python prediction script |
| `backend/ml/run_prediction.py` | Python script that loads model and makes predictions |
| `backend/ml/budget_model.pkl` | Trained SGDRegressor model file |
| `backend/ml/scaler.pkl` | StandardScaler for feature normalization |
| `backend/ml/model_metrics.json` | Current R² score and performance metrics |
| `src/features/analytics/Analytics.jsx` | Frontend prediction display |
| `src/context/BudgetContext.jsx` | `fetchPrediction()` function |

### API Endpoint

**POST** `backend/api/get-prediction.php`

**Request:**
```json
{
  "user_id": 10
}
```

**Response (Success - ML Method):**
```json
{
  "success": true,
  "predicted_spend": 5234.50,
  "predicted_deviation": 234.50,
  "budget_used": 5000.00,
  "months_used": 4,
  "month_data": [...],
  "confidence": 0.809,
  "prediction_method": "ml_model"
}
```

**Response (Success - Statistical Method):**
```json
{
  "success": true,
  "predicted_spend": 4850.00,
  "predicted_deviation": -150.00,
  "budget_used": 5000.00,
  "months_used": 2,
  "month_data": [...],
  "confidence": 0.5,
  "prediction_method": "simple_average"
}
```

### Online Learning (Month-End Updates)

The SGDRegressor model supports **incremental learning** via `partial_fit()`. At month-end, the system:

1. **Collects Data**: Gathers all users' completed month data (budget vs actual spend)
2. **Updates Model**: Calls `model.partial_fit(new_data)` to adjust weights incrementally
3. **Recalculates R²**: Evaluates the updated model on the combined dataset
4. **Saves Artifacts**: Updates `budget_model.pkl`, `scaler.pkl`, and `model_metrics.json`

**Scripts:**

| Script | Purpose |
|--------|---------|
| `backend/ml/update_model_month_end.php` | Month-end update orchestrator |
| `backend/ml/update_model_partial_fit.py` | Python script for partial_fit and R² recalculation |
| `backend/ml/evaluate_model.py` | Standalone model evaluation (uses real dataset) |

**Run Month-End Update:**
```bash
cd c:\xampp\htdocs\smart_budget\backend\ml
php update_model_month_end.php
```

**Evaluate Current Performance:**
```bash
cd c:\xampp\htdocs\smart_budget\backend\ml
python evaluate_model.py
```

### R² Score Fluctuation

**Why R² Changes:**

The R² score **will fluctuate** after each model update because:

1. **New Data Patterns**: New users may have different spending patterns, model adapts
2. **Learning Rate**: SGDRegressor's learning rate controls how much new data influences weights
3. **Dataset Growth**: More data = more representative, R² becomes more accurate over time
4. **Seasonal Changes**: Users spend differently in different months (holidays, paydays)

**Normal vs Problematic Changes:**

| Scenario | R² Change | Action |
|----------|-----------|--------|
| Small changes (±2-3%) | 0.80 → 0.82 → 0.79 | Normal, no action needed |
| Gradual improvement | 0.80 → 0.82 → 0.84 → 0.86 | Model learning well, keep going |
| Stable after growth | 0.85 → 0.85 → 0.84 | Model converged, good! |
| Massive drop (>10%) | 0.80 → 0.65 | Check data quality, learning rate too high |
| Consistent decline | 0.80 → 0.75 → 0.70 → 0.65 | Model may be overfitting, reduce learning rate |
| R² < 0.5 | Poor prediction | Retrain from scratch with full dataset |

**Key Insight:** R² fluctuation is a **FEATURE, NOT A BUG**. It shows the model is learning and adapting to real user behavior.

### Best Practices

1. **Update Monthly**: Run month-end updates consistently
2. **Monitor R² Trend**: Look at trajectory, not individual values
3. **Backup Model**: Keep copies of previous model versions
4. **Retrain Periodically**: Every 6-12 months, retrain from scratch on full dataset
5. **Track Data Quality**: Ensure new data is clean and representative

### Cold Start Solution

For users with **less than 4 months** of data, the system provides **statistical predictions** instead of waiting for the ML model:

- **0 months**: Uses budget as baseline (assumes user spends their full budget)
- **1-2 months**: Simple average of available months
- **3 months**: Average with trend detection (recent vs older spending)

This ensures **all users get predictions from day 1**, and predictions improve as more data accumulates.

### Frontend Display

The Analytics page shows:

1. **Predicted Spend Card**: Displays predicted amount, deviation from budget, and progress bar
2. **Confidence Badge**: Shows "Estimate" for statistical methods, no badge for ML
3. **Dynamic Message**: Shows appropriate confidence text based on method:
   - ML: "Model confidence: 81% based on 4 months of data"
   - Statistical: "Preliminary estimate • 50% confidence • 2 months of data"
4. **Error Handling**: User-friendly messages for insufficient data or API failures

---

## 8. SMS Forwarder & Auto-Processing

### Overview

SmartSpend can automatically categorize expenses from SMS transaction messages using a webhook-based SMS forwarder system.

### How It Works

```
SMS Received on Phone
    ↓
SMS Forwarder App (Android)
    ↓
Webhook POST → Your Server
    ↓
Backend SMS Processing API
    ↓
ML Category Prediction
    ↓
Auto-created Expense in Database
    ↓
Dashboard Updates Automatically
```

### Setup Steps

**1. Install SMS Forwarder App**
- Download "SMS Forwarder" from Google Play Store
- Or use any app that can POST SMS to a webhook URL

**2. Get Your Webhook URL**
- Sign up in the app
- A modal will display your unique webhook URL
- Copy it

**3. Configure SMS Forwarder**
- Open SMS Forwarder app
- Add new rule
- Paste your webhook URL
- Set filter: Forward all SMS (or specific senders like banks)

**4. Test**
- Send a test SMS to your phone (e.g., "You paid M20.00 to John")
- Check Dashboard → Transactions for auto-created expense

### Webhook Configuration

Your webhook URL looks like:
```
http://YOUR_IP:8080/smart_budget/backend/api/sms-webhook.php
```

The endpoint expects POST with JSON body:
```json
{
  "messages": [
    {
      "address": "MTN Bank",
      "body": "You paid M20.00 to John for services. Ref: TZ123456",
      "date": 1705332600
    }
  ]
}
```

### SMS Processing Features

- **Automatic parsing** — Extracts amount, merchant, reference
- **ML categorization** — Predicts category (Food, Transport, etc.)
- **Duplicate prevention** — Checks for existing identical transactions
- **Cash withdrawal detection** — Special handling for ATM/bank withdrawals
- **Fallback category** — "Other" if category cannot be predicted

### Supported SMS Formats

The system recognizes common patterns:
```
"You paid M20.00 to MerchantName"
"Payment of M500.00 to Vendor"
"Bank to wallet transfer of M100.00"
"ATM withdrawal of M200.00"
"Purchase M75.00 at StoreName"
```

---

## 9. Apache & Network Configuration

### For Local Development Only

If you need network access (phone/other devices on same WiFi):

### Step 1: Open Apache Config

```
C:\xampp\apache\conf\httpd.conf
```

### Step 2: Add Network Listen Port

Find `Listen 80` (around line 219), add after it:
```apache
Listen 80
Listen 192.168.32.13:80    # YOUR actual IP
```

### Step 3: Allow Network Access

Find the `<Directory />` section (around line 233):
```apache
<Directory />
    AllowOverride all
    Require all granted
</Directory>
```

### Step 4: Restart Apache

1. XAMPP Control Panel → Apache → Stop
2. Wait 2 seconds → Start
3. Verify: `netstat -ano | findstr ":80"`

### Step 5: Firewall Rules (if needed)

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="XAMPP-HTTP" dir=in action=allow protocol=tcp localport=80
netsh advfirewall firewall add rule name="Vite-Dev" dir=in action=allow protocol=tcp localport=5173
```

### Testing

```powershell
# From laptop
Invoke-WebRequest http://localhost:8080/smart_budget/backend/api/signup.php

# From phone browser
http://YOUR_IP:8080/smart_budget/
http://YOUR_IP:5173/
```

---

## 10. Savings Goals Refactor

### GoalCard Component

A reusable, collapsible card component for savings goals.

**Features:**
- Collapse/expand with smooth 200ms animation
- Progress calculation (current/target percentage)
- Semantic color coding (blue < 50%, amber 50-75%, green 75%+)
- Keyboard accessible (Enter/Space to toggle)
- Responsive design

**Props:**
```jsx
<GoalCard
  goal={{ id, goal_name, target_amount, current_amount }}
  isExpanded={boolean}
  onToggle={() => void}
  onAddSavings={() => void}
  onDelete={() => void}
/>
```

### Files Modified

```
src/components/GoalCard.jsx          ← NEW (145 lines)
src/components/GoalCard.css          ← NEW (290 lines)
src/features/savings/Savings.jsx     ← UPDATED (uses GoalCard)
src/features/goals/Goals.jsx         ← UPDATED (uses GoalCard)
```

### Design Decisions

- **Vertical stack layout** instead of grid for better readability
- **Collapsible cards** reduce visual clutter on pages with many goals
- **Progress bars** with gradient fill for visual appeal
- **Color-coded status** — blue (starting), amber (progressing), green (nearly complete)

---

## 11. Deployment & Production

### Pre-Deployment Checklist

- [ ] All API endpoints return proper JSON
- [ ] Authentication working (login/logout)
- [ ] All CRUD operations tested
- [ ] Budget context syncing correctly
- [ ] SMS webhook tested with real SMS
- [ ] Error handling in place (toasts, form validation)
- [ ] No console errors in browser dev tools
- [ ] Responsive on mobile/tablet/desktop
- [ ] Database backed up
- [ ] Environment variables configured

### Production Build

```powershell
# Build frontend
npm run build

# Output: dist/ folder
# Deploy to any static host (Netlify, Vercel, Apache)
```

### Environment Variables

```javascript
// src/config/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/smart_budget/backend/api";
export const ML_API_BASE = import.meta.env.VITE_ML_API_BASE || "http://localhost:5000";
```

### Apache Production Config

```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/smart_budget/dist"
    ServerName yourdomain.com
    
    <Directory "C:/xampp/htdocs/smart_budget/dist">
        AllowOverride All
        Require all granted
    </Directory>
    
    # SPA routing fallback
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
</VirtualHost>
```

---

## 12. Troubleshooting

### Common Issues

#### "Maximum update depth exceeded" in Analytics
**Cause:** `fetchPrediction` was not wrapped in `useCallback`, causing infinite re-renders.
**Fix:** Wrapped `fetchPrediction` in `useCallback` with `[authUser]` dependency.

#### "Module not found: AddExpenseModal"
**Cause:** Incorrect import path in Transactions.jsx
**Fix:** Changed from `../../components` to `../../../components`

#### Apache won't start after config change
**Cause:** Port 80 already in use or syntax error in httpd.conf
**Fix:**
```powershell
# Check port usage
netstat -ano | findstr ":80"

# Kill conflicting process
taskkill /PID <PID> /F
```

#### "Access denied for user 'root'" (Database)
**Cause:** Wrong MySQL password in config
**Fix:** Update password in `backend/config/database.php`

#### SMS webhook not receiving messages
**Causes:**
- Firewall blocking incoming connections
- Incorrect webhook URL in SMS Forwarder app
- Apache not listening on network IP
**Fix:** Follow Apache network config steps above, verify webhook URL

#### Budget not updating after set
**Cause:** Dashboard not refreshing after budget update
**Fix:** `updateBudget` now calls `fetchDashboard` after successful API call

#### Prediction request timed out
**Cause:** ML service not running at `localhost:5000`
**Fix:** Start the Python ML prediction service, or ignore (feature is optional)

### Debug Tools

```javascript
// Check localStorage
console.log(localStorage.getItem('sb:user'));
console.log(localStorage.getItem('sb:token'));

// Check BudgetContext
// Open React DevTools → Components → BudgetProvider
// Inspect state values

// Check API connectivity
fetch('http://localhost:8080/smart_budget/backend/api/signup.php')
  .then(r => r.json())
  .then(console.log);
```

### Log Files

| Location | Content |
|----------|---------|
| `backend/logs/sms_system.log` | SMS processing events |
| Browser Console | Frontend errors, API logs |
| `C:\xampp\apache\logs\error.log` | Apache errors |
| `C:\xampp\mysql\data\*.err` | MySQL errors |

---

## Quick Reference

### Key Commands

```powershell
# Start everything
# 1. XAMPP → Start Apache + MySQL
# 2. Terminal:
npm run dev

# With network access
npm run dev -- --host

# Build for production
npm run build

# Lint check
npm run lint

# Python SMS processing
cd backend
python "Extracting Financial SMS Data with Python (1).py"
```

### Important URLs

| Environment | URL |
|-------------|-----|
| Dev (local) | `http://localhost:5173` |
| Dev (network) | `http://YOUR_IP:5173` |
| Backend API | `http://localhost:8080/smart_budget/backend/api/` |
| ML Service | `http://localhost:5000` |
| phpMyAdmin | `http://localhost/phpmyadmin` |

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/context/BudgetContext.jsx` | Global state management |
| `src/hooks/useAuth.jsx` | Authentication logic |
| `src/router/AppRouter.jsx` | Route definitions |
| `src/config/api.js` | API base URLs |
| `backend/config/database.php` | Database connection |
| `src/index.css` | Global CSS variables |

---

*This document consolidates all project documentation. All redundant markdown files can be safely deleted.*
*For API-specific documentation, see individual PHP files in `backend/api/` — each contains inline documentation.*
