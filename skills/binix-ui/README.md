# Binix UI Skill Package

Files:

- `SKILL.md` — primary instruction file for AI/design/code generation
- `binix-tokens.css` — Tailwind v4-ready semantic theme tokens
- `CODE_CONTRACT.md` — implementation constraints for React/Tailwind
- `example-button.tsx` — example of variant-driven Binix component architecture

## Recommended project placement

```text
your-project/
├─ skills/
│  └─ binix-ui/
│     └─ SKILL.md
├─ src/
│  ├─ app/
│  ├─ components/
│  │  ├─ ui/
│  │  └─ binix/
│  └─ styles/
│     └─ binix-tokens.css
```

Import `binix-tokens.css` from the main global stylesheet.

Font files are deliberately not included. Configure your own licensed/local Vazir and Morabba font files separately.
