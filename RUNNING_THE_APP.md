# 🚀 Quick Start - Smart Budget App

## Running the App (Frontend)

### Start Development Server
```bash
npm run dev
```
Opens automatically at **http://localhost:5174/**

### Build for Production
```bash
npm run build
```
Creates optimized production files in `dist/` folder

## Backend Setup (Required for Full Functionality)

### Prerequisites
1. **XAMPP** or equivalent (Apache + MySQL)
2. **PHP 7.4+**
3. **MySQL 5.7+**

### Steps
1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache
   - Start MySQL

2. **Import Database Schema**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create new database: `smart_budget`
   - Import: `backend/schema.sql`

3. **Verify Backend**
   - Visit: http://localhost/smart_budget/api/test.php
   - Should return JSON response

4. **Optional: Create Test User**
   - Visit: http://localhost/smart_budget/api/create-test-user.php
   - Creates test user: `test@example.com` / password: `test`

## Accessing the App

### Public Pages
- **Home**: http://localhost:5174/
- **Sign Up**: http://localhost:5174/signup
- **Log In**: http://localhost:5174/login

### Protected Pages (After Login)
- **Dashboard**: http://localhost:5174/app/dashboard
- **Transactions**: http://localhost:5174/app/transactions
- **Savings**: http://localhost:5174/app/savings
- **Analytics**: http://localhost:5174/app/analytics
- **Goals**: http://localhost:5174/app/goals
- **Sessions**: http://localhost:5174/app/sessions
- **Settings**: http://localhost:5174/app/settings

## Troubleshooting

### Frontend Issues
| Problem | Solution |
|---------|----------|
| "npm not found" | Install Node.js from nodejs.org |
| Port 5174 in use | Close other apps using port 5174 |
| Blank page | Check browser console (F12) for errors |
| Hot reload not working | Restart dev server with `npm run dev` |

### Backend Issues
| Problem | Solution |
|---------|----------|
| Database connection error | Verify MySQL is running in XAMPP |
| Database not found | Run `backend/schema.sql` in phpMyAdmin |
| API returns 404 | Check Apache is running in XAMPP |
| CORS errors | Verify browser origin matches config.php |

### Common Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint  # (if configured)
```

## File Structure Summary
```
├── src/                          # Frontend React code
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Root component
│   ├── index.css                # Design system (442+ lines)
│   ├── router/AppRouter.jsx     # Route definitions
│   ├── features/                # Feature pages
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── savings/
│   │   └── ...
│   ├── components/              # Reusable components
│   ├── hooks/                   # Custom React hooks
│   └── pages/                   # Public pages
├── backend/                      # PHP backend API
│   ├── api/                     # API endpoints
│   ├── config.php               # Database & CORS config
│   └── schema.sql               # Database schema
├── package.json                 # Dependencies
├── vite.config.js               # Build configuration
└── dist/                        # Production build (after npm run build)
```

## Key Features

✅ **User Authentication**
- Sign up with email
- Log in securely
- Session management
- Protected routes

✅ **Dashboard**
- Budget overview
- Spending metrics
- Recent transactions
- Budget tracking

✅ **Transactions**
- Add expenses
- View transaction history
- Filter by category
- Date range filtering

✅ **Design**
- Professional styling
- Responsive layout
- Dark mode ready
- Mobile optimized

## Next Steps

1. **For Development**
   - Run `npm run dev` to start coding
   - Changes auto-reload (HMR enabled)
   - Check browser console (F12) for errors

2. **For Production**
   - Run `npm run build`
   - Deploy `dist/` folder to web server
   - Set up backend on production server
   - Update API URL in `src/config/api.js`

3. **For Customization**
   - Colors: Edit `src/index.css` (CSS variables section)
   - Layout: Modify components in `src/components/`
   - Features: Add new pages in `src/features/`

## Support

📚 **Full Documentation**: See `QUICK_START.md` and `SETUP_GUIDE.md`  
🐛 **Report Issues**: Check browser console (F12) and network tab  
💡 **Tips**: Review code comments in component files

---

**Status**: ✅ Ready to use  
**Last Updated**: January 14, 2026
