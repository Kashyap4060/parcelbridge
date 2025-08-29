# RoleSwitcher Component

A modern, space-efficient component that allows users to seamlessly switch between "Sender" and "Carrier" roles.

## Features

- **Compact Design**: Optimized for space with roles displayed side by side
- **Interactive Toggle**: Animated switch button between roles for intuitive role switching
- **Visual Feedback**: Clear indication of current role with color-coded styling
- **Loading States**: Elegant loading animation during role transitions
- **Multiple Variants**: Different sizes and styles for various use cases

## Variants

### Default (`variant="default"`)
- Full-featured design with gradient backgrounds
- Shows current role prominently and preview of other role
- Animated toggle button with hover effects
- Best for standalone use or prominent placement

### Compact (`variant="compact"`)
- Slider-style toggle switch with role icons
- Integrated current role label
- Perfect for headers and navigation areas
- Currently used in UserProfileHeader

### Minimal (`variant="minimal"`)
- Ultra-compact design with just current role and toggle button
- Ideal for tight spaces or mobile layouts

## Usage

```tsx
// In header (integrated)
<UserProfileHeader showRoleSwitcher={true} />

// Standalone default
<RoleSwitcher />

// Standalone compact
<RoleSwitcher variant="compact" />

// Standalone minimal
<RoleSwitcher variant="minimal" />
```

## Design Highlights

- **Space Efficient**: Reduced from large card layout to compact inline component
- **User-Friendly**: One-click toggle between roles instead of separate buttons
- **Visual Hierarchy**: Current role is prominently displayed, other role shown as preview
- **Smooth Animations**: Hover effects and loading states for better UX
- **Accessibility**: Proper button semantics and disabled states
- **Responsive**: Works well across different screen sizes

## Integration

The component is now integrated into the main dashboard header via `UserProfileHeader`, eliminating the need for a separate role switcher section and saving valuable screen real estate.
