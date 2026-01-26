# 🚀 Smart Budget - Quick Start (5 Minutes)

## TL;DR - Get Running in 5 Minutes

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Click "Start" for Apache and MySQL
3. Wait for green indicators

### Step 2: Setup Database (1 minute)
1. Go to `http://localhost/phpmyadmin`
2. Click "New" → Create database `smart_budget`
3. Go to "SQL" tab → Paste contents from `backend/schema.sql`
4. Click "Go"

### Step 3: Start Frontend (1 minute)
```bash
# In your project folder
npm install      # First time only
npm run dev      # Start development server
```

### Step 4: Open Dashboard
1. Go to `http://localhost:5173`
2. Click "Sign Up" to create account
3. Enter email & password
4. Click "Dashboard" button

### Step 5: Try It Out (2 minutes)
1. Set budget: Enter amount → Click "Save"
2. Add expense: Click blue "Add" button → Fill form → Click "Add transaction"
3. View dashboard: Charts update instantly!

## 🎯 Default Test Data

If you want to skip signup, use these test credentials:
```
Email: test@example.com
Password: test123
```

To create test user:
```bash
# Visit this URL to create test user
http://localhost/smart_budget/api/create-test-user.php
```

## 🎨 What You'll See

The dashboard has 4 sections:

### Top Metrics (4 Cards)
- Total Budget: Your monthly budget
- Amount Spent: Total expenses this month
- Remaining: Budget left
- Total Saved: Savings tracker

### Left Panel (Charts & Table)
- **Pie Chart**: Shows breakdown by category
- **Line Chart**: Shows spending trends over time
- **Transaction Table**: Lists all your expenses

### Right Panel (Goals & Settings)
- **Budget Progress**: Circular gauge showing %
- **Savings Goals**: Track multiple goals
- **Budget Setter**: Adjust budget amount

### Floating Button
- Blue "Add" button (bottom-left)
- Click to add new expense quickly

## 🐛 Something Not Working?

### Blank Page?
```javascript
// Open browser console (F12) and run:
localStorage.clear()
// Then refresh the page
```

### Database Error?
1. Check XAMPP - is MySQL running?
2. Check phpMyAdmin at `http://localhost/phpmyadmin`
3. Verify database `smart_budget` exists

### API Not Responding?
1. Check if files are in `C:\xampp\htdocs\smart_budget\`
2. Visit `http://localhost/smart_budget/api/setup.php`
3. Should show all tables as "exists"

## 📊 Example Workflow

```
1. Sign up → test@example.com / password123
2. Go to Dashboard
3. Set Monthly Budget → 2000
4. Add Expenses:
   - Groceries, 250, Food
   - Gas, 50, Transport
   - Netflix, 15, Entertainment
5. Watch pie chart update
6. Watch spending % update
7. View remaining budget
```

## 💡 Tips & Tricks

### Categories
Any text works as category! Examples:
- Food, Transport, Entertainment
- Health, Shopping, Utilities
- Subscriptions, Personal, Work

### Budget Tracking
- Budget appears in circular gauge (% spent)
- Red means over budget
- Green means under budget

### Charts
- Pie chart: Click legend to toggle categories
- Line chart: Hover to see monthly totals

### Quick Actions
- Floating "Add" button for quick expense entry
- "Reset" button to undo budget changes
- Time filter to switch between Week/Month/Year views

## 📱 Mobile View

Everything works on mobile:
1. Sidebar hides automatically
2. Tap menu button to open sidebar
3. All charts are responsive
4. Touch-friendly buttons

## 🎓 Next Steps

### Learn More
- Read `SETUP_GUIDE.md` for detailed setup
- Check `DASHBOARD_FIX_SUMMARY.md` for tech details
- Review `VERIFICATION_CHECKLIST.md` for features

### Customize
- Edit colors in `src/index.css` (line ~6)
- Add more categories in database
- Create custom goals

### Deploy
- Run `npm run build` to create production build
- Copy `dist/` folder to web server
- Update API base URL in `src/config/api.js`

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Clear localStorage in console (F12) |
| 404 errors | Check XAMPP htdocs path |
| Database error | Verify MySQL is running |
| Login fails | Check database tables exist |
| Charts don't show | Add some expenses first |
| Page is slow | Restart dev server |

## ✨ Success Indicators

You're good when you see:
- ✅ Login page loads
- ✅ Dashboard shows 4 metric cards
- ✅ No red error messages
- ✅ Can set budget
- ✅ Can add expenses
- ✅ Charts update

## 🎉 You're Ready!

Enjoy your Smart Budget dashboard! 

Questions? Check the full docs:
- `SETUP_GUIDE.md` - Complete guide
- `DASHBOARD_FIX_SUMMARY.md` - What was fixed
- `VERIFICATION_CHECKLIST.md` - Full checklist

**Happy budgeting! 💰**
