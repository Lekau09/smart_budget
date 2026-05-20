# =============================================================================
#  SmartSpend — Project Makefile
#  OS     : Windows  (PowerShell / cmd / XAMPP stack)
#  Authors: Boitumelo Lekau and Lenyolosa Lenyolosa Lenyolosa
#
#  !! BEFORE ANYTHING ELSE — install XAMPP !!
#  Download: https://www.apachefriends.org/download.html
#  Install to the default path: C:\xampp
#  Then open the XAMPP Control Panel and START both Apache and MySQL.
#  (Without XAMPP running, signup/login will show "Failed to fetch".)
#
#  QUICK-START (run these once, in order, on a fresh machine):
#    make check-deps    — verify Node, Python, XAMPP are all present
#    make install       — install Node.js front-end dependencies
#    make setup-venv    — create Python virtual environment + install deps
#    make setup-db      — import MySQL schema into XAMPP
#    make dev           — start all three services in separate windows
#
#  DAILY USE (after first-time setup):
#    1. Open XAMPP Control Panel → Start Apache + MySQL
#    2. make dev           — start frontend + ML API + SMS Extractor
#
#  TESTING WITHOUT A PHONE:
#    Open the app → Settings → SMS Setup → "Simulate SMS" panel
#    Paste any real bank SMS and click "Process SMS"
# =============================================================================

# ---------- configurable paths -----------------------------------------------
XAMPP_DIR  = C:/xampp
MYSQL      = $(XAMPP_DIR)/mysql/bin/mysql.exe
PYTHON     = .venv\Scripts\python.exe
PIP        = .venv\Scripts\pip.exe
SCHEMA     = backend/schema.sql
DB_NAME    = smart_budget
DB_USER    = root
DB_PASS    =                        # blank = XAMPP default (no password)
                                    # set to your password if you created one

SHELL = C:/Windows/System32/cmd.exe

# =============================================================================
.PHONY: help install setup-venv setup-db setup dev \
        start-frontend start-ml start-sms start-xampp \
        retrain-ml stop clean check-deps

# ---------- help (default target) --------------------------------------------
help:
	@echo.
	@echo  SmartSpend -- Available Commands
	@echo  =================================
	@echo.
	@echo  !! PREREQUISITE -- Install XAMPP first !!
	@echo     Download: https://www.apachefriends.org/download.html
	@echo     Install to C:\xampp  then open XAMPP Control Panel
	@echo     and START both Apache and MySQL before running make dev.
	@echo     (Without XAMPP, signup/login will show "Failed to fetch".)
	@echo.
	@echo  FIRST-TIME SETUP  (run in this order)
	@echo  --------------------------------------
	@echo    make check-deps    Verify Node, Python and XAMPP are installed
	@echo    make setup         Run automated setup (creates XAMPP links)
	@echo    make install       Install Node.js dependencies
	@echo    make setup-venv    Create Python venv + install all ML/DB packages
	@echo    make setup-db      Import database schema into XAMPP MySQL
	@echo.
	@echo  RUNNING THE PROJECT
	@echo  -------------------
	@echo    make dev             Launch frontend + ML API + SMS Extractor
	@echo    make start-xampp     Show how to start XAMPP Apache + MySQL
	@echo    make start-frontend  React dev server only  (port 5173)
	@echo    make start-ml        Python ML API only      (port 5000)
	@echo    make start-sms       SMS Extractor only      (continuous polling)
	@echo.
	@echo  UTILITIES
	@echo  ---------
	@echo    make retrain-ml    Regenerate dataset (1M rows) + retrain classifier
	@echo    make check-deps    Verify Node, Python, XAMPP paths are present
	@echo    make stop          Kill Node + Python processes
	@echo    make clean         Remove dist/, __pycache__, *.pyc
	@echo.
	@echo  SERVICE URLS (once running)
	@echo  ---------------------------
	@echo    React frontend  : http://localhost:5173
	@echo    Python ML API   : http://localhost:5000/health
	@echo    PHP backend     : http://localhost/smart_budget/backend/api/
	@echo    phpMyAdmin      : http://localhost/phpmyadmin
	@echo.

# =============================================================================
# FIRST-TIME SETUP
# =============================================================================

## 0. Automated setup (run this first!)
setup:
	@echo [SmartSpend] Running automated setup...
	powershell -NoProfile -ExecutionPolicy Bypass -File setup.ps1

## 1. Install Node.js (React / Vite) dependencies
install:
	@echo [SmartSpend] Installing Node.js dependencies...
	npm install
	@echo [SmartSpend] Done. Run "make setup-venv" next.

## 2. Create Python virtual environment + install all dependencies
setup-venv:
	@echo [SmartSpend] Creating Python virtual environment...
	@if not exist ".venv" ( \
		python -m venv .venv \
	) else ( \
		echo [SmartSpend] .venv already exists, skipping creation. \
	)
	@echo [SmartSpend] Installing Python packages...
	$(PYTHON) -m pip install --upgrade pip --quiet
	$(PIP) install flask flask-cors scikit-learn pandas numpy joblib \
	               pymysql sqlalchemy python-dotenv requests --quiet
	@echo.
	@echo [SmartSpend] Python environment ready.
	@echo   Activate manually : .venv\Scripts\activate
	@echo   Run next          : make setup-db

