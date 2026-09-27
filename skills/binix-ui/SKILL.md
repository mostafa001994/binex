# Binix UI Skill v1.1

## Mission

This skill is the single source of truth for every Binix UI/UX design and every Next.js + React + Tailwind implementation.

Whenever generating, reviewing, refactoring, or proposing Binix UI:

1. Follow this skill before improvising.
2. Prefer existing Binix patterns and tokens.
3. Do not introduce visual values outside the system unless explicitly requested.
4. Keep all UI RTL-first, Persian-first, responsive, accessible, and Dark/Light compatible.
5. Never make Binix look like a generic SaaS template.

---

## Product

Binix is a Persian AI Business Platform with independently purchasable services.

Current services:

- AI Sales Agent
- Smart Booking
- Excel Analyzer
- Business Intelligence Modules

A user may own multiple services. Future architecture should remain compatible with a central Binix dashboard.

Stack:

- Next.js
- React
- Tailwind CSS
- Persian / RTL
- Dark + Light mode

---

## Visual Identity

Binix must feel:

- intelligent
- premium
- modern
- trustworthy
- calm
- data-driven
- AI-native
- scalable

Visual formula:

- 80% professional SaaS
- 20% AI / futuristic expression

Rule:

> AI must be visible, but never noisy.

---

## Typography

### UI font

Use **Vazir** for all normal interface text:

- body
- labels
- forms
- buttons
- navigation
- table cells
- captions
- system messages
- metrics

### Display font

Use **Morabba** only for major titles:

- marketing hero titles
- page titles
- section titles
- major product headings

Do not use Morabba for dense UI text.

Semantic classes should be used:

- `font-ui`
- `font-display`

Never hard-code font-family repeatedly inside components.

---

## Brand Colors

```css
--binix-950: #020817;
--binix-900: #06111F;
--binix-850: #081727;
--binix-800: #0B1D31;
--binix-700: #123B68;
--binix-600: #075FD8;
--binix-500: #078BFF;
--binix-400: #12B8FF;
--binix-cyan: #00D5E8;
--binix-teal: #00C6BD;
```

Primary gradient:

```css
linear-gradient(135deg, #078BFF 0%, #00D5E8 55%, #00C6BD 100%)
```

Use gradient only for:

- primary CTA
- AI actions
- hero accents
- selected premium states
- progress highlights

---

## Theme Tokens

All colors in application code must use semantic tokens.

Never write:

```tsx
className="bg-[#06111F] text-[#F5F9FF]"
```

Use:

```tsx
className="bg-surface text-foreground"
```

### Light

```css
--background: #F6F9FC;
--surface: #FFFFFF;
--surface-muted: #F8FAFC;
--surface-raised: #EFF4F9;
--surface-hover: #F1F6FA;

--foreground: #071426;
--foreground-muted: #53657B;
--foreground-subtle: #7B8B9E;
--foreground-disabled: #A7B0BC;

--border: rgba(15, 36, 60, 0.11);
--border-subtle: rgba(15, 36, 60, 0.06);
--border-strong: rgba(15, 36, 60, 0.18);

--primary: #067BE8;
--primary-hover: #056DD0;
--accent: #00ADB9;
```

### Dark

```css
--background: #020817;
--surface: #06111F;
--surface-muted: #081727;
--surface-raised: #0B1D31;
--surface-hover: #0D2239;

--foreground: #F5F9FF;
--foreground-muted: #A7B5C8;
--foreground-subtle: #708197;
--foreground-disabled: #4D5C70;

--border: rgba(148, 183, 220, 0.16);
--border-subtle: rgba(148, 183, 220, 0.10);
--border-strong: rgba(148, 183, 220, 0.28);

--primary: #078BFF;
--primary-hover: #159AFF;
--accent: #00D5E8;
```

---

## Semantic Colors

```css
--success: #22C984;
--warning: #F6B73C;
--error: #F05B67;
--info: #3A9DFF;
```

Never use semantic colors decoratively.

---

## Service Accents

```css
--service-sales: #8B6CFF;
--service-booking: #2F8FFF;
--service-excel: #00C6BD;
--service-bi: #6366F1;
```

Service accent may affect:

- icon
- badge
- header accent
- selected state
- chart highlight

