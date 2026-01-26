# 🔧 SmartBudget - Blank Page Troubleshooting Guide

## Quick Fixes (Try These First)

### 1. **Hard Refresh** (Clear Cache)
- **Windows**: `Ctrl + Shift + Delete` → Clear all → Reload `Ctrl + R`
- **Mac**: `Cmd + Shift + Delete` → Clear all → Reload `Cmd + R`

### 2. **Check Dev Server is Running**
```
Port 5173 should show:
✅ VITE v7.2.7 ready
✅ Local: http://localhost:5173/
```

If not running, start it:
```bash
cd "c:\Users\boitu\Desktop\Project-smart-budget(Final final)\Project-smart-budget\Project-smart-budget"
npm run dev
```

### 3. **Check Browser Console (F12)**
- Press `F12` to open DevTools
- Click **Console** tab
- Look for **RED ERRORS** - these are the problem
- Report any error messages

---

## Debugging Steps

### Step 1: Verify Server Connection
Open browser console (F12) and run:
```javascript
fetch('http://localhost:5173/')
  .then(r => r.text())
  .then(t => console.log('✅ Server responded:', t.substring(0, 100)))
  .catch(e => console.error('❌ Server error:', e.message))
```

### Step 2: Check for Build Errors
In terminal, you should see:
```
✓ 2059 modules transformed
```

If you see `✗ Build failed`, there's a module error.

### Step 3: Verify node_modules are Installed
```bash
cd project-directory
npm install
```

### Step 4: Clear Cache & Reinstall
```bash
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

---

## Common Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Blank white page | JavaScript error | Check F12 console for errors |
| "Cannot find module" | Missing dependencies | Run `npm install` |
| Port 5173 already in use | Another app using port | Kill process: `netstat -ano \| findstr :5173` |
| CSS not loading | CSS syntax error | Check browser Network tab (F12) |
| Infinite loading spinner | JavaScript blocked | Check console for blocking errors |

---

## Network Issues

### Check Network Tab (F12)
1. Press `F12` → **Network** tab
2. Refresh page (`F5`)
3. Look for:
   - ✅ `index.html` - should return 200
   - ✅ `index-*.js` - should return 200
   - ✅ `index-*.css` - should return 200
   - ❌ Any RED entries = failed request

### Common Network Errors
```
404 Not Found     → File doesn't exist, check path
CORS error        → Backend CORS issue
500 error         → Server error, check backend
```

---

## Terminal Diagnostics

### Check Vite Output
When running `npm run dev`, you should see:
```
VITE v7.2.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

If you don't see this, Vite didn't start correctly.

### Check for Compilation Errors
Watch for output like:
```
[vite] (client) hmr update /src/App.jsx
```
This means files are updating correctly.

---

## React Errors (Most Common)

### "Cannot find module 'xyz'"
**Fix**: Check import path is correct
```jsx
// ❌ Wrong
import Dashboard from '../../features/Dashboard'

// ✅ Correct
import Dashboard from '../../features/dashboard/Dashboard'
```

### "useAuth is not exported"
**Fix**: Check export syntax
```jsx
// ❌ Wrong
import { useAuth } from './useAuth'

// ✅ Correct (if it's default export)
import useAuth from './useAuth'
```

### "Components is not a function"
**Fix**: Component must return JSX
```jsx
// ✅ Correct
export default function App() {
  return <div>Hello</div>
}
```

---

## Browser-Specific Issues

### Chrome/Edge
- Try Incognito mode
- Disable extensions
- Clear cache: Settings → Privacy → Clear browsing data

### Firefox
- Clear cache: History → Clear Recent History
- Try in Private Window

### Safari
- Clear cache: Develop → Empty Web Storage
- Disable JavaScript temporarily to test

---

## If Still Blank After All Steps

### Option 1: Try Different Browser
- Chrome: https://google.com/chrome
- Firefox: https://mozilla.org/firefox
- Edge: Built-in on Windows

### Option 2: Port Conflict
Try port 5174:
```bash
npm run dev
# If 5173 is in use, Vite auto-switches to 5174
# Then visit http://localhost:5174/
```

### Option 3: Check Firewall
Windows may block port 5173. Allow it in:
- Windows Defender → Firewall → Allow an app

### Option 4: Full Reset
```bash
# Delete everything and reinstall
rm -r node_modules dist .vite
npm cache clean --force
npm install
npm run dev
```

---

## Success Indicators

✅ **You'll know it's working when you see:**
- Landing page with SmartBudget header
- "Features Built for You" section
- Sign up and navigation links
- Professional styling with colors
- No errors in browser console (F12)

---

## Report Issues With:

When asking for help, provide:
1. **Screenshot** of blank page
2. **F12 Console** error messages (copy-paste red errors)
3. **Terminal output** (when running `npm run dev`)
4. **Browser** you're using (Chrome, Firefox, Safari, Edge)
5. **OS** (Windows 10/11, Mac, Linux)

---

## Quick Start Command

```bash
# Navigate to project
cd "c:\Users\boitu\Desktop\Project-smart-budget(Final final)\Project-smart-budget\Project-smart-budget"

# Install dependencies (if first time)
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:5173/
```

---

**Still stuck?** Check the terminal output for any error messages and share them.
