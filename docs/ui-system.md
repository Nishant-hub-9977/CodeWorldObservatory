# UI System

> *Design system specification for CodeWorld Observatory.*
> *A premium, institutional research-instrument aesthetic with dark/light theme support.*

---

## Design Philosophy

The Observatory is not a consumer product. It is a research instrument — more akin to a scientific control panel than a web app. The design language must reflect this:

- **Restrained**: No decorative noise. Every visual element carries information.
- **Dual-theme**: Dark is the primary identity; light is an equal-quality secondary. Both use the same token system and share identical layout, spacing, and component structure.
- **Typographic**: The primary medium is structured data. Typography is the primary design tool.
- **Monospaced where it matters**: Hash values, identifiers, timestamps, and data values use monospace.
- **Institutional emphasis**: Primary emphasis uses a restrained accent channel, while informational, warning, success, and danger states remain semantically distinct and muted.

---

## Color System

### Surface Tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--background` | `#090b0f` | `#f5f7fa` | Page background |
| `--surface` | `#0f1218` | `#ffffff` | Primary panel surface |
| `--surface-elevated` | `#151a22` | `#fbfcfe` | Elevated panel/header surface |
| `--surface-hover` | `#1a202a` | `#f0f3f8` | Hover surface |
| `--surface-active` | `#202735` | `#e8edf5` | Active/pressed surface |
| `--border-subtle` | `#202632` | `#e1e7f0` | Default borders |
| `--border-muted` | `#2a3140` | `#d2dae6` | Hover/focus borders |
| `--border-strong` | `#364055` | `#bcc7d6` | Strong separators |

### Text

| Token | Dark | Light | Use |
|---|---|---|---|
| `--text-primary` | `#f3f5f8` | `#0f1722` | Headlines, labels, primary values |
| `--text-secondary` | `#c7cdd6` | `#334155` | Body text, descriptions |
| `--text-muted` | `#9099a8` | `#64748b` | Metadata, hash values, de-emphasized |
| `--text-disabled` | `#667083` | `#94a3b8` | Disabled and placeholder states |

### Semantic Accent Tokens (RGB — Tailwind opacity support)

All panel components use semantic RGB triplet tokens defined in `:root` for light mode and overridden in `.dark` for dark mode. Tailwind references them through `rgb(var(--token) / <alpha-value>)`, so semantic colors still support opacity modifiers.

| Token | Dark RGB | Light RGB | Use |
|---|---|---|---|
| `--accent` | `143 167 199` | `79 107 138` | Primary institutional emphasis |
| `--accent-strong` | `175 196 224` | `63 91 120` | Active accent text |
| `--accent-soft` | `24 32 44` | `234 240 247` | Accent-tinted fills |
| `--info` | `126 155 183` | `79 111 143` | Informational/live status |
| `--success` | `127 164 138` | `84 116 92` | Verified/safe status |
| `--warning` | `179 154 107` | `138 110 59` | Caution/pending status |
| `--danger` | `179 131 131` | `139 94 94` | Error/risk status |

### Accent System

The Observatory uses semantic status channels with restrained saturation:

- **Accent**: Primary institutional emphasis, selected controls, key navigational focus
- **Info**: Informational/live state without implying urgency
- **Warning**: Uncertainty, caution, partial evidence, pending state
- **Success**: Safe, approved, complete, verified state
- **Danger**: Critical risk, failure, rejection, high-severity caution

Use accents as text colors and border tints only. Never as solid fills on large surfaces.

---

## Typography

### Families

| Role | Family | Variable |
|---|---|---|
| Body, UI | Inter | `var(--font-inter)` |
| Code, data, hashes | JetBrains Mono | `var(--font-mono)` |

### Scale

| Class | Size | Use |
|---|---|---|
| Hero | `text-5xl` / `text-6xl` | Page title only |
| Section title | `text-2xl` / `text-3xl` | Section headers |
| Panel title | `text-sm font-semibold` | Panel headers |
| Body | `text-sm` | Descriptions |
| Overline | `text-[0.6875rem]` | Section labels, category labels |
| Data value | `text-[0.8125rem] font-mono` | Numeric values, identifiers |
| Hash | `text-[0.7rem] font-mono` | SHA hashes, UUIDs, commit SHAs |
| Badge | `text-[0.6875rem] font-mono uppercase` | Status badges |

---

## Component Vocabulary

### `obs-panel`

The base panel primitive. All observatory panels use this class.

```css
background: var(--surface-raised);
border: 1px solid var(--surface-border);
border-radius: 8px;
padding: 1.5rem;
transition: border-color 0.2s ease, box-shadow 0.2s ease;
```

On hover:
```css
border-color: rgba(0, 200, 255, 0.2);
box-shadow: 0 0 24px rgba(0, 200, 255, 0.06);
```

### `badge`

Status and type labels. Always monospace, uppercase, small.

Variants:
- `badge-signal`: cyan tint, live/active contexts
- `badge-caution`: amber tint, warning/pending
- `badge-verified`: green tint, success/approved
- `badge-risk`: red tint, error/rejected
- `badge-muted`: neutral, inactive/secondary

### `data-row`

For displaying key-value pairs within a panel.

```css
display: flex;
align-items: center;
justify-content: space-between;
padding: 0.625rem 0;
border-bottom: 1px solid rgba(255,255,255,0.04);
```

### `status-dot`

A 6px circular indicator for live status.

- `status-dot-active`: green, with box-shadow glow
- `status-dot-pending`: amber, with box-shadow glow
- `status-dot-idle`: muted gray

### `overline`

Section label above headers.

```css
font-size: 0.6875rem;
font-weight: 600;
letter-spacing: 0.12em;
text-transform: uppercase;
color: var(--text-signal);
font-family: var(--font-mono);
```

---

## Motion Principles

Motion in the Observatory is functional, not decorative:

- **`fadeIn`**: Used on page-level content entrance. Duration: 400ms, ease-in-out.
- **`slideUp`**: Used on card-level content entrance. Duration: 500ms, ease-out. Staggered with `animation-delay` for sequential reveals.
- **Hover transitions**: `border-color` and `box-shadow` transitions on panels. Duration: 200ms, ease.
- No looping animations except `pulse` on status dots (3s, muted).

---

## Grid and Layout

- **Max content width**: `max-w-7xl` (80rem)
- **Page padding**: `px-6`
- **Section spacing**: `py-16`
- **Panel grid**: 1-col mobile → 2-col tablet → 3-col desktop
- **Subtlety overlay**: Background grid of `40px × 40px` thin-line pattern at 1.5% opacity

---

## Prohibited Patterns

Patterns that violate the Observatory design system:

- Solid colored fills on large surfaces (backgrounds must stay in obsidian scale)
- Non-monospace fonts for hash values or identifiers
- Charts with no data labels
- Animated gradients or particle effects
- Colored icons without semantic purpose
- Light mode that doesn't match dark mode quality (both must feel like the same product)
- Placeholder copy ("lorem ipsum", "coming soon!")
