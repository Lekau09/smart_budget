# SmartBudget Design System - Quick Reference

## Button Classes

### Primary Actions
```jsx
<button className="btn-primary">Save</button>
```

### Secondary Actions  
```jsx
<button className="btn-secondary">Cancel</button>
```

### Success/Positive
```jsx
<button className="btn-success">Confirm</button>
```

### Danger/Destructive
```jsx
<button className="btn-danger">Delete</button>
```

### Warning
```jsx
<button className="btn-warning">Caution</button>
```

### Ghost (Minimal)
```jsx
<button className="btn-ghost">Skip</button>
```

### Outline (Bordered)
```jsx
<button className="btn-outline">Option</button>
```

### Icon Only
```jsx
<button className="btn-icon">
  <FontAwesomeIcon icon={faClose} />
</button>
```

## Sizing

```jsx
<button className="btn btn-small">Small</button>
<button className="btn">Medium (default)</button>
<button className="btn btn-large">Large</button>
<button className="btn btn-block">Full Width</button>
```

## Form Elements

### Input
```jsx
<input className="input" type="text" placeholder="Text..." />
```

### Form Group
```jsx
<div className="form-group">
  <label className="form-label">Field Label</label>
  <input className="input" />
  <div className="form-hint">Helper text</div>
</div>
```

### Error State
```jsx
<input className="input error" />
<div className="form-error">Error message</div>
```

### Success State
```jsx
<input className="input success" />
<div className="form-success">Success message</div>
```

## Cards

```jsx
<div className="card">
  <div className="card-header">
    <h2 className="card-title">Title</h2>
  </div>
  <div className="card-body">
    Content here
  </div>
  <div className="card-footer">
    Footer actions
  </div>
</div>
```

## Colors (CSS Variables)

### Primary Colors
```css
--primary: #0B5FFF;          /* Main brand color */
--primary-hover: #0648D4;    /* Hover state */
--primary-active: #053BA8;   /* Active state */
--primary-light: #EEF4FF;    /* Light variant */
```

### Semantic Colors
```css
--success: #10B981;          /* Positive/save */
--error: #EF4444;            /* Destructive/delete */
--warning: #F59E0B;          /* Caution */
--info: #0B5FFF;             /* Information */
```

### Surfaces
```css
--surface: #FFFFFF;          /* Main background */
--surface-secondary: #F3F4F6;/* Alternative background */
--bg: #F9FAFB;               /* Page background */
--border: #E5E7EB;           /* Standard border */
```

### Neutral Text
```css
--neutral-900: #051033;      /* Primary text */
--neutral-800: #0F1629;      /* Secondary text */
--neutral-700: #2B2F36;      /* Body text */
--neutral-600: #4A5568;      /* Secondary labels */
--neutral-500: #6B7280;      /* Tertiary text */
```

## Spacing

```css
--s-xxs: 4px;
--s-xs: 8px;
--s-sm: 12px;
--s-md: 16px;
--s-lg: 24px;
--s-xl: 32px;
--s-2xl: 48px;
```

## Border Radius

```css
--radius-sm: 4px;            /* Small elements */
--radius-md: 8px;            /* Buttons, inputs */
--radius-lg: 12px;           /* Cards */
--radius-full: 999px;        /* Circles */
```

## Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

## Common Patterns

### Modal with Button
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
  <div className="relative bg-surface rounded-lg shadow-lg p-6">
    <h2>Title</h2>
    <div className="flex gap-3 mt-6">
      <button className="btn btn-secondary flex-1">Cancel</button>
      <button className="btn btn-primary flex-1">Confirm</button>
    </div>
  </div>
</div>
```

### Form with Validation
```jsx
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label className="form-label">Email</label>
    <input 
      className={`input ${errors.email ? 'error' : ''}`}
      type="email"
    />
    {errors.email && <div className="form-error">{errors.email}</div>}
  </div>
  <button className="btn btn-primary w-full mt-6">Submit</button>
</form>
```

### Card with Icon
```jsx
<div className="card">
  <div style={{ display: 'flex', gap: '12px' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: 'var(--primary-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <FontAwesomeIcon icon={faWallet} style={{ color: 'var(--primary)' }} />
    </div>
    <div>
      <div className="card-title">Balance</div>
      <div className="value">M1,234.56</div>
    </div>
  </div>
</card>
```

## State Indicators

### Loading State
```jsx
<button className="btn-primary loading">Loading...</button>
```

### Disabled State
```jsx
<button className="btn-primary" disabled>Disabled</button>
```

### Focus State (automatic)
```jsx
<button className="btn-primary">
  {/* Focus outline is automatically applied */}
</button>
```

## Accessibility

### Always use ARIA labels
```jsx
<button className="btn-icon" aria-label="Close dialog" title="Close">
  <FontAwesomeIcon icon={faTimes} />
</button>
```

### Form labels
```jsx
<label htmlFor="email" className="form-label">Email</label>
<input id="email" className="input" type="email" />
```

### Error announcements
```jsx
<input aria-invalid={!!error} aria-describedby="error" />
{error && <div id="error" className="form-error">{error}</div>}
```

## Responsive Design

### Mobile-first
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Single column on mobile, 2 on tablet, 4 on desktop */}
</div>
```

### Hide on mobile
```jsx
<div className="hidden md:block">
  {/* Only shows on medium screens and up */}
</div>
```

## Tips & Best Practices

1. **Always use semantic button types** - `.btn-primary` for main action, `.btn-secondary` for alternative
2. **Include ARIA labels** - Especially for icon-only buttons
3. **Use form-groups** - Keeps labels, inputs, and errors organized
4. **Follow 8px grid** - Use spacing variables for consistency
5. **No inline styles** - Use classes instead for maintainability
6. **Check contrast** - All colors meet WCAG AA standards
7. **Test keyboard navigation** - All buttons should be keyboard accessible
8. **Mobile-first approach** - Design for mobile then enhance for desktop

## Common Issues

### Button not responding
- Check if button has `onClick` handler
- Verify handler is defined and not async without state management
- Check for event.preventDefault() if needed

### Colors not applying
- Use CSS variable names (e.g., `var(--primary)`)
- Check class names are spelled correctly
- Verify CSS is loaded before component render

### Focus states not visible
- All `.btn-*` classes include focus states automatically
- If custom button, add: `focus: outline 2px solid var(--primary); outline-offset: 2px;`

### Form validation
- Use `.input.error` class for error state
- Display `.form-error` text below input
- Use `aria-invalid` for screen readers

## File Locations

- **CSS**: `index.css` (lines 1-1595)
- **Button docs**: `DESIGN_SYSTEM.md`
- **Implementation guide**: `DESIGN_IMPLEMENTATION_REPORT.md`
- **Components**: `components/` directory

## Getting Help

1. Check `DESIGN_SYSTEM.md` for complete documentation
2. Review `DESIGN_IMPLEMENTATION_REPORT.md` for implementation details
3. Look at component examples in `components/` folder
4. Verify CSS variables are available in `index.css`

---

**Last Updated**: January 20, 2026
**Version**: 1.0 - Complete Design System
