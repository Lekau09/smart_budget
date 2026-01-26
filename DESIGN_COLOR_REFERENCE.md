# 🎨 SmartBudget Design System - Visual Reference

## Color Palette

### Primary Colors
```
Primary Blue:        #0B5FFF  (main action color)
Primary Dark Blue:   #0946CC  (hover state)
Primary Light Blue:  #EEF4FF  (background/focus)
```

### Semantic Colors
```
Success Green:       #10B981  (positive actions)
Success Light:       #D1FAE5  (success background)

Warning Orange:      #F59E0B  (warnings)
Warning Light:       #FEF3C7  (warning background)

Danger Red:          #D64545  (errors)
Danger Light:        #FEE2E2  (error background)

Info Cyan:           #06B6D4  (information)
Info Light:          #CFFAFE  (info background)

Purple:              #8B5CF6  (special cases)
Purple Light:        #F3E8FF  (purple background)
```

### Neutral Colors (Text & Borders)
```
Darkest (Text):      #0F172A  (primary text)
Dark (Secondary):    #64748B  (secondary text)
Medium (Muted):      #94A3AF  (muted text)
Light (Borders):     #CBD5E1  (subtle borders)
```

### Background Colors
```
Primary Surface:     #FFFFFF  (main content)
Secondary Surface:   #F8FAFC  (alternate sections)
Tertiary Surface:    #F1F5F9  (depth layers)

Border:              #E2E8F0  (main borders)
Border Light:        #F1F5F9  (light borders)
Border Subtle:       #F8FAFC  (subtle borders)

Slate Palette:       9 shades for flexibility
```

---

## Typography Scale

```
Font Family: Poppins (sans-serif)

XS:    0.75rem   (12px) - smallest text
SM:    0.875rem  (14px) - small text
Base:  1rem      (16px) - body text
LG:    1.125rem  (18px) - large text
XL:    1.25rem   (20px) - extra large
2XL:   1.5rem    (24px) - heading 3
3XL:   1.875rem  (30px) - heading 2
4XL:   2.25rem   (36px) - heading 1
5XL:   3rem      (48px) - hero title
```

### Font Weights
```
Light:      300
Normal:     400
Medium:     500
Semibold:   600
Bold:       700
Extra Bold: 800
```

### Line Heights
```
Tight:      1.2  (for headings)
Normal:     1.5  (for body text)
Relaxed:    1.75 (for long-form content)
```

---

## Spacing System

```
XS:     0.25rem  (4px)
SM:     0.5rem   (8px)
MD:     1rem     (16px) - standard
LG:     1.5rem   (24px) - generous
XL:     2rem     (32px) - extra
2XL:    3rem     (48px) - very large
3XL:    4rem     (64px) - extra large
4XL:    6rem     (96px) - huge
```

---

## Shadow System

```
XS (subtle):
  0 1px 2px 0 rgba(0, 0, 0, 0.04)

SM (light):
  0 1px 3px 0 rgba(0, 0, 0, 0.08),
  0 1px 2px 0 rgba(0, 0, 0, 0.04)

MD (medium):
  0 4px 6px -1px rgba(0, 0, 0, 0.08),
  0 2px 4px -1px rgba(0, 0, 0, 0.04)

LG (strong):
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05)

XL (extra strong):
  0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 10px 10px -5px rgba(0, 0, 0, 0.04)

2XL (maximum):
  0 25px 50px -12px rgba(0, 0, 0, 0.2)
```

---

## Border Radius

```
SM:     0.375rem  (6px)
MD:     0.5rem    (8px)
LG:     0.75rem   (12px)
XL:     1rem      (16px)   - buttons, inputs
2XL:    1.5rem    (24px)   - cards
3XL:    2rem      (32px)   - large containers
FULL:   9999px    (rounded)
```

---

## Component Styles

### Button Examples

**Primary Button**
```
Background:     Linear gradient (blue → dark blue)
Text Color:     White
Padding:        0.875rem 1.25rem
Min Height:     44px
Border Radius:  1rem
Shadow:         0 4px 15px rgba(11, 95, 255, 0.15)
Hover Shadow:   0 8px 25px rgba(11, 95, 255, 0.25)
Transform:      translateY(-2px)
```

**Secondary Button**
```
Background:     #F8FAFC
Text Color:     #0F172A
Padding:        0.875rem 1.25rem
Min Height:     44px
Border:         1px solid #E2E8F0
Border Radius:  1rem
Hover Shadow:   0 4px 12px rgba(0, 0, 0, 0.08)
```

**Danger Button**
```
Background:     #FEE2E2
Text Color:     #D64545
Padding:        0.875rem 1.25rem
Min Height:     44px
Border:         1px solid #D64545
Border Radius:  1rem
Hover:          Red bg with white text
```

