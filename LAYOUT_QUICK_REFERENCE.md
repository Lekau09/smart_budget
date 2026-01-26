# SmartBudget Layout System - Quick Reference

## Layout Components

### 1. PageContainer
Wraps page content with consistent padding.

```jsx
<PageContainer variant="standard">
  {children}
</PageContainer>
```

**Variants:**
- `standard` - 2rem padding (default)
- `compact` - 1.5rem padding
- `full` - no padding (edge-to-edge)

---

### 2. GridSection
Creates responsive grid layouts.

```jsx
<GridSection cols="3" gap="lg">
  <Card />
  <Card />
  <Card />
</GridSection>
```

**Columns:** `auto` (responsive) | `2` | `3` | `4` | `12`  
**Gaps:** `xs` | `sm` | `md` | `lg` | `xl`

---

### 3. LayoutRow
Creates balanced 2-column layouts.

```jsx
<LayoutRow ratio="1-2" gap="lg">
  <Filters />      {/* 1fr */}
  <Content />      {/* 2fr */}
</LayoutRow>
```

**Ratios:** `equal` | `1-2` | `2-1` | `1-3` | `3-1` | `2-3` | `3-2`  
**Gaps:** `xs` | `sm` | `md` | `lg` | `xl`

---

## Common Patterns

### KPI Grid (4 columns)
```jsx
<GridSection cols="auto" gap="lg" className="kpi-grid">
  <KPICard amount="1000" label="Budget" />
  <KPICard amount="500" label="Spent" />
  <KPICard amount="200" label="Saved" />
  <KPICard amount="300" label="Remaining" />
</GridSection>
```

### Side-by-Side Charts (2 columns)
```jsx
<LayoutRow ratio="equal" gap="lg">
  <Card><Chart /></Card>
  <Card><Chart /></Card>
</LayoutRow>
```

### Filters + Content
```jsx
<LayoutRow ratio="1-3" gap="lg">
  <Card>Filters</Card>
  <Card>List/Table</Card>
</LayoutRow>
```

### Cards Grid (3 columns)
```jsx
<GridSection cols="3" gap="lg">
  {items.map(item => (
    <Card key={item.id}>{item}</Card>
  ))}
</GridSection>
```

---

## CSS Classes

### Available Classes (in src/index.css)

```css
/* Grid layouts */
.grid-section
.grid-cols-auto / .grid-cols-2 / .grid-cols-3 / .grid-cols-4

/* Row layouts */
.layout-row
.row-ratio-equal / .row-ratio-1-2 / .row-ratio-2-1

/* Gap utilities */
.gap-xs / .gap-sm / .gap-md / .gap-lg / .gap-xl

/* Page containers */
.page-container / .page-container-standard / .page-container-compact
```

---

## Spacing Scale

```
XS   = 0.25rem (4px)
SM   = 0.5rem  (8px)
MD   = 1rem    (16px)
LG   = 1.5rem  (24px)  ← DEFAULT
XL   = 2rem    (32px)
```

---

## Responsive Behavior

| Screen Size | Layout | Columns |
|---|---|---|
| Desktop (1280px+) | Full multi-column | 2-4 cols |
| Tablet (768px) | Adjusted grid | 2-3 cols |
| Mobile (<768px) | Single column | 1 col |

---

## Page Structure Template

```jsx
import PageContainer from './PageContainer';
import GridSection from './GridSection';
import LayoutRow from './LayoutRow';

export default function MyPage() {
  return (
    <PageContainer variant="standard">
      {/* 1. Title Section */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">My Page</h1>
        <p className="page-subtitle">Description</p>
      </div>

      {/* 2. Summary Cards */}
      <GridSection cols="auto" gap="lg" style={{ marginBottom: 24 }}>
        <Card>Summary 1</Card>
        <Card>Summary 2</Card>
        <Card>Summary 3</Card>
      </GridSection>

      {/* 3. Main Content */}
      <LayoutRow ratio="equal" gap="lg">
        <Card>Left</Card>
        <Card>Right</Card>
      </LayoutRow>
    </PageContainer>
  );
}
```

---

