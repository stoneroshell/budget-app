# Site design practices

**App name:** Guap.

General visual and interaction guidelines inspired by [Liveblocks](https://liveblocks.io/?ref=godly): dark charcoal base with vivid, saturated color highlights for data and emphasis.

---

## 1. Visual style

- **Base theme:** Dark charcoal. Backgrounds and surfaces are neutral, low-chroma darks so content and data stand out.
- **Accent strategy:** Use vivid, saturated colors sparingly—for data, status, categories, and key CTAs. Avoid tinting large areas; keep accents as highlights, labels, and indicators.
- **Contrast:** Ensure text and interactive elements meet WCAG contrast on the charcoal base. Use white or near-white for primary text, muted gray for secondary.

---

## 2. Color palette

### Charcoal (base)

Use for backgrounds, cards, and borders. Define in your CSS/Tailwind as needed.

| Role            | Example hex   | Use |
|-----------------|---------------|-----|
| Page background | `#0F0F0F`–`#141414` | Main canvas |
| Surface / card  | `#1A1A1A`–`#1E1E1E` | Cards, modals, panels |
| Elevated        | `#252525`–`#2A2A2A` | Dropdowns, popovers |
| Border / divide | `#2E2E2E`–`#333333` | Subtle separation |
| Muted text      | `#737373`–`#A3A3A3` | Secondary copy, captions |

### Accent (data & highlights)

Primary sources of non-charcoal color. Use for data series, status, tags, and focused UI.

| Name     | Hex       | Suggested use |
|----------|-----------|----------------|
| Violet   | `#8B5CF6` | Primary accent, links, premium/feature |
| Cyan     | `#06B6D4` | Info, secondary data, “live”/realtime |
| Amber    | `#F59E0B` | Warnings, attention, highlights |
| Rose     | `#F43F5E` | Errors, destructive, alerts |
| Emerald  | `#10B981` | Success, positive values, confirmations |
| Blue     | `#3B82F6` | Neutral actions, secondary CTAs |

- **Data viz / tables:** Assign one accent per series or category; keep palette consistent across views.
- **Status:** Prefer emerald = success, amber = warning, rose = error, blue/cyan = info.
- **One primary accent:** Choose one (e.g. violet) for main CTAs and key interactive emphasis; use others for supporting roles.

### Needs / Wants (category themes)

Official colors for budget categories. Use consistently so users instantly recognize needs vs wants.

| Category | Official hex   | Use |
|----------|----------------|-----|
| **Needs**  | `#06B6D4` (cyan)  | Needs category labels, indicators, and **all numbers** that represent needs (amounts, totals, percentages). |
| **Wants**  | `#F59E0B` (amber) | Wants category labels, indicators, and **all numbers** that represent wants (amounts, totals, percentages). |

**Secondary (subtle) variants** — Less saturated, for backgrounds, borders, or when the primary would be too strong:

| Name              | Hex       | Use |
|-------------------|-----------|-----|
| **needs-secondary**  | `#0E7490` | Soft needs tint: subtle backgrounds, borders, or secondary needs UI. Same hue as needs, lower saturation. |
| **wants-secondary**  | `#B45309` | Soft wants tint: subtle backgrounds, borders, or secondary wants UI. Same hue as wants, lower saturation. |

- **Numbers:** Any value that reflects a needs total, needs spent, needs remaining, or needs percentage should be rendered in the needs color (`#06B6D4`). Likewise, any value for wants should use the wants color (`#F59E0B`). Apply to tables, cards, summaries, and charts.
- **When to use secondary:** Use needs-secondary / wants-secondary for large or low-emphasis areas (e.g. category row backgrounds, left borders, hover states) so the primary color stays reserved for the main numbers and labels.

---

## 3. Typography

- **Primary font:** Inter for UI and body text. Use a reliable fallback stack (e.g. `Inter, system-ui, sans-serif`).
- **Display font:** Gothic Modern (`gothic_modern.woff2`) for site titling. Use for the app name **Guap** (login heading, header logo) and other prominent display headings where a distinct title treatment is desired. Apply via the `font-display` utility or `fontFamily.display` in Tailwind.
- **Text alignment:** Prefer center-aligned text over left-aligned for headings, cards, and primary content where it improves balance and focus.
- **Headings:** Clear hierarchy (e.g. one h1 per page). Slightly tighter letter-spacing on large display type.
- **Body:** Comfortable line-height (1.5–1.6). Use muted gray for secondary text.
- **Code / data:** Monospace for code and numeric data; consider a dedicated mono font. Keep code blocks on a darker surface with a subtle border.
- **Scale:** Use a consistent scale (e.g. 0.75rem → 1rem → 1.25rem → 1.5rem → 2rem+) for rhythm.

---

## 4. Layout & spacing

- **Sections:** Generous vertical spacing between major sections (e.g. 4–6rem) so the page breathes.
- **Containers:** Max-width content area (e.g. 1200–1280px) with horizontal padding; center main content.
- **Cards / feature blocks:** Consistent padding (e.g. 1.5rem–2rem), subtle border or elevation so they read as “surfaces” on the charcoal background.
- **Grids:** Use grids for feature lists, dashboards, and data; keep gaps even (e.g. 1.5rem–2rem).

---

## 5. Components & patterns

- **Buttons**
  - Primary: Use the chosen primary accent (e.g. violet) with sufficient contrast; white or light text.
  - Secondary: Outline or subtle fill on charcoal; hover slightly brighter.
  - Destructive: Rose accent; reserve for delete/danger.
- **Cards**
  - Dark surface, subtle border or soft shadow. Optional small accent (left border or icon) for category/status.
- **Code blocks**
  - Dark background, monospace, rounded corners. Use one accent for syntax or key tokens if desired; avoid full rainbow.
- **Badges / tags**
  - Small, pill-shaped. Background = accent at low opacity or solid accent with contrasting text.
- **Data display**
  - Numbers and key metrics: consider bold + accent color for positive/negative or category. **Needs** amounts use needs color (`#06B6D4`); **wants** amounts use wants color (`#F59E0B`).
  - Tables: Zebra or alternating row tint at very low opacity; accent for headers or key columns.
- **Alerts / banners**
  - Success: emerald tint; warning: amber; error: rose; info: blue or cyan. Icon + short copy.

---

## 6. Motion & feedback

- **Transitions:** Short (150–300ms) for hover, focus, and toggle states.
- **Loading:** Subtle skeleton or spinner; prefer accent color for progress/spinner.
- **Micro-interactions:** Light scale or brightness change on buttons/cards on hover; keep motion purposeful, not decorative.

---

## 7. Accessibility

- **Contrast:** Check text (and icon) contrast on both charcoal and accent backgrounds; add borders or background tweaks if needed.
- **Focus:** Visible focus ring (e.g. 2px outline in primary accent or white) for keyboard users.
- **Color:** Don’t rely on color alone for status or data; pair with icons or labels.

---

## 8. Implementation notes

- **CSS variables:** Define charcoal shades and the six accents as variables (e.g. `--color-charcoal-bg`, `--color-accent-violet`) for theming and consistency.
- **Tailwind:** Map the palette to theme colors (e.g. `charcoal-900/800/700`, `accent-violet`, `accent-cyan`) and use semantic names (e.g. `success`, `warning`, `error`) that map to emerald, amber, rose. Expose **needs** (`#06B6D4`) and **wants** (`#F59E0B`) as semantic colors (e.g. `needs`, `wants` or `accent-needs`, `accent-wants`) for category-based numbers and labels. Expose **needs-secondary** (`#0E7490`) and **wants-secondary** (`#B45309`) for subtle backgrounds, borders, and secondary UI.
- **Dark-only:** This spec is for a dark theme; if you add a light theme later, define a parallel palette and surface rules.
- **Branding:** Use the app name **Guap** for page titles, login screen, header, and any user-facing app titling. Render **Guap** and other display titling in the **Gothic Modern** display font (`public/fonts/gothic_modern.woff2`).

---

*Reference: [Liveblocks](https://liveblocks.io/?ref=godly) — dark base with vivid accent highlights for data and features.*
