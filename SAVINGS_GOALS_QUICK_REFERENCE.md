# Savings & Goals - Quick Reference Guide

## 🎯 Design Principles at a Glance

| Principle | Implementation |
|---|---|
| **Clarity** | Collapsed cards show only essential info; details on demand |
| **Hierarchy** | Goal name & progress primary; actions in expanded state |
| **Trust** | Dark/neutral buttons (not bright colors); minimal design |
| **Efficiency** | Compact cards = scannable dashboards |
| **Intention** | Single card expansion; confirmation on delete |

---

## 📦 Component: GoalCard

**File**: `src/components/GoalCard.jsx` + `src/components/GoalCard.css`

**Props**:
```javascript
{
  goal,              // { id, goal_name, target_amount, current_amount, deadline }
  isExpanded,        // boolean
  onToggle,          // () => void
  onAddSavings,      // (goal) => void
  onDelete,          // (goalId) => void
  onUpdate           // (id, data) => void (optional)
}
```

**Features**:
- Auto-calculates progress percentage
- Auto-calculates remaining amount
- Semantic progress colors (0-30% gray, 31-70% blue, 71-99% amber, 100% green)
- Status: "On Track" / "Behind" / "Completed"
- Keyboard accessible
- Smooth animations

---

## 🎨 Collapsed State (Default)
```
┌─────────────────────────────────┐
│ Emergency Fund                50%│  ← Goal name | Progress %
├─────────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░░░░░░░│  ← Progress bar (4px, semantic color)
├─────────────────────────────────┤
│ M5,000 / M10,000                │  ← Saved / Target
└─────────────────────────────────┘
   (click to expand)
```

**CSS class**: `.goal-card-collapsed`

---

## 🔓 Expanded State
```
┌─────────────────────────────────┐
│ Emergency Fund                50%│
├─────────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░░░░░░░│
├─────────────────────────────────┤
│ SAVED            TARGET          │
│ M5,000           M10,000         │
│                                  │
│ REMAINING        STATUS          │
│ M5,000           On Track        │  ← 4-grid details layout
│                                  │
│ DEADLINE                         │
│ Jan 26, 2026                     │  ← If present
├─────────────────────────────────┤
│ [+ Add Savings] [Delete]         │  ← Full-width buttons
└─────────────────────────────────┘
```

**CSS class**: `.goal-card-expanded`

---

## 🎨 Color System

### Progress Bar Colors
```css
0-30%:    #9ca3af (neutral gray)
31-70%:   #3b82f6 (primary blue)
71-99%:   #f59e0b (amber)
100%:     #10b981 (success green)
```

### Status Badges
```css
On Track:   Green background + text
Behind:     Red background + text
Completed:  Green background + text
```

### Button Colors
```css
Primary:    #111827 (dark) → #3b82f6 on hover
Danger:     Transparent → #fee2e2 background on hover
```

---

## ⚡ Animations

### Card Expansion
- Duration: 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Uses: @keyframes slideDown

### Progress Bar Fill
- Duration: 300ms
- Smooth width transition

### Button Interactions
- Hover: 150ms transition
- Active: 0.98 scale (subtle press effect)

---

## 📱 Layout

### Collapsed Stack
```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
  {goals.map(goal => <GoalCard {...} />)}
</div>
```

**Spacing**: 16px between cards (var(--spacing-lg))

### Responsive
- Desktop (1024px+): Full width vertical stack
- Tablet (768px+): Adjusted padding
- Mobile (<768px): Optimized for touch

---

## 🔄 State Management Example

```javascript
// In parent component (Savings.jsx / Goals.jsx)
const [expandedGoalId, setExpandedGoalId] = useState(null);

// Expand/Collapse Handler
const handleToggle = (goalId) => {
  setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
};

// Only one card open at a time
<GoalCard
  isExpanded={expandedGoalId === goal.id}
  onToggle={() => handleToggle(goal.id)}
/>
```

---

## 🔐 Deletion Flow

1. User clicks "Delete" button
2. Confirmation dialog: `"Delete 'Goal Name'?"`
3. If confirmed → calls `onDelete(goalId)`
4. Parent handles deletion + API call
5. Card removed from list

---

## ♿ Accessibility

| Feature | Implementation |
|---|---|
| **Keyboard** | Tab to navigate, Enter/Space to expand |
| **Focus** | 2px outline on focused cards |
| **ARIA** | role="button", tabIndex={0} |
| **Labels** | Semantic font sizes, sufficient contrast |
| **Confirmation** | Delete requires confirmation dialog |

---

## 🐛 Common Issues & Fixes

### Multiple cards open at once
```javascript
// ✗ Wrong: onToggle doesn't clear others
<GoalCard onToggle={() => setExpandedGoalId(goal.id)} />

// ✓ Correct: Toggle logic handles it
<GoalCard onToggle={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)} />
```

### Progress shows > 100%
```javascript
// ✓ GoalCard handles this automatically
width={`${Math.min(progress, 100)}%`}
```

### Delete not working
```javascript
// Ensure onDelete is connected to API
onDelete={(goalId) => {
  deleteGoal(goalId);  // Your API function
}}
```

---

## 📊 Data Flow

```
Goals API
    ↓
BudgetContext.fetchGoals()
    ↓
Savings.jsx / Goals.jsx
    ↓
[expandedGoalId state]
    ↓
<GoalCard isExpanded={...} />
    ↓
User clicks → onToggle()
    ↓
setExpandedGoalId (new state)
    ↓
Card animates expand/collapse
```

---

## 🚀 Performance Tips

1. **Use React.memo** if goals list is large
```javascript
export default React.memo(GoalCard);
```

2. **Debounce rapid expansions** if needed
```javascript
const debouncedToggle = useMemo(() => debounce(onToggle, 100), [onToggle]);
```

3. **Lazy load details** if goal data is large
```javascript
{isExpanded && <GoalDetails goal={goal} />}
```

---

## 📚 Additional Resources

- **Design System**: `src/index.css` (CSS variables)
- **Usage Example**: `src/features/savings/Savings.jsx`
- **Full Documentation**: `SAVINGS_GOALS_REFACTOR.md`

---

**Last Updated**: January 26, 2026
**Version**: 1.0 - Production Ready
