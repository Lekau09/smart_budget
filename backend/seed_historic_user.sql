-- ============================================================
--  SmartSpend — Historic User Seed Script
--  Database: smart_budget
--
--  HOW TO USE:
--    1. Open phpMyAdmin → smart_budget → SQL tab
--       OR run:  mysql -u root -proot1234 smart_budget < seed_historic_user.sql
--    2. Set @user_id and the five budgets below
--    3. Run the script
--
--  FULLY IDEMPOTENT — safe to re-run at any time:
--    Step 0 DELETES the user's historic expenses and budget
--    rows for the 5 seeded months, then reinserts from scratch.
--    The current month (April) is never touched.
--
--  VIEWING SEEDED TRANSACTIONS IN THE APP:
--    They are in the database and WILL appear on the Transactions
--    page — just use the Month/Year dropdowns to navigate to
--    each past month (e.g. March, February, January...).
-- ============================================================

USE smart_budget;

-- ============================================================
--  STEP 0 — CLEAN SLATE
--  Deletes all past expenses and budget rows for this user
--  covering the 5 months we are about to reseed.
--  The current month is NOT touched.
-- ============================================================

-- (Variables must be set before DELETE references them,
--  so we declare them here temporarily)
SET @del_user = 3;   -- ← must match @user_id below

DELETE FROM expenses
WHERE user_id = @del_user
  AND date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
  AND date <  DATE_FORMAT(CURDATE(), '%Y-%m-01');

DELETE FROM user_budgets
WHERE user_id = @del_user
  AND (
        (year  < YEAR(CURDATE()))
     OR (year  = YEAR(CURDATE()) AND month < MONTH(CURDATE()))
  )
  AND (
        (year  > YEAR(DATE_SUB(CURDATE(), INTERVAL 5 MONTH)))
     OR (year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 5 MONTH)) AND month >= MONTH(DATE_SUB(CURDATE(), INTERVAL 5 MONTH)))
  );

-- ============================================================
--  CONFIGURATION — only change values in this block
-- ============================================================

SET @user_id   = 3;        -- ← replace with the actual user ID

SET @m1_budget = 1500.00;  -- ← budget 5 months ago  (M-5)
SET @m2_budget = 1250.00;  -- ← budget 4 months ago  (M-4)
SET @m3_budget = 1300.00;  -- ← budget 3 months ago  (M-3)
SET @m4_budget = 1350.00;  -- ← budget 2 months ago  (M-2)
SET @m5_budget = 1350.00;  -- ← budget last month     (M-1)

-- ============================================================
--  DERIVED MONTH/YEAR VALUES  (calculated automatically)
--  No need to change anything below this line unless you want
--  to adjust the expense amounts themselves.
-- ============================================================

SET @m1_year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 5 MONTH));
SET @m1_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 5 MONTH));

SET @m2_year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 4 MONTH));
SET @m2_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 4 MONTH));

SET @m3_year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 3 MONTH));
SET @m3_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 3 MONTH));

SET @m4_year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH));
SET @m4_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH));

SET @m5_year  = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH));
SET @m5_month = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH));

-- ============================================================
--  STEP 1 — USER_BUDGETS (one row per month)
--
--  Uses ON DUPLICATE KEY UPDATE so an existing row is always
--  updated rather than silently skipped.
--
--  NOTE: total_spent is recalculated live from the expenses
--  table by get-dashboard.php, so its value here doesn't
--  matter — Step 7 syncs it after expenses are inserted.
-- ============================================================

INSERT INTO user_budgets (user_id, month, year, monthly_budget, total_spent, total_saved)
VALUES
  (@user_id, @m1_month, @m1_year, @m1_budget, 0, 0),
  (@user_id, @m2_month, @m2_year, @m2_budget, 0, 0),
  (@user_id, @m3_month, @m3_year, @m3_budget, 0, 0),
  (@user_id, @m4_month, @m4_year, @m4_budget, 0, 0),
  (@user_id, @m5_month, @m5_year, @m5_budget, 0, 0)
ON DUPLICATE KEY UPDATE
  monthly_budget = VALUES(monthly_budget);

-- ============================================================
--  STEP 2 — EXPENSES (Month 1, 5 months ago)
-- ============================================================