## No-Nos ❌

- ❌ No `max-width: 500px` or narrow width constraints
- ❌ No `margin: 0 auto` for centering
- ❌ No single-column vertical stacking on desktop
- ❌ No excessive padding/gaps (use scale)
- ❌ No page-specific layout hacks
- ❌ No inline flexbox layouts (use GridSection/LayoutRow)
- ❌ No hardcoded breakpoints in components

---

## Do's ✅

- ✅ Use PageContainer for all pages
- ✅ Use GridSection for card grids
- ✅ Use LayoutRow for 2-column layouts
- ✅ Use CSS gap utility classes
- ✅ Follow the spacing scale
- ✅ Keep layouts simple and reusable
- ✅ Use responsive column counts
- ✅ Test on mobile/tablet/desktop

---

## Files Modified

```
src/components/layouts/
├── AppLayout.jsx           ← NEW
├── PageContainer.jsx       ← NEW
├── GridSection.jsx         ← NEW
└── LayoutRow.jsx           ← NEW

src/features/
├── dashboard/Dashboard.jsx
├── transactions/Transactions.jsx
├── analytics/Analytics.jsx
├── goals/Goals.jsx
└── savings/Savings.jsx

src/pages/
└── Settings.jsx

src/index.css               ← +200 lines CSS Grid
```

---

## Import All Layout Components

```jsx
import PageContainer from '../../components/layouts/PageContainer';
import GridSection from '../../components/layouts/GridSection';
import LayoutRow from '../../components/layouts/LayoutRow';
// AppLayout is only for root App.jsx
import AppLayout from '../../components/layouts/AppLayout';
```

---

## z-index Scale

```
--z-dropdown: 1000        (dropdowns)
--z-sticky: 1020          (sticky elements)
--z-fixed: 1030           (fixed positioning)
--z-modal-backdrop: 1040  (modal backgrounds)
--z-modal: 1050           (modals)
--z-popover: 1060         (popovers)
--z-tooltip: 1070         (tooltips)
```

---

## Color System (Available)

```
PRIMARY
--primary: #0B5FFF
--primary-dark: #0946CC
--primary-light: #EEF4FF

SEMANTIC
--success: #10B981
--warning: #F59E0B
--danger: #D64545
--info: #06B6D4

TEXT
--text-primary: #0F172A
--text-secondary: #64748B
--text-muted: #94A3AF
--text-light: #CBD5E1

SURFACES
--surface: #FFFFFF
--surface-secondary: #F8FAFC
--surface-tertiary: #F1F5F9

BORDERS
--border: #E2E8F0
--border-light: #F1F5F9
```

---

## Debugging Layout Issues

**Problem:** Content too narrow  
**Solution:** Remove any `max-width`, use PageContainer instead

**Problem:** Vertical stacking on desktop  
**Solution:** Use LayoutRow or GridSection with proper `cols`

**Problem:** Uneven spacing  
**Solution:** Use `.gap-lg` (1.5rem default) for consistency

**Problem:** Content overlapping  
**Solution:** Check z-index, use proper `gap` values

**Problem:** Mobile looks crowded  
**Solution:** GridSection auto-collapses to 1 column at 768px

---

## Quick Checklist for New Pages

- [ ] Wrapped in `<PageContainer variant="standard">`
- [ ] Using `<GridSection>` for card grids
- [ ] Using `<LayoutRow>` for 2-column layouts
- [ ] Proper `gap` value used (default lg = 1.5rem)
- [ ] No `max-width` constraints
- [ ] No inline flexbox layouts
- [ ] Tested on mobile (375px)
- [ ] Tested on desktop (1280px+)
- [ ] Title and subtitle at top
- [ ] Consistent spacing (marginBottom values)

---

## Support

For detailed documentation, see:
- **LAYOUT_TRANSFORMATION_SUMMARY.md** - Complete overview
- **LAYOUT_REFACTORING_COMPLETE.md** - Technical details
- **src/index.css** - CSS Grid implementation

---

**Your layout system is production-ready!** 🎉

Use these components, follow the patterns, and your pages will look professional and consistent across all devices.
