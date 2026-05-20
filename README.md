# SmartSpend

**Automated SMS-Based Personal Finance Tracker**
Capture bank SMS messages from your Android phone, classify them with Machine Learning, and visualise your spending — all in one dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Testing Without a Phone](#testing-without-a-phone)
- [Project Structure](#project-structure)
- [ML Classifier](#ml-classifier)
- [SMS Formats Supported](#sms-formats-supported)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Overview

SmartSpend connects to the **SMS Forwarder** Android app via a webhook. Incoming bank SMS messages are automatically parsed, enriched with ML-based category predictions, stored in MySQL, and surfaced through a React dashboard where users can review, categorise, and budget their finances.

All three services start with a single command: `make dev`.

---

## Features

| Feature | Description |
|---|---|
| SMS Auto-Import | Receives bank SMS via HTTP webhook from Android (SMS Forwarder app) |
| ML Categorisation | SGDClassifier + TF-IDF, 97.9% accuracy, 9 spending categories |
| Known-Store Lookup | Hardcoded + learned store dictionary — instant, no ML needed for known stores |
| Store Memory | Learns new merchants after 5 user confirmations, auto-categorises permanently |
| Spending Dashboard | Monthly breakdown by category, donut chart, KPI cards |
| Subscriptions Tracking | Separate category for Netflix, DSTV, Spotify, Showmax, etc. |
| Cash Withdrawal Review | Flag ATM/cash transactions — user picks what the cash was spent on |
| Budget Planning | Set monthly budgets, track per-category progress bars |
| Savings Goals | Create goals with target amounts, track contributions |
| Analytics Page | Trends, category breakdowns, weekly spending patterns |
| Gamification | Streak badges and savings-goal achievements |
| Notifications | Real-time bell alerts for new transactions and budget threshold warnings |
| PDF Reports | Export monthly expense reports |
| Simulate SMS | Paste any real bank SMS in Settings to test the full pipeline without a phone |
| Dark / Light Mode | Full theme support across all components |
| Auth | Session-based signup/login with per-user webhook secrets |

---

## Architecture

```
Android Phone
  SMS Forwarder app
        |
        | HTTP POST (webhook)
        v
  XAMPP Apache  (port 80)
  backend/api/sms-ingest.php
        |
        | INSERT raw SMS
        v
  MySQL  (port 3306)
  Database: smart_budget
        |
        | Poll every 1 second
        v
  Python SMS Extractor
  backend/Extract SMS with User Linking.py
        |
        | POST /parse
        v
  Python Flask ML API  (port 5000)
  backend/app.py
  SGDClassifier + TF-IDF
        |
        | POST auto-save-transaction.php
        v
  XAMPP Apache  (port 80)
  Saves expense, updates budget, creates notification
        ^
        |  REST API calls
  React + Vite Frontend  (port 5173)
  src/  (pages, components, context, hooks)
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | >= 18 | React / Vite frontend |
| [Python](https://python.org) | >= 3.10 | ML API and SMS Extractor |
| [XAMPP](https://www.apachefriends.org) | >= 8.2 | Apache (PHP) + MySQL |
| GNU Make | any | Simplifies all commands |
| Android device | any | SMS source (optional — use Simulate SMS for testing) |

---

## Installation & Setup

### Quick Start (Automated Setup)

1. Extract the project **anywhere** on your computer (Desktop, Downloads, Documents, etc.)
2. **Double-click `setup.bat`** in the project folder
3. Follow the on-screen prompts

The setup script automatically:
- Detects your XAMPP installation
- Creates the necessary backend configuration
- Prepares the folder structure for Apache

### Manual Setup (if needed)

If `setup.bat` doesn't work, follow these steps manually:

#### 1 — Start XAMPP

Open the XAMPP Control Panel and start **Apache** and **MySQL**.

Or run `make start-xampp` for instructions.

#### 2 — Install Node.js dependencies

```
make install
```

#### 3 — Create the Python virtual environment

```
make setup-venv
```

This creates `.venv/` and installs: `flask`, `flask-cors`, `scikit-learn`, `pandas`, `numpy`, `joblib`, `pymysql`, `sqlalchemy`, `python-dotenv`, `requests`.

#### 4 — Import the database schema

```
make setup-db
```

#### 5 — Configure environment variables

```
copy backend\.env.example backend\.env
```

Edit `backend\.env`:

```env
DB_HOST=localhost
DB_NAME=smart_budget
DB_USER=root
DB_PASS=                  # blank for XAMPP default (no password)
BACKEND_URL=http://localhost/smart_budget/backend/api
```

---

## Running the Project

> XAMPP (Apache + MySQL) must be running before the commands below.

### Start everything

```
make dev
```

This opens three terminal windows:

| Window | Service | URL |
|---|---|---|
| SmartSpend Frontend | React + Vite | http://localhost:5173 |
| SmartSpend ML API | Flask + SGDClassifier | http://localhost:5000 |
| SmartSpend SMS Extractor | Python polling loop | (no browser, runs in terminal) |

The PHP backend is served automatically by XAMPP Apache at:
`http://localhost/smart_budget/backend/api/`

### Start services individually

```
make start-frontend    # React dev server only
make start-ml          # Python ML API only
make start-sms         # SMS Extractor only
```

### Verify everything is running

| Check | URL | Expected |
|---|---|---|
| Frontend | http://localhost:5173 | Login / Dashboard |
| ML API | http://localhost:5000/health | `{"status":"ok"}` |
| PHP backend | http://localhost/smart_budget/backend/api/get-dashboard.php?user_id=1 | JSON response |

### Stop all services

```
make stop
```

---

## Testing Without a Phone

A built-in **Simulate SMS** panel lets you test the full pipeline without a real Android device:

1. Open the app at http://localhost:5173
2. Log in and go to **Settings → SMS Setup**
3. Scroll to **Simulate SMS** at the bottom
4. Click a sample button (FNB Purchase, M-Pesa Grocery, Ecocash Withdrawal, etc.) or paste your own SMS
5. Click **Process SMS**

The SMS goes through the exact same pipeline as a real received message:
- ML classification (store lookup → learned memory → SGD model)
- Auto-saved to the expenses table
- Notification created (visible in the bell icon)
- Dashboard and Analytics update immediately

---

## Project Structure

```
smart_budget/
|
|-- Makefile                             # All build / run commands
|-- README.md                            # This file
|-- requirements.txt                     # Python dependencies
|-- package.json                         # Node.js dependencies
|-- vite.config.js                       # Vite dev server + proxy config
|
|-- src/                                 # React frontend
|   |-- pages/                           # Route-level pages (Dashboard, Login, Settings...)
|   |-- features/                        # Feature modules (dashboard/, analytics/, transactions/)
|   |-- components/                      # Shared UI components
|   |-- context/                         # React Context (BudgetContext, NotificationContext)
|   |-- hooks/                           # Custom hooks (useAuth, useBudget...)
|   |-- config/                          # API base-URL config
|   `-- router/                          # React Router definitions
|
|-- backend/
|   |-- app.py                           # Flask ML API (port 5000)
|   |   |                                #   POST /parse            classify single SMS
|   |   |                                #   POST /parse_bulk       classify up to 500 SMS
|   |   |                                #   POST /confirm_category teach model from correction
|   |   |                                #   GET  /categories       list spending categories
|   |   |                                #   GET  /model_stats      feedback & memory stats
|   |   `                                #   GET  /health           service status
|   |
|   |-- "Extract SMS with User Linking.py"  # SMS Extractor (continuous polling loop)
|   |-- retrain_model.py                 # Standalone model retraining script
|   |-- generate_dataset.py              # Synthetic SMS dataset generator (1M rows)
|   |-- database_config.py              # DB connection + backend URL from .env
|   |-- schema.sql                       # MySQL database schema (all tables)
|   |-- config.php                       # PHP DB credentials
|   |-- sms_classifier_v2.pkl           # Trained SGD model (joblib)
|   |-- sms_dataset_v2.csv              # Training dataset (1M rows, 9 categories)
|   |-- feedback_log.csv                # User corrections log (auto-created)
|   |-- .env.example                    # Environment variable template
|   |-- .env                            # Your local config (git-ignored)
|   `-- api/                            # PHP REST endpoints
|       |-- login.php
|       |-- signup.php
|       |-- get-dashboard.php           # Monthly summary + KPI cards
|       |-- get-expenses.php
|       |-- add-expense.php             # Manual expense entry
|       |-- update-budget.php           # Set monthly budget + category allocations
|       |-- add-goal.php                # Create savings goal
|       |-- get-goals.php
|       |-- update-goal.php
|       |-- sms-ingest.php              # Webhook entry point for SMS Forwarder
|       |-- auto-save-transaction.php   # Save classified SMS as expense + notification
|       |-- simulate-sms.php            # Test pipeline without a phone
|       |-- get-uncategorized-withdrawals.php
|       |-- get-needs-review.php
|       |-- categorize-expense.php
|       |-- get-notifications.php
|       |-- mark-notifications-read.php
|       |-- generate-pdf-report.php
|       `-- ... (see backend/api/ for full list)
|
`-- public/                             # Static assets
```

---

## ML Classifier

The SMS categorisation uses a three-layer pipeline:

### Layer 1 — Known-Store Dictionary (instant)
A hardcoded dictionary of ~100 Lesotho and South African merchants maps store names directly to categories without any ML inference. Examples: KFC → Food, Shoprite → Groceries, LEC → Utilities, Netflix → Subscriptions.

### Layer 2 — Learned Store Memory (instant)
After a user manually confirms a category for the same store 5 times, that store is permanently added to memory and auto-categorised from then on. Survives server restarts (stored in `feedback_log.csv`).

### Layer 3 — SGD Classifier (ML fallback)
For unknown stores, an `SGDClassifier` with `FeatureUnion` (word n-grams 1–3 + character n-grams 3–5, TF-IDF weighted) classifies the raw SMS text.

| Property | Value |
|---|---|
| Algorithm | SGDClassifier (loss=modified_huber, l2 penalty) |
| Features | Word TF-IDF (60K) + Char TF-IDF (30K) via FeatureUnion |
| Training rows | 500,000 (sampled from 1M generated) |
| Categories | 9 (Food, Groceries, Transport, Shopping, Entertainment, Subscriptions, Health, Utilities, Other) |
| Accuracy | 97.9% on held-out test set |
| Confidence threshold | 0.50 — below this the transaction is flagged for manual review |
| Auto-retrain | Every 5 user corrections (background thread) |

### Retrain the model

```
make retrain-ml
```

This regenerates the full 1M-row dataset and retrains on a 500K sample. Then restart the ML API:

```
make start-ml
```

---

## SMS Formats Supported

| Bank / Network | Format example |
|---|---|
| FNB | `FNB:-) M300.00 reserved for purchase @ Hotspot from Smart Account..123456` |
| Standard Lesotho Bank | `Your Acc XX6932 has been debited with LSL 570.00. Ref : POS LEC Maseru` |
| Standard Lesotho Bank | `ZAR 51.00 has been reserved from Acc: XX4131 for purchase via POS Mr Price` |
| M-Pesa | `Transact ID ... Withdraw M50.00 from 6118 - MTN General Cafe` |
| M-Pesa | `Give M300.00 cash to Lamshine Snack bar` |
| M-Pesa | `M56.00 sent to 33152 - VATICAN GENERAL DEALER Merchant` |
| M-Pesa / Ecocash | `You have paid M32 to 84191- Ob Joint MSU for Merchant Payment` |
| Ecocash | `Ecocash: CashOut Confirmation: M 200 from 29453-NeoLekoekoe Leribe` |
| Ecocash | `You have paid M180 to 12345- Pick n Pay for Merchant Payment` |

---

## API Reference

### Python ML API — `localhost:5000`

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| GET | `/health` | — | Service status, model loaded, store memory size |
| POST | `/parse` | `{"sms": "...", "store": "..."}` | Classify single SMS (store is optional pre-extracted name) |
| POST | `/parse_bulk` | `{"messages": [...]}` | Classify up to 500 SMS messages |
| POST | `/confirm_category` | `{"sms","store","category","bank","amount"}` | User correction — teaches model, updates store memory |
| GET | `/categories` | — | List all 9 spending categories with colours |
| GET | `/model_stats` | — | Feedback count, per-category breakdown, learned stores |

**Example:**
```bash
curl -X POST http://localhost:5000/parse \
  -H "Content-Type: application/json" \
  -d "{\"sms\": \"FNB:-) M300.00 reserved for purchase @ KFC from Smart Account\"}"
```

### PHP REST API — `localhost/smart_budget/backend/api/`

| Endpoint | Method | Description |
|---|---|---|
| `signup.php` | POST | Register new user |
| `login.php` | POST | Authenticate user |
| `get-dashboard.php` | GET | Monthly KPIs, expenses, category breakdown, goals |
| `get-expenses.php` | GET | Paginated expense list |
| `add-expense.php` | POST | Add manual expense |
| `update-budget.php` | POST | Set monthly budget + per-category allocations |
| `add-goal.php` | POST | Create savings goal |
| `get-goals.php` | GET | List savings goals |
| `update-goal.php` | POST | Contribute to a savings goal |
| `sms-ingest.php` | POST | Webhook — receives SMS from Android app |
| `auto-save-transaction.php` | POST | Save classified SMS as expense + create notification |
| `simulate-sms.php` | POST | Test full pipeline without a phone |
| `get-uncategorized-withdrawals.php` | GET | Cash withdrawals pending categorisation |
| `get-needs-review.php` | GET | Low-confidence ML transactions needing review |
| `categorize-expense.php` | POST | Assign category to a reviewed transaction |
| `get-notifications.php` | GET | User notification list |
| `mark-notifications-read.php` | POST | Mark notifications as read |
| `generate-pdf-report.php` | GET | Download monthly PDF report |

---

## Environment Variables

Copy `backend\.env.example` to `backend\.env` and fill in your values:

```env
# MySQL connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=           # blank = XAMPP default (no password)
DB_NAME=smart_budget

# URL the Python SMS Extractor uses to reach the PHP backend
# Change port if your XAMPP Apache uses something other than 80
BACKEND_URL=http://localhost/smart_budget/backend/api
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `make dev` opens windows then they close immediately | Run each service individually to see the error: `make start-ml`, `make start-sms` |
| ML API not starting | Run `make setup-venv`, then `make start-ml` |
| SMS Extractor "Access denied" | Check `DB_PASS` in `backend\.env` |
| SMS Extractor "connection refused" on port 8080 | Update `BACKEND_URL` in `backend\.env` to `http://localhost/smart_budget/backend/api` (port 80) |
| `Table doesn't exist` SQL error | Run `make setup-db` to import the schema |
| Dashboard shows 500 error | XAMPP Apache is not running. Start it from the XAMPP Control Panel |
| PHP returns HTML instead of JSON | A PHP fatal error is being thrown — check `C:\xampp\apache\logs\error.log` |
| Port 5173 already in use | Kill with: `taskkill /F /IM node.exe` |
| Port 5000 already in use | Kill with: `taskkill /F /IM python.exe` |
| SMS not arriving in app | Verify the webhook URL in SMS Forwarder matches `sms-ingest.php?phone_number=...&key=...` |
| Simulate SMS says "ML API offline" | Run `make start-ml` first |
| Subscriptions showing as Entertainment | Run `make retrain-ml` — the updated model includes the Subscriptions category |