INSERT INTO expenses (user_id, description, amount, category, date) VALUES
  (@user_id, 'Monthly groceries',           400.00, 'Groceries',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-05')),
  (@user_id, 'Rent',                        500.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')),
  (@user_id, 'Bus & taxi fare',              50.00, 'Transport',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-10')),
  (@user_id, 'Restaurant dinner',             0.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-14')),
  (@user_id, 'Electricity bill',             80.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-20')),
  (@user_id, 'Clothing purchase',             0.00, 'Shopping',      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-22')),
  (@user_id, 'Mobile data bundle',          120.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-28')),
  (@user_id, 'Takeaway lunch',              100.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-18'));

-- ============================================================
--  STEP 3 — EXPENSES (Month 2, 4 months ago)
-- ============================================================

INSERT INTO expenses (user_id, description, amount, category, date) VALUES
  (@user_id, 'Monthly groceries',           350.00, 'Groceries',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-05')),
  (@user_id, 'Rent',                        500.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-01')),
  (@user_id, 'Bus & taxi fare',              70.00, 'Transport',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-08')),
  (@user_id, 'Restaurant & takeaways',       40.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-15')),
  (@user_id, 'Electricity & water',         100.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-20')),
  (@user_id, 'Shoes & accessories',         150.00, 'Shopping',      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-22')),
  (@user_id, 'Mobile data + airtime',        10.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-28')),
  (@user_id, 'Entertainment / streaming',    80.00, 'Entertainment', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-25')),
  (@user_id, 'Miscellaneous',                30.00, 'Other',         DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-29'));

-- ============================================================
--  STEP 4 — EXPENSES (Month 3, 3 months ago)
-- ============================================================

INSERT INTO expenses (user_id, description, amount, category, date) VALUES
  (@user_id, 'Monthly groceries',           250.00, 'Groceries',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-04')),
  (@user_id, 'Rent',                        500.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01')),
  (@user_id, 'Lunch out x3',                270.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-14')),
  (@user_id, 'Electricity bill',             50.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-21')),
  (@user_id, 'Data bundle',                  50.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-27')),
  (@user_id, 'Snacks & coffee',              50.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-16')),
  (@user_id, 'Stationery',                   10.00, 'Other',         DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-07'));

-- ============================================================
--  STEP 5 — EXPENSES (Month 4, 2 months ago)
-- ============================================================

INSERT INTO expenses (user_id, description, amount, category, date) VALUES
  (@user_id, 'Monthly groceries',           400.00, 'Groceries',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-05')),
  (@user_id, 'Rent',                        500.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01')),
  (@user_id, 'Transport',                    40.00, 'Transport',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-09')),
  (@user_id, 'Restaurant meals',             50.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-15')),
  (@user_id, 'Electricity & data',          220.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-20')),
  (@user_id, 'Clothing & shoes',             80.00, 'Shopping',      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-23')),
  (@user_id, 'Pharmacy',                     20.00, 'Health',        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-12')),
  (@user_id, 'Entertainment',               100.00, 'Entertainment', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-25'));

-- ============================================================
--  STEP 6 — EXPENSES (Month 5, last month)
-- ============================================================

INSERT INTO expenses (user_id, description, amount, category, date) VALUES
  (@user_id, 'Monthly groceries',           300.00, 'Groceries',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-04')),
  (@user_id, 'Rent',                        500.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')),
  (@user_id, 'Lunch & coffee',               90.00, 'Food',          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-14')),
  (@user_id, 'Electricity bill',            100.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-20')),
  (@user_id, 'Data bundle',                 100.00, 'Utilities',     DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-27')),
  (@user_id, 'Entertainment',               100.00, 'Entertainment', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-19')),
  (@user_id, 'Miscellaneous',               100.00, 'Other',         DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-29'));

-- ============================================================
--  STEP 7 — SYNC total_spent from actual expenses
--  (get-dashboard.php recalculates this live, but this keeps
--   the stored value consistent for other queries)
-- ============================================================

UPDATE user_budgets ub
JOIN (
  SELECT MONTH(date) AS m, YEAR(date) AS y, SUM(amount) AS s
  FROM expenses
  WHERE user_id = @user_id
    AND date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
    AND date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
  GROUP BY MONTH(date), YEAR(date)
) e ON ub.month = e.m AND ub.year = e.y
SET ub.total_spent = e.s
WHERE ub.user_id = @user_id;

-- ============================================================
--  VERIFICATION — run after seeding to confirm all rows
-- ============================================================

SELECT
  ub.year,
  ub.month,
  ub.monthly_budget                            AS budget,
  ROUND(SUM(e.amount), 2)                      AS actual_spent,
  ROUND(SUM(e.amount) - ub.monthly_budget, 2)  AS deviation,
  CASE
    WHEN SUM(e.amount) > ub.monthly_budget THEN 'OVER'
    WHEN SUM(e.amount) < ub.monthly_budget THEN 'UNDER'
    ELSE 'EXACT'
  END                                          AS status
FROM user_budgets ub
LEFT JOIN expenses e
  ON  e.user_id     = ub.user_id
  AND MONTH(e.date) = ub.month
  AND YEAR(e.date)  = ub.year
WHERE ub.user_id = @user_id
  AND (ub.year < YEAR(CURDATE())
    OR (ub.year = YEAR(CURDATE()) AND ub.month < MONTH(CURDATE())))
GROUP BY ub.year, ub.month, ub.monthly_budget
ORDER BY ub.year ASC, ub.month ASC;
