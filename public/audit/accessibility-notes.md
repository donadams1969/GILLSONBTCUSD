# VALORAIPLUS Accessibility Notes

## WCAG AA Compliance Measures

### Keyboard Navigation
- Skip-to-main link on every page (`<a href="#main">`)
- All interactive elements have visible focus rings via `focus-visible:ring-2`
- Tab order follows logical reading flow

### Screen Readers
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`
- `aria-label` on all icon-only buttons
- `sr-only` class for screen-reader-only text
- `aria-live="polite"` on dynamic content (terminal, ticker)
- Ticker inner content marked `aria-hidden="true"` with outer `role="marquee"`

### Motion Sensitivity
- `prefers-reduced-motion: reduce` pauses all animations
- `.ticker-animate` and `.animate-marquee` honor reduced-motion
- `.cursor-blink` and `.animate-pulse` disabled under reduced-motion

### Color & Contrast
- Semantic design tokens enforce consistent contrast ratios
- High-contrast mode available via Accessibility Controls panel
- All text uses themed foreground tokens (never hardcoded white/black)

### Youth Safety
- SafetyProvider gates financial content for minor/teen modes
- PIN-locked parental controls with 310k-iteration PBKDF2 hashing
- Zero network calls on safety toggle (all client-side)

## Verification
- Run interactive audits at `/audit`
- Run `scripts/generate-audit-artifacts.sh` for automated reports