### Input Field
```
Background:     #FFFFFF
Border:         1.5px solid #E2E8F0
Padding:        0.875rem 1.125rem
Min Height:     44px
Border Radius:  1rem
Focus Border:   1.5px solid #0B5FFF
Focus Ring:     0 0 0 4px #EEF4FF
Font Size:      0.875rem
```

### Card
```
Background:     #FFFFFF
Border:         1px solid #E2E8F0
Padding:        2rem
Border Radius:  1.5rem
Shadow:         0 2px 8px rgba(0, 0, 0, 0.04)
Hover Shadow:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
Transform:      translateY(-2px)
Transition:     0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Sidebar Item (Active)
```
Background:     #EEF4FF
Text Color:     #0B5FFF
Border:         1px solid #0B5FFF
Padding:        0.875rem 1rem
Border Radius:  0.75rem
Font Weight:    500
```

### Table Header Cell
```
Background:     #F8FAFC
Padding:        1.25rem 1rem
Font Weight:    700
Font Size:      0.7rem
Text Transform: UPPERCASE
Letter Spacing: 0.08em
Text Color:     #64748B
Border Bottom:  2px solid #E2E8F0
```

---

## Transition Timings

```
Fast:    0.15s cubic-bezier(0.4, 0, 0.2, 1)
         Used for: interactive feedback, hover states

Normal:  0.3s cubic-bezier(0.4, 0, 0.2, 1)
         Used for: state changes, slides

Slow:    0.5s cubic-bezier(0.4, 0, 0.2, 1)
         Used for: modals, important changes
```

---

## Gradient Definitions

### Primary Gradient
```
linear-gradient(135deg, #0B5FFF 0%, #0946CC 100%)
Used for: Primary buttons, featured elements
```

### Success Gradient
```
linear-gradient(135deg, #10B981 0%, #059669 100%)
Used for: Success states, positive actions
```

### Warning Gradient
```
linear-gradient(135deg, #F59E0B 0%, #D97706 100%)
Used for: Warning states, caution elements
```

### Danger Gradient
```
linear-gradient(135deg, #D64545 0%, #B91C1C 100%)
Used for: Danger states, destructive actions
```

---

## Responsive Breakpoints

```
Mobile:    Up to 640px
Tablet:    640px - 1024px
Desktop:   1024px+

Touch Targets:
- Minimum: 44px × 44px
- Preferred: 48px × 48px
```

---

## Accessibility Standards

**Color Contrast:**
- Text on background: 4.5:1 minimum (AA)
- Large text: 3:1 minimum (AA)
- UI components: 3:1 minimum (AA)

**Focus Indicators:**
- 4px focus ring
- High contrast outline
- Clearly visible on all backgrounds

**Touch Targets:**
- Minimum 44px × 44px
- Adequate spacing (8px minimum)

---

## CSS Variable Reference

### Colors
```
--primary: #0B5FFF
--primary-dark: #0946CC
--primary-light: #EEF4FF
--success: #10B981
--success-light: #D1FAE5
--danger: #D64545
--danger-light: #FEE2E2
--text-primary: #0F172A
--text-secondary: #64748B
--text-muted: #94A3AF
--surface: #FFFFFF
--surface-secondary: #F8FAFC
--border: #E2E8F0
```

### Gradients
```
--gradient-primary: linear-gradient(135deg, #0B5FFF 0%, #0946CC 100%)
--gradient-success: linear-gradient(135deg, #10B981 0%, #059669 100%)
--gradient-warning: linear-gradient(135deg, #F59E0B 0%, #D97706 100%)
--gradient-danger: linear-gradient(135deg, #D64545 0%, #B91C1C 100%)
```

### Shadows
```
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08)
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08)
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.15)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.2)
```

### Transitions
```
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Quick Tips

1. **Color:** Always use semantic variable names (--success, --danger)
2. **Spacing:** Use the spacing scale (md, lg, xl) for consistency
3. **Shadows:** Use shadow levels that match elevation (xs for subtle, xl for prominent)
4. **Typography:** Use font weight variables for consistency
5. **Animation:** Keep UI animations fast (0.15s), state changes normal (0.3s)
6. **Focus:** Always add focus rings for accessibility
7. **Transitions:** Use cubic-bezier for natural motion
8. **Testing:** Test colors on all backgrounds and with different vision

---

## Visual Hierarchy

```
Level 1 (Most Important):
- Hero headlines (5xl/4xl)
- Primary buttons
- Primary colors

Level 2 (Important):
- Section titles (3xl/2xl)
- Secondary buttons
- Secondary colors

Level 3 (Standard):
- Body text (base)
- Cards with shadows
- Standard UI elements

Level 4 (Supporting):
- Helper text (sm/xs)
- Muted colors
- Minimal shadows

Level 5 (Least Important):
- Placeholder text
- Disabled states
- Very light colors
```

---

*This design system ensures consistency, accessibility, and beauty across SmartBudget.*

**Version 2.0 - Production Ready** ✅
