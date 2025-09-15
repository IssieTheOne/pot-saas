# Design System - Glassmorphism 2025

## Overview

The Pot SaaS platform embraces a modern glassmorphism design aesthetic for 2025, featuring translucent surfaces, subtle gradients, and sophisticated visual hierarchy. This design system creates an immersive, professional experience that balances functionality with visual elegance.

## Core Design Principles

### Glassmorphism Fundamentals
- **Translucency**: Semi-transparent surfaces (backdrop-filter: blur)
- **Layered Depth**: Multiple glass layers creating visual hierarchy
- **Subtle Gradients**: Soft color transitions and highlights
- **Refined Shadows**: Gentle drop shadows with blur effects
- **Minimalist Borders**: Thin, subtle borders with transparency

### Color Palette

#### Primary Colors
```css
--glass-primary: rgba(255, 255, 255, 0.25);
--glass-secondary: rgba(255, 255, 255, 0.15);
--glass-accent: rgba(99, 102, 241, 0.8); /* Indigo */
--glass-success: rgba(34, 197, 94, 0.8); /* Green */
--glass-warning: rgba(251, 191, 36, 0.8); /* Amber */
--glass-error: rgba(239, 68, 68, 0.8); /* Red */
```

#### Background Gradients
```css
--bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--bg-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--bg-neutral: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

#### Text Colors
```css
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.7);
--text-muted: rgba(255, 255, 255, 0.5);
--text-dark: rgba(0, 0, 0, 0.8);
```

## Component Library

### Glass Card Component
```css
.glass-card {
  background: var(--glass-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
}
```

### Navigation Menu
```css
.glass-nav {
  background: var(--glass-secondary);
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.nav-item {
  color: var(--text-primary);
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 12px 20px;
}

.nav-item:hover {
  background: var(--glass-primary);
  color: var(--text-dark);
}
```

### Buttons
```css
.btn-glass {
  background: var(--glass-primary);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-primary);
  padding: 12px 24px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.btn-glass-primary {
  background: var(--glass-accent);
  color: white;
}

.btn-glass-primary:hover {
  background: rgba(99, 102, 241, 0.9);
}
```

### Input Fields
```css
.glass-input {
  background: var(--glass-secondary);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.3);
  border-color: var(--glass-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Modal/Dialog
```css
.glass-modal {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--glass-primary);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}
```

## Layout Patterns

### Dashboard Layout
```css
.dashboard {
  background: var(--bg-primary);
  min-height: 100vh;
  padding: 80px 20px 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
```

### Sidebar Navigation
```css
.sidebar {
  background: var(--glass-secondary);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 80px 0 20px;
  overflow-y: auto;
}

.sidebar-item {
  padding: 16px 24px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  border-radius: 0 20px 20px 0;
  margin: 4px 0;
}

.sidebar-item:hover,
.sidebar-item.active {
  background: var(--glass-primary);
  color: var(--text-primary);
  margin-right: -20px;
}
```

## Typography

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Text Styles
```css
.text-display {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary);
}

.text-heading {
  font-size: 2.25rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
}

.text-subheading {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-secondary);
}

.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-primary);
}

.text-caption {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-muted);
}
```

## Animations & Transitions

### Micro-interactions
```css
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

### Loading States
```css
.glass-loading {
  background: linear-gradient(
    90deg,
    var(--glass-secondary) 25%,
    rgba(255, 255, 255, 0.4) 50%,
    var(--glass-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

### Mobile Adaptations
```css
@media (max-width: 768px) {
  .glass-card {
    border-radius: 12px;
    margin: 8px;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
```

## Accessibility Considerations

### Focus States
```css
.glass-focus:focus-visible {
  outline: 2px solid var(--glass-accent);
  outline-offset: 2px;
  background: rgba(99, 102, 241, 0.1);
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.2);
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .glass-hover {
    transition: none;
  }

  .fade-in {
    animation: none;
  }
}
```

## Dark Mode Support

### Dark Theme Variables
```css
[data-theme="dark"] {
  --glass-primary: rgba(0, 0, 0, 0.25);
  --glass-secondary: rgba(0, 0, 0, 0.15);
  --bg-primary: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
}
```

## Implementation Guidelines

### CSS Custom Properties Usage
- Use CSS custom properties for all design tokens
- Maintain consistent naming conventions
- Document all variables and their purposes

### Component Structure
- Use semantic HTML elements
- Implement ARIA attributes for accessibility
- Maintain consistent class naming (BEM methodology)

### Performance Optimization
- Use CSS containment where possible
- Optimize backdrop-filter usage
- Implement lazy loading for images and components

### Browser Support
- Modern browsers with backdrop-filter support
- Progressive enhancement for older browsers
- CSS Grid and Flexbox for layouts

This design system provides a comprehensive foundation for building a visually stunning, accessible, and performant SaaS platform with a cutting-edge glassmorphism aesthetic.