It must not recolor an entire screen.

---

## Spacing

Use a 4px grid only.

Allowed common spacing:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96
```

Avoid arbitrary spacing unless required by a specific visual calculation.

---

## Radius

```text
Control: 10px
Small card: 12px
Card: 14px
Dashboard card: 16px
Modal: 18px
Marketing container: 24px
Full: 999px
```

Use semantic radius utilities:

- `rounded-control`
- `rounded-card`
- `rounded-panel`

---

## Effects

Glow is allowed only for:

- AI action
- hero
- active premium state
- AI processing
- assistant
- important visual highlight

Do not apply glow to every card.

Glass is limited to:

- navbar
- floating toolbar
- AI assistant
- overlay

---

## Layout

Default:

- RTL
- desktop content padding: 32px
- laptop: 24px
- tablet: 20px
- mobile: 16px

Marketing:

- max-width 1280–1440px
- 12-column grid

Dashboard:

- full width with meaningful max-content constraints
- 12-column grid
- 16–20px gaps

---

## Components

Before creating a new component, check whether one of these can be reused.

### Core

- Button
- Input
- Select
- Textarea
- Checkbox
- Switch
- Card
- Badge
- Modal
- Toast
- Tabs
- Tooltip
- DropdownMenu
- DataTable
- Pagination
- Skeleton

### Binix-specific

- AIAction
- AIProcessing
- AIAssistant
- ServiceCard
- ServiceHeader
- MetricCard
- ChartCard
- UploadZone
- EmptyState

---

## Button Contract

Allowed variants:

```text
primary
secondary
ghost
danger
ai
```

Allowed sizes:

```text
sm
md
lg
xl
```

Usage:

```tsx
<Button variant="ai" size="lg">
  تحلیل هوشمند
