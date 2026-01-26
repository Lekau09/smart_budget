# Savings & Goals - Visual Design Reference

## 📐 Card Layouts

### Collapsed Card (Default)
```
┌─────────────────────────────────────────┐
│                                         │ padding: 16px
│  Emergency Fund                    50%  │ ← Goal name (15px, 600w) | Percentage (19px, 700w)
│                                         │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░    │ ← Progress bar (4px height)
│                                         │
│  M5,000 / M10,000                       │ ← Saved / Target (13px, 500w)
│                                         │
└─────────────────────────────────────────┘
 Height: ~110px | Gap between: 12px
 Hover: Subtle shadow increase, cursor pointer
 Border: 1px solid var(--border-light)
```

### Expanded Card (Click to Open)
```
┌─────────────────────────────────────────┐
│ Emergency Fund                    50%   │
├─────────────────────────────────────────┤ ← Divider: 1px border
│                                         │
│  SAVED           │    TARGET            │ ← Detail labels (11px, 600w, uppercase)
│  M5,000          │    M10,000           │ ← Detail values (19px, 700w)
│                  │                      │
│  REMAINING       │    STATUS            │
│  M5,000          │    On Track          │ ← Status badge (11px, 600w)
│                  │                      │
│  DEADLINE                               │ (Optional: if present)
│  Jan 26, 2026                           │
│                                         │
│ [+ Add Savings      ] [Delete]          │ ← Action buttons (full width)
│                                         │
└─────────────────────────────────────────┘
 Height: ~320px | Animation: 200ms slideDown
 Elevation: var(--shadow-md) when expanded
```

---

## 🎨 Color Palette

### Progress Colors (Semantic)
```
Range        Color           Hex        Usage
──────────────────────────────────────────────
0–30%        Gray           #9ca3af    Getting started
31–70%       Blue           #3b82f6    Good progress
71–99%       Amber          #f59e0b    Almost there
100%         Green          #10b981    Complete!
```

### Status Badges
```
Status       Background      Text Color    Icon
──────────────────────────────────────────────────
On Track     #d1fae5        #047857       ✓
Behind       #fee2e2        #7f1d1d       ⚠
Completed    #d1fae5        #047857       ✓
```

### Card Styling
```
Element          Color                    Size
──────────────────────────────────────────────────
Background       var(--bg-primary)        #ffffff
Border           var(--border-light)      #e5e7eb
Title            var(--text-primary)      15px
Label            var(--text-muted)        11px
Value            var(--text-primary)      19px
Secondary Text   var(--text-secondary)    13px
```

### Button Styling

#### Primary Button (Add Savings)
```
State         Background         Text      Border
───────────────────────────────────────────────────
Default       #111827 (dark)    white     none
Hover         #3b82f6 (blue)    white     none
Active        #0f172a (darker)  white     none
Disabled      #9ca3af (gray)    white     none
```

#### Danger Button (Delete)
```
State         Background         Text Color    Border
──────────────────────────────────────────────────────
Default       transparent        #6b7280       #e5e7eb
Hover         #fee2e2 (light)   #ef4444       #fee2e2
Active        #fecaca           #dc2626       #fecaca
```

---

## 📏 Spacing & Sizing

### Vertical Spacing
```
Element                    Spacing
────────────────────────────────────
Between cards              var(--spacing-lg) = 16px
Inside card (top/bottom)   var(--spacing-lg) = 16px
Inside card (left/right)   var(--spacing-lg) = 16px
Between detail items       var(--spacing-md) = 12px
Between button rows        var(--spacing-sm) = 8px
```

### Horizontal Spacing
```
Element                    Padding
────────────────────────────────────
Card padding              16px (all sides)
Detail grid gap           12px (horizontal) / 16px (vertical)
Button area padding       Top: 12px, horizontal: 0px
```

### Component Sizes
```
Element              Height    Width      Notes
──────────────────────────────────────────────────
Progress bar         4px       100%       Thin, subtle
Status badge         24px      fit        Pill-shaped
Button              40px       100%       Touch-friendly
Card (collapsed)     ~110px    100%       Compact
Card (expanded)      ~320px    100%       With animation
Detail text label    14px      auto       Uppercase, small
Detail text value    20px      auto       Bold, large
```

---

## 🎬 Animation Specifications

### Card Expansion
```javascript
// CSS
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

// Timing
Duration:  200ms
Easing:    cubic-bezier(0.4, 0, 0.2, 1)  // ease-in-out
Timing:    On expand, staggered on close
```

### Progress Bar Fill
```javascript
// Animation
width: 0% → {targetPercent}%
duration: 300ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
GPU accelerated: yes (transform optimized)
```