## 3. Import MySQL schema (XAMPP MySQL must be running first)
setup-db:
	@echo [SmartSpend] Importing database schema into MySQL...
	@if not exist "$(MYSQL)" ( \
		echo ERROR: mysql.exe not found at $(MYSQL) && \
		echo        Install XAMPP from https://www.apachefriends.org && \
		exit /b 1 )
	"$(MYSQL)" -u $(DB_USER) $(if $(DB_PASS),-p$(DB_PASS),) < $(SCHEMA)
	@echo [SmartSpend] Schema imported into "$(DB_NAME)" successfully.
	@echo.
	@echo  Next steps:
	@echo    1. copy backend\.env.example  backend\.env
	@echo    2. Edit backend\.env  -- set DB_PASS (blank = XAMPP default)
	@echo    3. make dev

# =============================================================================
# RUNNING THE PROJECT
# =============================================================================

## Start all three services. XAMPP (Apache + MySQL) must already be running.
dev: start-ml start-sms start-frontend
	@echo.
	@echo [SmartSpend] All services started:
	@echo   React frontend  --  http://localhost:5173
	@echo   Python ML API   --  http://localhost:5000
	@echo   SMS Extractor   --  polling database continuously
	@echo   PHP backend     --  http://localhost/smart_budget/backend/api/
	@echo.
	@echo  XAMPP Apache + MySQL must be running separately.
	@echo  Run "make start-xampp" for instructions.

## React + Vite development server (port 5173)
start-frontend:
	@echo [SmartSpend] Starting React frontend on port 5173...
	@cmd /c start "SmartSpend Frontend" cmd /k "npm run dev"

## Python Flask ML API — SGDClassifier SMS categorisation (port 5000)
start-ml:
	@echo [SmartSpend] Starting Python ML API on port 5000...
	@cmd /c start "SmartSpend ML API" cmd /k $(PYTHON) backend\app.py

## SMS Extractor — polls DB every second, classifies + saves new SMS
start-sms:
	@echo [SmartSpend] Starting SMS Extractor (continuous mode)...
	@cmd /c start "SmartSpend SMS Extractor" cmd /k $(PYTHON) "backend\Extract SMS with User Linking.py"

## Show how to start XAMPP
start-xampp:
	@echo.
	@echo [SmartSpend] Starting XAMPP:
	@echo   GUI  : Open the XAMPP Control Panel and click Start next to
	@echo          Apache and MySQL.
	@echo.
	@echo   CLI  : Run as Administrator:
	@echo            $(XAMPP_DIR)/xampp_start.exe
	@echo.
	@echo   Apache serves PHP at : http://localhost/smart_budget/backend/
	@echo   phpMyAdmin           : http://localhost/phpmyadmin
	@echo.

# =============================================================================
# UTILITIES
# =============================================================================

## Regenerate training dataset (1M rows, 9 categories) + retrain classifier
retrain-ml:
	@echo [SmartSpend] Step 1/2 -- Regenerating SMS dataset (1M rows)...
	$(PYTHON) backend\generate_dataset.py
	@echo [SmartSpend] Step 2/2 -- Retraining SMS classifier (500K sample)...
	$(PYTHON) backend\retrain_model.py
	@echo.
	@echo [SmartSpend] Done. Restart the ML API to load the new model:
	@echo   make start-ml

## Verify all required tools and paths are present
check-deps:
	@echo [SmartSpend] Checking dependencies...
	@echo.
	@node --version >nul 2>&1 && echo   [OK] Node.js: && node --version || echo   [MISSING] Node.js -- install from https://nodejs.org
	@python --version >nul 2>&1 && echo   [OK] Python: && python --version || echo   [MISSING] Python -- install from https://python.org
	@if exist ".venv\Scripts\python.exe"   ( echo   [OK] Python venv       ) else ( echo   [MISSING] venv        -- run: make setup-venv )
	@if exist "node_modules"               ( echo   [OK] node_modules      ) else ( echo   [MISSING] node_modules -- run: make install    )
	@if exist "$(MYSQL)"                   ( echo   [OK] XAMPP MySQL found  ) else ( echo   [MISSING] XAMPP        -- install from https://www.apachefriends.org )
	@if exist "backend\.env"               ( echo   [OK] backend\.env found ) else ( echo   [MISSING] backend\.env  -- copy from backend\.env.example )
	@if exist "backend\sms_classifier_v2.pkl" ( echo   [OK] ML model found  ) else ( echo   [MISSING] ML model     -- run: make retrain-ml )
	@echo.

## Stop development servers (Node + Python)
stop:
	@echo [SmartSpend] Stopping dev servers...
	-taskkill /F /IM node.exe   >nul 2>&1
	-taskkill /F /IM python.exe >nul 2>&1
	@echo [SmartSpend] Done.

## Remove build artifacts
clean:
	@echo [SmartSpend] Cleaning build artifacts...
	-rd /s /q dist 2>nul
	-for /d /r backend %%d in (__pycache__) do @rd /s /q "%%d" 2>nul
	-del /f /q backend\*.pyc 2>nul
	@echo [SmartSpend] Clean complete.

# =============================================================================
# END OF MAKEFILE
# =============================================================================