</Button>
```

Never create ad-hoc styles like:

```tsx
<Button blue rounded glow big />
```

---

## Form Contract

Default heights:

```text
md = 44px
lg = 48px
```

Every form control must support:

- default
- hover
- focus
- filled
- disabled
- error
- loading when applicable

Focus ring must remain visible.

---

## Cards

Base card:

- semantic surface
- subtle border
- 14px radius
- 20–24px padding

Interactive card:

- slightly stronger border on hover
- max `translateY(-1px)`

AI card:

- subtle accent
- controlled glow only when meaningful

---

## Data UI

Metric hierarchy:

```text
Label
Value
Delta
Context
```

Tables should support where needed:

- sort
- filter
- search
- pagination
- selection
- loading
- empty state
- error state
- sticky header

Charts:

- use blue / cyan / teal / indigo
- use red / green only semantically
- avoid unnecessary 3D
- keep gridlines subtle
- keep legends simple

---

## AI UX

AI actions must state what they do.

Bad:

```text
اجرا
```

Good:

```text
تحلیل فروش
```

Better when useful:

```text
تحلیل فروش با Binix AI
```

Long AI tasks should expose useful progress instead of showing only an indefinite spinner.

Preferred AI flow:

```text
Input
→ AI Processing
→ Understandable Output
→ Suggested Action
```

---

## RTL Rules

Root UI is RTL.

Potential LTR exceptions:

- phone
- email
- URL
- code
- file path
- IDs
- selected numeric data
- selected charts

Directional icons must mirror correctly.

---

## Motion

Use restrained motion.

```text
fast: 120ms
default: 180ms
slow: 260ms
hero: 400–600ms
```

Preferred easing:

```css
cubic-bezier(.2,.8,.2,1)
```

Avoid:

- heavy bounce
- excessive scale
- looping decorative animations
- aggressive glow pulses

---

## Accessibility

Target WCAG AA.

Always preserve:

- keyboard interaction
- visible focus
- readable contrast
- labels
- non-color-only state indicators
- minimum 40×40 touch targets
- preferred 44×44

---

## Copy

Tone:

- concise
- professional
- clear
- intelligent
- non-technical when possible

Prefer action-based CTA labels:

- شروع تحلیل
- اتصال حساب
- ایجاد فروشنده هوشمند
- تنظیم نوبت‌دهی
- مشاهده گزارش
- ارتقای سرویس

Avoid vague CTA labels unless context is unambiguous.

---

## Tailwind Enforcement Rules

### MUST

- use semantic tokens
- use reusable components
- use variant APIs
- support light and dark themes
- use RTL-safe spacing/alignment
- use responsive layouts
- use `font-ui` and `font-display`
- keep styling co-located with component intent, not arbitrary brand values

### MUST NOT

- hard-code hex colors in JSX/TSX
- introduce random shadows
- introduce random radii
- use arbitrary spacing repeatedly
- create duplicate UI components
- use inline `style` for normal visual styling
- use emoji as the primary dashboard icon system
- use glow on ordinary cards
- use a generic copied SaaS visual language

### Exception

Hard-coded values are allowed only when:

1. the value is calculated dynamically,
2. a third-party chart library requires it,
3. the value represents user-provided data,
4. the design system explicitly lacks a needed token.

When an exception is introduced, prefer adding a reusable token if the value will recur.

---

## Component Implementation Rule

When generating a new component:

1. identify existing primitive
2. use semantic tokens
3. define variants
4. include RTL behavior
5. include responsive behavior
6. include dark/light compatibility
7. include accessibility states
8. avoid local one-off design values

---

## Review Checklist

Before delivering any Binix UI or code, verify:

- [ ] RTL-native
- [ ] Vazir used for UI/body
- [ ] Morabba used for major titles
- [ ] semantic tokens used
- [ ] dark mode works
- [ ] light mode works
- [ ] reusable components used
- [ ] no unnecessary hard-coded colors
- [ ] no uncontrolled glow
- [ ] responsive
- [ ] focus states preserved
- [ ] AI actions visually distinct
- [ ] service styling remains inside Binix family
- [ ] design does not look like a generic template
- [ ] no unnecessary component duplication

If several checks fail, revise before delivery.

---

## Default Generation Behavior

If the user asks for a new Binix screen without specifying visual details:

- apply this skill automatically
- do not ask them to repeat brand colors
- do not ask them to repeat font choices
- default to a polished Binix-native solution
- use Dark-first presentation while keeping Light Mode support
- use Vazir for all normal UI and Morabba for major titles
- favor clean professional composition with controlled AI glow
- create reusable React + Tailwind structures when code is requested


## Theme Scope Decision

Binix theme behavior is intentionally split by surface:

- Marketing website and public service landing pages are **Dark-only by design**. Their dark visual signature is part of the brand expression.
- Auth and application/dashboard surfaces support **Dark + Light mode**.
- Do not force public marketing pages into Light Mode unless the product direction explicitly changes.
- The green live indicator beside the Binix logo is a protected brand detail and must not be removed or restyled unless the user explicitly asks.


---

# Dynamic Style & Reusability Contract

These rules are mandatory for all new Binix UI and refactors.

## Single Source of Truth
Service identity, accent colors, icon identity, availability, links, billing labels, and feature lists must originate from `src/constants/services-config.ts`.

## Dynamic Service Styling
Wrap service pages/components in `ServiceTheme`. Consume semantic classes such as:
`text-service-accent`, `bg-service-accent/10`, `border-service-accent/20`, `from-service-accent`, `to-service-accent-secondary`.

Do not manually pass hex colors to every child component.

## Semantic Marketing Styling
Prefer `bg-marketing-background`, `bg-marketing-surface`, `text-marketing-text`, `text-marketing-text-muted`, `text-marketing-text-subtle`, and `border-marketing-border`.

## Reusable Components
Before implementing local card/heading/feature markup, check:
`MarketingCard`, `SectionHeading`, `ServiceFeatureCard`, `ServiceCTA`, `ServiceTheme`, `ServiceIcon`.

## Variant-driven styling
When a reusable component requires multiple appearances, use CVA/variants rather than repeating large conditional class lists.

## Exceptions
Hard-coded values are acceptable for data visualizations, third-party library configs, unique illustrations/canvas art, user-generated colors, and fixed brand artwork.


## Service Page Template

All standard new service landing pages should use:

- `ServicePageShell`
- `ServiceHero`
- `ServiceFeatureGrid`
- `ServiceCTA`

Unique product demos may remain custom children/visual slots, but page chrome, typography, accent behavior, spacing, and CTA styling should not be reimplemented locally.