### Button Interactions
```javascript
// Hover
Background: transition 150ms
Shadow: var(--shadow-xs) → var(--shadow-sm)

// Active
Transform: scale(0.98) on click
Duration: 100ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
```
Card width:       Full container
Card padding:     16px
Font size title:  15px (var(--font-size-base))
Font size label:  11px (var(--font-size-xs))
Progress bar:     4px
Button height:    40px
Gap between:      16px (var(--spacing-lg))
```

### Tablet (768px - 1023px)
```
Card width:       Full container (with gutter)
Card padding:     14px (slightly reduced)
Font size title:  14px (base - 1px)
Font size label:  11px (same)
Progress bar:     4px
Button height:    40px (touch-friendly)
Gap between:      14px (slightly reduced)
```

### Mobile (< 768px)
```
Card width:       Full container (no gutter)
Card padding:     12px (compact)
Font size title:  13px (reduced)
Font size label:  10px (reduced)
Progress bar:     3px (thinner)
Button height:    40px (maintain touch target)
Gap between:      12px (tighter)
Detail grid:      1 column (stacked)
Status badge:     Inline instead of boxed
```

---

## 🔤 Typography

### Font Family
```
Primary:   Inter, sans-serif (body text, labels)
Fallback:  -apple-system, BlinkMacSystemFont, system-ui
```

### Font Weights & Sizes

| Element | Size | Weight | Line Height | Example |
|---------|------|--------|-------------|---------|
| Goal Name | 15px | 600 | 1.3 | Emergency Fund |
| Percentage | 19px | 700 | 1.0 | 50% |
| Label | 11px | 600 | 1.2 | SAVED |
| Value | 19px | 700 | 1.0 | M5,000 |
| Secondary | 13px | 500 | 1.4 | M5,000 / M10,000 |

---

## 🎯 Visual Hierarchy

### Collapsed State (Emphasis)
```
1st:  Goal Name           (15px, 600w, primary color)
2nd:  Progress %          (19px, 700w, blue)
3rd:  Progress Bar        (visual element)
4th:  Amounts             (13px, 500w, secondary color)
```

### Expanded State (Emphasis)
```
1st:  Goal Name           (15px, 600w, primary color)
2nd:  Progress %          (19px, 700w, blue)
3rd:  Action Buttons      (40px height, full width)
4th:  Detail Values       (19px, 700w, primary)
5th:  Detail Labels       (11px, 600w, muted)
6th:  Status Badge        (semantic color)
```

---

## ✨ Focus & Hover States

### Card Focus
```
Outline:       2px solid var(--primary-main)
Outline-offset: 2px
Applies to:    Entire card (keyboard navigation)
```

### Button Hover
```
Primary Button:
  Background:  var(--primary-main) → darker
  Shadow:      var(--shadow-xs) → var(--shadow-sm)
  Duration:    150ms

Danger Button:
  Background:  transparent → var(--danger-light)
  Text:        var(--text-secondary) → var(--danger)
  Border:      var(--border-light) → var(--danger-light)
  Duration:    150ms
```

### Card Hover (Collapsed)
```
Shadow:  var(--shadow-xs) → var(--shadow-sm)
Border:  var(--border-light) → var(--border-main)
Cursor:  pointer
```

---

## 📊 Visual Comparison

### Old Design Problem
```
┌────────────────────┬────────────────────┬────────────────────┐
│ Vacation Fund 40%  │ Home 75%           │ Emergency 100%     │
│ ███░░░░░░░░░░░░░  │ ███████░░░░░░░░░  │ ██████████░░░░░░  │
│ M4k/M10k          │ M7.5k/M10k         │ M10k/M10k          │
│ +Add Savings      │ +Add Savings       │ +Add Savings       │
│ Delete            │ Delete             │ Delete             │
├────────────────────┼────────────────────┼────────────────────┤
│ Remaining: M6k    │ Remaining: M2.5k   │ Remaining: M0      │
│ Deadline: Apr 1   │ Deadline: May 15   │ Deadline: Jan 26   │
└────────────────────┴────────────────────┴────────────────────┘
Problem: Cognitive overload, scattered, no priority
```

### New Design Solution
```
┌─────────────────────────────────────────────┐
│ Vacation Fund                          40%  │
├─────────────────────────────────────────────┤
│ ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ M4,000 / M10,000                            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Home                                    75% │
├─────────────────────────────────────────────┤
│ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ M7,500 / M10,000                            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Emergency Fund                         100% │
├─────────────────────────────────────────────┤
│ ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ M10,000 / M10,000                           │
└─────────────────────────────────────────────┘

Solution: Clean, scannable, progressive disclosure, focused
```

---

## 🎓 Design Decisions Explained

| Decision | Why |
|----------|-----|
| **Vertical stack** | Natural reading order, responsive by default, easier to scan |
| **4px progress bar** | Professional (not bulky), matches fintech standard |
| **Dark neutral buttons** | Trustworthy (not bright colors), matches banking apps |
| **Single expansion** | Prevents distraction, intentional interaction, reduces errors |
| **Smooth animations** | Professional feel, guides user attention |
| **Compact collapsed** | Scannable (can see 5+ cards), space efficient |
| **No emojis** | Professional tone, universal (not culture-specific) |
| **Semantic colors** | Communicates meaning at a glance, accessibility |
| **Keyboard navigation** | Accessible to all users, power users appreciate it |

---

**Version**: 1.0 - Production Ready
**Last Updated**: January 26, 2026
**Design Standard**: Enterprise Fintech Quality
