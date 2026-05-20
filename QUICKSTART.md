# SmartSpend — Partner Setup Guide

Follow these steps **IN ORDER** on a fresh Windows machine.

---

## ⚠️ Prerequisites (Install Once)

| Software | Download link | Why |
|---|---|---|
| XAMPP | https://www.apachefriends.org | Runs Apache (PHP) + MySQL |
| Node.js (LTS) | https://nodejs.org | Runs the React frontend |
| Python 3.12+ | https://www.python.org/downloads | Runs the ML API |
| Git for Windows | https://git-scm.com/download/win | Includes `make` + Git Bash |

> **Installation Tips:**
> - Git for Windows: tick "Add Git Bash to PATH"
> - Python: tick "Add Python to PATH"
> - XAMPP: use default installation path `C:\xampp\`

---

## Step 0 — Automatic Setup (NEW!)

Extract the `smart_budget` folder **anywhere** (Desktop, Downloads, Documents, etc.)

**Then double-click `setup.bat`** in the project folder.

This automatically:
- ✓ Detects your XAMPP installation
- ✓ Creates the necessary links for Apache
- ✓ Configures the backend API

---

## Step 1 — Start XAMPP

Open the **XAMPP Control Panel** and click **Start** next to both:
- Apache
- MySQL

Leave XAMPP running the whole time you use the app.

---

## Step 2 — Open Git Bash in the project folder

Right-click inside your project folder and choose **"Open Git Bash here"**

Or open VS Code, open the folder, and set the terminal to **Git Bash**:
- Terminal → New Terminal → click the dropdown arrow → Git Bash

---

## Step 3 — Install dependencies (one time only)

Type these commands one at a time, waiting for each to finish:

```bash
make install
```
*(downloads React/JavaScript packages — takes 1-2 minutes)*

```bash
make setup-venv
```
*(creates Python environment + installs ML packages — takes 2-3 minutes)*

```bash
make setup-db
```
*(creates the database tables in MySQL)*

---

## Step 4 — Configure your environment file

Copy the example config file:

```bash
copy backend\.env.example backend\.env
```

Open `backend\.env` in any text editor. It looks like this:

```
DB_HOST=localhost
DB_NAME=smart_budget
DB_USER=root
DB_PASS=
BACKEND_URL=http://localhost/smart_budget/backend/api
```

- If you did NOT set a MySQL password in XAMPP, leave `DB_PASS=` blank.
- If you set a password, enter it after `DB_PASS=`.
- Leave everything else as-is.

---

## Step 5 — Start the app

```bash
make dev
```

This opens **3 terminal windows** automatically:
- SmartSpend Frontend (React)
- SmartSpend ML API (Python)
- SmartSpend SMS Extractor (Python)

---

## Step 6 — Open the app

Go to: **http://localhost:5173**

Click **Sign Up** to create an account and start using the app.

---

## Daily Use (after first-time setup)

Every time you want to use the app:

1. Start XAMPP (Apache + MySQL)
2. Open Git Bash in the project folder
3. Run `make dev`
4. Go to http://localhost:5173

---

## Testing SMS Classification (without a phone)

You can test how the app processes bank SMS messages without a real phone:

1. Log in to the app
2. Go to **Settings → SMS Setup**
3. Scroll to the **Simulate SMS** section at the bottom
4. Click any sample button (FNB Purchase, M-Pesa Grocery, etc.)
5. Click **Process SMS**

The transaction will appear on the Dashboard automatically.

---

## Troubleshooting

| Problem | Fix |
|---|---
| `make: command not found` | Use Git Bash, not PowerShell or CMD |
| `make setup-db` fails | Make sure XAMPP MySQL is running first |
| ML API window closes immediately | Run `make start-ml` alone to see the error |
| App shows blank page | Make sure all 3 terminals from `make dev` are still open |
| `Access denied` for database | Check `DB_PASS` in `backend\.env` |
| Port 5173 not loading | Wait 10 seconds after running `make dev`, then refresh |

---

## Quick Command Reference

```bash
make dev          # start everything (use this daily)
make stop         # stop all servers
make retrain-ml   # retrain the ML classifier (takes ~5 minutes)
make check-deps   # verify all tools are installed correctly
```
