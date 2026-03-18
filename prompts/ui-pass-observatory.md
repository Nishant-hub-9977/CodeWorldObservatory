# UI Pass — Observatory Interface

> *Operating prompt for UI implementation and design system passes.*
> *Use this prompt when adding, modifying, or extending the Observatory UI.*

---

## Design Invariants

These design invariants must be preserved in every UI pass. They are not stylistic preferences — they are UI system laws.

1. **Dark only**: Background must always be in the obsidian scale (`--surface-base`, `--surface-raised`, `--surface-overlay`). Never use light backgrounds.

2. **Signal color is sacred**: `--text-signal` (cold cyan `#00c8ff`) is reserved for live data, active states, and the most important values. Do not use it decoratively.

3. **Uncertainty is visible**: If a panel contains predicted data, it must display its confidence score. No panel hides uncertainty.

4. **No fake data**: Never add numeric values, charts, or counts that are not grounded in typed data from `lib/types/*` or `lib/data/*`. Data-free displays use explanatory text, not zeros or lorem ipsum.

5. **Monospace for data**: All hash values, identifiers, commit SHAs, and numeric data values use `var(--font-mono)` (JetBrains Mono). Never use Inter for data values.

6. **Panels use `obs-panel`**: Every distinct data section must use the `.obs-panel` base class. No raw div styling without the panel primitive.

---

## Component Design Principles

When creating a new observatory panel:

1. Start with `ObservatoryPanel` as the wrapper
2. Define the data it requires from `lib/types/*`
3. Add the mock data to `lib/data/mock-observatory-data.ts` before rendering it
4. Display data in `data-row` pairs or structured card grids
5. Always show a status indicator (status dot + label) in the panel header
6. Always show an informational note if the panel is Phase 0 / awaiting live data

---

## Typography Rules

| Content Type | Font | Size | Color Token |
|---|---|---|---|
| Section headers | Inter | `text-2xl` – `text-3xl` | `--text-primary` |
| Panel titles | Inter, semibold | `text-sm` | `--text-primary` |
| Overline labels | JetBrains Mono, uppercase | `0.6875rem` | `--text-signal` |
| Body / descriptions | Inter | `text-xs` | `--text-secondary` |
| Data values | JetBrains Mono | `0.8125rem` | `--text-primary` |
| Hash values | JetBrains Mono | `0.7rem` | `--text-tertiary` |
| Badge text | JetBrains Mono, uppercase | `0.6875rem` | per-variant |

---

## Motion Guidance

- Page entrance: `animate-fade-in` on root wrapper
- Card entrance: `animate-slide-up` with `animation-delay` staggered by index
- Hover: `transition: border-color 0.2s ease, box-shadow 0.2s ease` on panels
- Status dots: `pulse` animation (3s) on active states only
- No looping gradients, no particle effects, no CSS animations on content text

---

## Layout Rules

- Max content width: `max-w-7xl mx-auto px-6`
- Section spacing: `py-16` between major sections
- Panel grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- No full-width colored section backgrounds — use the grid overlay pattern instead

---

## Prohibited Patterns

- `text-white` or `text-black` — use design tokens
- Solid bright fills on large surfaces
- Charts that display no real data axis labels
- Animated counting numbers (fake vitality)
- "Coming soon" placeholders — use structural explanations instead
- Emoji in UI (icons must be Unicode symbols or SVG, consistent with the observatory vocabulary)
