# Binix UI Code Contract

Use this file as an implementation contract when generating Next.js + React + Tailwind code.

## Required conventions

### 1. Semantic tokens only

Preferred:

```tsx
<section className="bg-background text-foreground">
  <div className="border border-border bg-surface rounded-card">
    ...
  </div>
</section>
```

Avoid:

```tsx
<section className="bg-[#020817] text-[#F5F9FF]">
```

### 2. Typography

```tsx
<h1 className="font-display text-4xl font-bold">
  عنوان صفحه
</h1>

<p className="font-ui text-base text-foreground-muted">
  توضیحات رابط
</p>
```

### 3. RTL-safe utilities

Prefer logical layout behavior.

Review:

- icon placement
- chevrons
- previous/next
- margins around icons
- table alignment
- dropdown alignment

### 4. Components over repeated markup

If the same visual block appears 2–3 times, consider extracting it into a reusable component.

### 5. Variant-driven APIs

Preferred:

```tsx
<Button variant="primary" size="md" />
<Button variant="ai" size="lg" />
```

Do not create prop APIs based on raw visual adjectives.

### 6. Theme compatibility

Never implement a component that only works on dark mode unless it is explicitly a dark-only marketing visual.

### 7. AI affordances

AI controls should visibly differ from ordinary actions but remain restrained.

### 8. No UI noise

Do not stack:

- blur
- glass
- glow
- gradient
- shadow
- border

all on the same element without a strong reason.

## Definition of Done

Before code is considered finished:

- RTL works
- mobile works
- dark works
- light works
- focus works
- disabled state works
- loading state exists where needed
- semantic classes are used
- no unnecessary hard-coded brand values remain
