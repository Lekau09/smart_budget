# Changelog

All notable changes to **SmartSpend** are recorded here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-05-02

### Added
- **SMS Webhook Ingest** — Android SMS Backup & Restore integration via `backend/api/sms-ingest.php`; per-user `ingest_secret` for security
- **ML SMS Classifier** — Flask API (`backend/app.py`) using Naïve Bayes + TF-IDF trained on 76 MB labelled SMS dataset
- **Store Memory** — merchant auto-categorisation after 5 user confirmations; `feedback_log.csv` persists corrections
- **Cash Withdrawal Review** — dedicated queue for ATM/cash transactions requiring manual category assignment
- **React Dashboard** — monthly spending breakdown, category charts (Recharts), transaction list with inline editing
- **Budget Planning** — set monthly budgets per category; real-time overspend alerts
- **Savings Goals** — create, track, and update savings targets with deadline tracking
- **Gamification** — streak badges and milestone achievements tied to savings behaviour
- **Notification System** — real-time in-app notifications for new SMS transactions and budget breaches
- **PDF Report Export** — downloadable monthly expense report via `backend/api/generate-pdf-report.php`
- **User Authentication** — session-based signup/login; password hashing with `password_hash()`
- **Database Schema v2.0** — MySQL tables: `users`, `expenses`, `income`, `user_budgets`, `budget_categories`, `savings_goals`, `sms_raw_ingest`, `sms_transactions`, `transactions`, `notifications`, `schema_version`
- **Makefile** — `make install`, `make setup-venv`, `make setup-db`, `make dev`, `make check-deps`
- **`requirements.txt`** — pinned Python dependencies for reproducible installs

### Architecture
- Frontend: React 18 + Vite + React Router + Recharts + Framer Motion
- PHP backend: XAMPP/Apache serving REST endpoints at `/smart_budget/backend/api/`
- Python ML API: Flask on port 5000 proxied through Vite dev server
- Database: MySQL 8 via XAMPP (port 3306)

---

## [0.3.0] — 2026-04-27

### Added
- AI Advisor endpoint (`ai-advisor.php`) with rule-based spending tips
- Duplicate SMS prevention via SHA-256 hash on `sms_raw_ingest`
- Push notification subscription support (`save-push-subscription.php`)

### Fixed
- HTTP 400 errors from non-transactional SMS filtered in extraction script
- Cash withdrawal identification corrected to prevent model contamination

---

## [0.2.0] — 2026-04-23

### Added
- Bulk SMS import Python script (`Extract SMS with User Linking.py`)
- ML model retraining triggered every 5 feedback submissions (background thread)
- `sms_classifier_v2.pkl` pre-trained model shipped with repository

### Fixed
- Uncategorised transactions no longer silently ignored in dashboard totals
- `transactions` table missing `cash_usage_category` column added via migration

---

## [0.1.0] — 2026-04-22

### Added
- Initial project scaffold: React frontend + PHP backend + MySQL schema
- Basic expense CRUD (`add-expense.php`, `get-expenses.php`, `delete-expense.php`)
- User registration and login
- Vite proxy configuration for local development
