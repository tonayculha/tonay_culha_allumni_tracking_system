# DESIGN.md — Alumni Hub Design System Specification

> **AI-Ready Specification Format**: Structured following the [`VoltAgent/awesome-design-md`](https://github.com/VoltAgent/awesome-design-md) 9-section canonical standard so human engineers and AI coding assistants can build pixel-consistent, WCAG-compliant interfaces across every Alumni Hub view (`backend/src/views/*.html` and `backend/public/css/style.css`).
>
> **Related Documentation**:
> - Brand identity, voice, tone, and user personas: [brand.md](./brand.md)
> - Relational schema & persistence specification: [ddd.md](./ddd.md)
> - System overview, routes, and deployment guide: [README.md](./README.md)

---

## Table of Contents

1. [Visual Theme & Atmosphere](#1-visual-theme--atmosphere)
2. [Color Palette & Roles](#2-color-palette--roles)
   - [2.1 Surface & Canvas Tokens](#21-surface--canvas-tokens)
   - [2.2 Brand Primary & Secondary Tokens](#22-brand-primary--secondary-tokens)
   - [2.3 Text Hierarchy Tokens](#23-text-hierarchy-tokens)
   - [2.4 Border & Focus Tokens](#24-border--focus-tokens)
   - [2.5 Semantic State & Domain Role Tokens](#25-semantic-state--domain-role-tokens)
   - [2.6 WCAG 2.1 AA / AAA Contrast Rules & Verification Matrix](#26-wcag-21-aa--aaa-contrast-rules--verification-matrix)
3. [Typography Rules](#3-typography-rules)
4. [Component Stylings](#4-component-stylings)
   - [4.1 Navigation Bar (`<header>`)](#41-navigation-bar-header)
   - [4.2 Buttons](#42-buttons)
   - [4.3 Cards & Stat Tiles](#43-cards--stat-tiles)
   - [4.4 Forms, Inputs & Validation States](#44-forms-inputs--validation-states)
   - [4.5 Data Tables](#45-data-tables)
   - [4.6 Badges, Modals, Toasts & Empty States](#46-badges-modals-toasts--empty-states)
5. [Layout Principles](#5-layout-principles)
6. [Depth & Elevation Systems](#6-depth--elevation-systems)
7. [Do's and Don'ts](#7-dos-and-donts)
8. [Responsive Behavior](#8-responsive-behavior)
9. [Agent Prompt Guide & Quick Reference](#9-agent-prompt-guide--quick-reference)

---

## 1. Visual Theme & Atmosphere

### Creative North Star: *"Collegiate Obsidian"*

Alumni Hub embodies **institutional clarity meets modern engineering precision**. Rather than generic flat dark templates or overly playful consumer gradients, the interface is anchored in deep midnight-ink surfaces (`#0B1120`) paired with layered obsidian cards (`#111827`), crisp structural hairlines (`#334155`), authoritative **Collegiate Cobalt** primary actions (`#2563EB`), and restrained **Heritage Gold** highlights (`#F59E0B` / `#FBBF24`) evoking academic tradition and alumni distinction.

### Aesthetic Guardrails

- **Calm Information Density**: Students scanning 20 job postings and recruiters auditing 40 applications need visual breathing room, crisp metadata alignment, and strong typographic contrast—never walls of neon glow or cluttered box shadows.
- **Luminance-Driven Hierarchy**: Depth is communicated first through stepped surface lightness (`#0B1120` → `#111827` → `#162033` → `#1E293B`) and crisp `1px` borders, reinforced sparingly by soft dark elevation shadows on modals and floating elements.
- **Zero-Dependency Runtime Discipline**: Because `backend/src/app.js` enforces strict Helmet Content Security Policy (`defaultSrc: ["'self'"]`, `styleSrc: ["'self'", "'unsafe-inline'"]`), all styling, typography fallbacks, and inline SVG iconography must work cleanly offline inside air-gapped Docker containers with zero blocked CDN requests.
- **Default Mode**: Dark mode (`Collegiate Obsidian`) is the canonical production theme across all MVC views.

---

## 2. Color Palette & Roles

Every color token below defines a strict functional role. Never apply a decorative hex code outside these semantic assignments.

### 2.1 Surface & Canvas Tokens

| CSS Variable | Token Name | HEX | HSL | Functional Role |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | Midnight Ink | `#0B1120` | `hsl(223, 49%, 8%)` | Primary page background (`<body>`); never pure `#000000`. |
| `--bg-surface` | Obsidian Surface | `#111827` | `hsl(221, 39%, 11%)` | Primary container surface for cards, tables, and filter toolbars. |
| `--bg-surface-subtle` | Slate Well | `#162033` | `hsl(219, 40%, 14%)` | Table `<thead>`, form input fills, stat sub-tiles, code panels. |
| `--bg-surface-elevated` | Elevated Slate | `#1E293B` | `hsl(217, 33%, 17%)` | Modals, toasts, dropdown menus, table row hover states. |
| `--bg-navbar` | Translucent Ink | `rgba(11, 17, 32, 0.85)` | `hsla(223, 49%, 8%, 0.85)` | Sticky top navigation with `backdrop-filter: blur(12px)`. |
| `--bg-scrim` | Modal Scrim | `rgba(4, 7, 15, 0.78)` | `hsla(224, 58%, 4%, 0.78)` | Full-viewport overlay behind active modals. |

### 2.2 Brand Primary & Secondary Tokens

| CSS Variable | Token Name | HEX | HSL | Functional Role |
| :--- | :--- | :--- | :--- | :--- |
| `--color-primary` | Collegiate Cobalt | `#2563EB` | `hsl(221, 83%, 53%)` | Primary filled CTA buttons, active brand crest background. Pair strictly with `#FFFFFF` text. |
| `--color-primary-hover` | Deep Cobalt | `#1D4ED8` | `hsl(224, 76%, 48%)` | Primary button hover state. |
| `--color-primary-active` | Royal Cobalt | `#1E40AF` | `hsl(226, 71%, 40%)` | Primary button active/pressed state. |
| `--color-primary-accent` | Electric Cobalt | `#3B82F6` | `hsl(217, 91%, 60%)` | Active tab indicator bars, decorative accents, subtle icons on dark surfaces. |
| `--color-primary-text` | Sky Cobalt | `#93C5FD` | `hsl(212, 96%, 78%)` | Inline hyperlinks, eyebrow pills, and text buttons on dark surfaces. |
| `--color-primary-subtle` | Cobalt Tint | `rgba(59, 130, 246, 0.14)` | `hsla(217, 91%, 60%, 0.14)` | Eyebrow tag background, selected highlight tint. |
| `--color-secondary` | Heritage Gold | `#F59E0B` | `hsl(38, 92%, 50%)` | Prestigious secondary CTA / alumni distinction fill. Pair strictly with `--text-inverse` (`#0B1120`). |
| `--color-secondary-hover` | Burnished Gold | `#D97706` | `hsl(32, 95%, 44%)` | Secondary gold hover state. |
| `--color-secondary-light` | Crest Gold | `#FBBF24` | `hsl(43, 96%, 56%)` | Highlight icons, active alumni crest strokes, high-emphasis badges (with `#0B1120` text). |
| `--color-secondary-text` | Warm Gold Text | `#FDE68A` | `hsl(48, 97%, 77%)` | Kicker labels, gold pill text on dark surfaces. |
| `--color-secondary-subtle` | Gold Tint | `rgba(251, 191, 36, 0.14)` | `hsla(43, 96%, 56%, 0.14)` | Subtle gold badge / milestone pill fill. |

### 2.3 Text Hierarchy Tokens

| CSS Variable | Token Name | HEX | HSL | Functional Role |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` | Crisp Snow | `#F8FAFC` | `hsl(210, 40%, 98%)` | Page headings (`h1`–`h4`), KPI numbers, active nav items, high-priority labels. |
| `--text-secondary` | Silver Mist | `#CBD5E1` | `hsl(213, 27%, 84%)` | Body paragraphs, card descriptions, table cell content, form labels. |
| `--text-muted` | Slate Ash | `#94A3B8` | `hsl(215, 20%, 65%)` | Timestamps, helper hints, inactive nav links, placeholders, secondary metadata. |
| `--text-disabled` | Muted Slate | `#64748B` | `hsl(215, 16%, 47%)` | Strictly disabled controls only (exempt from AA text contrast per WCAG 1.4.3). |
| `--text-on-solid` | Pure White | `#FFFFFF` | `hsl(0, 0%, 100%)` | Foreground text on `--color-primary`, `--color-success-solid`, `--color-danger-solid`, `--color-info-solid`. |
| `--text-inverse` | Midnight Ink | `#0B1120` | `hsl(223, 49%, 8%)` | Foreground text on bright Heritage Gold (`--color-secondary` / `--color-secondary-light`). |

### 2.4 Border & Focus Tokens

| CSS Variable | Token Name | HEX | HSL | Functional Role |
| :--- | :--- | :--- | :--- | :--- |
| `--border-subtle` | Hairline Slate | `#1E293B` | `hsl(217, 33%, 17%)` | Internal table row separators, navbar bottom divider, card footers. |
| `--border-default` | Structural Slate | `#334155` | `hsl(215, 25%, 27%)` | Non-interactive card perimeters, modal frames, stat boxes. |
| `--border-interactive` | Control Slate | `#64748B` | `hsl(215, 16%, 47%)` | Form inputs, selects, textareas, secondary/outline button borders (`>= 3.0:1` WCAG 1.4.11 compliant on all surfaces). |
| `--border-focus` | Focus Ring Blue | `#60A5FA` | `hsl(213, 94%, 68%)` | Universal keyboard `:focus-visible` ring (`2px solid`, `2px` offset). |

### 2.5 Semantic State & Domain Role Tokens

Mapped directly to Alumni Hub's backend domain enums (`users.role`, `applications.status`, `announcements.category`, `announcements.priority`):

| State / Domain Role | Solid Fill (HEX / HSL) | Accent / Icon (HEX / HSL) | Dark-Surface Text (HEX / HSL) | Subtle Pill Surface | Pill Border | Domain Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Success** | `#047857` / `hsl(163, 94%, 24%)` | `#10B981` / `hsl(160, 84%, 39%)` | `#6EE7B7` / `hsl(156, 72%, 67%)` | `rgba(16, 185, 129, 0.14)` | `rgba(16, 185, 129, 0.38)` | `accepted`, `alumni`, `career`, health OK, success toast |
| **Warning** | `#B45309` / `hsl(26, 90%, 37%)` | `#F59E0B` / `hsl(38, 92%, 50%)` | `#FCD34D` / `hsl(46, 97%, 65%)` | `rgba(245, 158, 11, 0.14)` | `rgba(245, 158, 11, 0.38)` | `interview`, `faculty`, `social`, caution banner |
| **Danger / Error** | `#DC2626` / `hsl(0, 72%, 51%)` | `#EF4444` / `hsl(0, 84%, 60%)` | `#FCA5A5` / `hsl(0, 94%, 82%)` | `rgba(239, 68, 68, 0.14)` | `rgba(239, 68, 68, 0.42)` | `rejected`, `urgent`, delete buttons, `400`/`409`/`5xx` errors |
| **Info** | `#0369A1` / `hsl(201, 96%, 32%)` | `#38BDF8` / `hsl(198, 93%, 60%)` | `#7DD3FC` / `hsl(199, 95%, 74%)` | `rgba(56, 189, 248, 0.14)` | `rgba(56, 189, 248, 0.38)` | `applied`, `student`, `academic`, `normal` priority |
| **Governance (Admin)** | `#6D28D9` / `hsl(263, 70%, 50%)` | `#8B5CF6` / `hsl(258, 90%, 66%)` | `#C4B5FD` / `hsl(252, 95%, 85%)` | `rgba(139, 92, 246, 0.14)` | `rgba(139, 92, 246, 0.38)` | `admin` role badge |
| **Neutral / Low** | `#334155` / `hsl(215, 25%, 27%)` | `#94A3B8` / `hsl(215, 20%, 65%)` | `#CBD5E1` / `hsl(213, 27%, 84%)` | `rgba(148, 163, 184, 0.14)` | `rgba(148, 163, 184, 0.35)` | `low` priority, default fallback badge |

### 2.6 WCAG 2.1 AA / AAA Contrast Rules & Verification Matrix

All Alumni Hub views **MUST** enforce **WCAG 2.1 Level AA** as a hard floor and target **Level AAA** for body prose:

- **Normal Text (`< 18pt` / `< 24px`, or `< 14pt` bold)**: Minimum **4.5:1** contrast ratio (SC 1.4.3).
- **Large Text (`>= 18pt` / `24px`, or `>= 14pt` / `18.67px` bold)**: Minimum **3.0:1** contrast ratio (SC 1.4.3).
- **UI Components & Graphical Objects (input borders, outline buttons, focus rings, status icons)**: Minimum **3.0:1** contrast against adjacent surfaces (SC 1.4.11).
- **Color Independence**: Never convey application status, priority, or form errors via color alone—always combine text labels and icons (SC 1.4.1).

#### Mathematically Verified Token Pairs

| Foreground Token | Background Token | Verified Ratio | WCAG Standard Met |
| :--- | :--- | :---: | :--- |
| `--text-primary` (`#F8FAFC`) | `--bg-canvas` (`#0B1120`) | **18.00:1** | AAA (Normal & Large) |
| `--text-primary` (`#F8FAFC`) | `--bg-surface` (`#111827`) | **16.96:1** | AAA (Normal & Large) |
| `--text-primary` (`#F8FAFC`) | `--bg-surface-elevated` (`#1E293B`) | **13.98:1** | AAA (Normal & Large) |
| `--text-secondary` (`#CBD5E1`) | `--bg-canvas` (`#0B1120`) | **12.68:1** | AAA (Normal & Large) |
| `--text-secondary` (`#CBD5E1`) | `--bg-surface` (`#111827`) | **11.95:1** | AAA (Normal & Large) |
| `--text-secondary` (`#CBD5E1`) | `--bg-surface-elevated` (`#1E293B`) | **9.85:1** | AAA (Normal & Large) |
| `--text-muted` (`#94A3B8`) | `--bg-canvas` (`#0B1120`) | **7.34:1** | AAA (Normal & Large) |
| `--text-muted` (`#94A3B8`) | `--bg-surface` (`#111827`) | **6.92:1** | AA (Normal), AAA (Large) |
| `--text-muted` (`#94A3B8`) | `--bg-surface-elevated` (`#1E293B`) | **5.71:1** | AA (Normal), AAA (Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-primary` (`#2563EB`) | **5.17:1** | AA (Normal), AAA (Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-primary-hover` (`#1D4ED8`) | **6.70:1** | AA (Normal), AAA (Large) |
| `--text-inverse` (`#0B1120`) | `--color-secondary` (`#F59E0B`) | **8.77:1** | AAA (Normal & Large) |
| `--text-inverse` (`#0B1120`) | `--color-secondary-light` (`#FBBF24`) | **11.28:1** | AAA (Normal & Large) |
| `--color-primary-text` (`#93C5FD`) | `--bg-surface` (`#111827`) | **9.84:1** | AAA (Normal & Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-success-solid` (`#047857`) | **5.48:1** | AA (Normal), AAA (Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-warning-solid` (`#B45309`) | **5.02:1** | AA (Normal), AAA (Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-danger-solid` (`#DC2626`) | **4.83:1** | AA (Normal), AAA (Large) |
| `--text-on-solid` (`#FFFFFF`) | `--color-info-solid` (`#0369A1`) | **5.93:1** | AA (Normal), AAA (Large) |
| `--color-success-text` (`#6EE7B7`) | Composited Success Pill (`#112F34`) | **9.31:1** | AAA (Normal & Large) |
| `--color-warning-text` (`#FCD34D`) | Composited Warning Pill (`#312B23`) | **9.71:1** | AAA (Normal & Large) |
| `--color-danger-text` (`#FCA5A5`) | Composited Danger Pill (`#301E2B`) | **8.22:1** | AAA (Normal & Large) |
| `--color-info-text` (`#7DD3FC`) | Composited Info Pill (`#162F44`) | **8.26:1** | AAA (Normal & Large) |
| `--color-role-admin-text` (`#C4B5FD`) | Composited Admin Pill (`#222244`) | **8.24:1** | AAA (Normal & Large) |
| `--border-interactive` (`#64748B`) | `--bg-surface` (`#111827`) | **3.73:1** | AA Non-Text (SC 1.4.11) |
| `--border-interactive` (`#64748B`) | `--bg-surface-elevated` (`#1E293B`) | **3.07:1** | AA Non-Text (SC 1.4.11) |
| `--border-focus` (`#60A5FA`) | `--bg-surface` (`#111827`) | **6.98:1** | AA Non-Text (SC 1.4.11) |

---

## 3. Typography Rules

### 3.1 Font Stacks & CSP Loading Strategy

Because Express Helmet enforces `defaultSrc: ["'self'"]`, Alumni Hub uses a high-craft system geometric sans stack by default (zero external latency, zero FOUT), with optional local self-hosted WOFF2 support (`public/fonts/`) for `Plus Jakarta Sans` and `JetBrains Mono`:

```css
:root {
  --font-sans: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
```

### 3.2 Modular Typography Scale

Base root font size: `16px` (`1rem`). Never set body text smaller than `14px` (`0.875rem`).

| Token / Element | Desktop Size | Mobile Size (`< 640px`) | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `--text-display` (`Hero H1`) | `3rem` (`48px`) | `2.125rem` (`34px`) | `800` | `1.12` | `-0.03em` | Homepage hero headline only |
| `--text-h1` (`Page H1`) | `2.25rem` (`36px`) | `1.75rem` (`28px`) | `800` | `1.18` | `-0.025em` | Inner portal headings (`/users`, `/jobs`, `/applications`, `/announcements`, `/about`) |
| `--text-h2` (`Section H2`) | `1.5rem` (`24px`) | `1.35rem` (`21.6px`) | `700` | `1.28` | `-0.02em` | Major page sections, API explorer heading |
| `--text-h3` (`Card / Modal H3`) | `1.125rem` (`18px`) | `1.125rem` (`18px`) | `700` | `1.35` | `-0.015em` | Card titles, modal titles, empty state headings |
| `--text-h4` (`Subheading`) | `1rem` (`16px`) | `1rem` (`16px`) | `600` | `1.4` | `-0.01em` | Subsection labels, table card headers |
| `--text-body-lg` (`Lead Copy`) | `1.125rem` (`18px`) | `1rem` (`16px`) | `400` | `1.6` | `0em` | Hero supporting descriptions (`max-width: 62ch`) |
| `--text-body` (`Default Body`) | `0.9375rem` (`15px`) | `0.9375rem` (`15px`) | `400` | `1.6` | `0em` | Standard copy, card descriptions, table cells |
| `--text-sm` (`UI Controls`) | `0.875rem` (`14px`) | `0.875rem` (`14px`) | `500` | `1.45` | `0em` | Form labels, nav links, compact buttons, toolbar inputs |
| `--text-xs` (`Meta / Caption`) | `0.75rem` (`12px`) | `0.75rem` (`12px`) | `600` | `1.4` | `+0.02em` | Timestamps, form hints, table headers, badges |
| `--text-overline` (`Eyebrow`) | `0.75rem` (`12px`) | `0.75rem` (`12px`) | `700` | `1.2` | `+0.07em` | Uppercase section eyebrows and stat tile labels |
| `--text-mono` (`Code / Route`) | `0.84375rem` (`13.5px`) | `0.8125rem` (`13px`) | `500` | `1.5` | `0em` | API paths (`/api/jobs`), HTTP methods, UUIDs, CLI commands |

### 3.3 Typographic Precision Rules

- **Line Length**: Constrain long-form prose and hero paragraphs to `58ch`–`68ch` for optimal scan speed.
- **Tabular Numerals**: Apply `font-variant-numeric: tabular-nums;` to all `.stat-num` KPI counters, dates, durations, and numeric table columns so values align vertically and never jitter on live updates.
- **No Raw All-Caps Sentences**: Restrict `text-transform: uppercase` exclusively to short eyebrows, badge pills, stat labels, and `<th>` headers (`<= 3` words).

---

## 4. Component Stylings

### 4.1 Navigation Bar (`<header>`)

- **Structure**: Sticky top bar (`position: sticky; top: 0; z-index: 100;`), height `68px`, background `--bg-navbar`, `backdrop-filter: blur(12px)`, bottom border `1px solid var(--border-subtle)`.
- **Container**: Centered `max-width: 1200px`, horizontal padding `24px`, `display: flex; align-items: center; justify-content: space-between;`.
- **Brand Lockup**: Square `32px × 32px` crest (`AH`, `border-radius: 8px`, background `--color-primary`, crisp border `rgba(147, 197, 253, 0.35)`) + **Alumni Hub** (`18px`, weight `800`, `--text-primary`).
- **Navigation Links**: Single concise horizontal list (`Home`, `Directory`, `Opportunities`, `Applications`, `Bulletins`, `About`, `API Docs`) — gap `4px`, each link padded `8px 12px`, `border-radius: 8px`, `--text-muted` default.
  - **Hover**: Background `rgba(255, 255, 255, 0.06)`, color `--text-primary`.
  - **Active (`aria-current="page"`)**: Background `--color-primary-subtle`, color `--color-primary-text`, subtle inset border `1px solid rgba(59, 130, 246, 0.32)`.
  - **Focus**: `2px solid var(--border-focus)` with `2px` outline offset.
- **Mobile (`< 900px`)**: Collapse primary links into an accessible toggle button (`44px × 44px`, `aria-expanded`, `aria-controls`) revealing a vertical navigation drawer below `<header>`.

### 4.2 Buttons

All interactive buttons enforce minimum height `40px` (`44px` on touch devices), `border-radius: 8px`, `font-weight: 600`, `font-size: 0.9375rem`, inline-flex alignment with `8px` icon gap, and `transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease`.

| Variant | Background | Text Color | Border | Hover State | Active State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary (`.btn-primary`)** | `--color-primary` (`#2563EB`) | `--text-on-solid` (`#FFFFFF`) | `1px solid transparent` | `--color-primary-hover` (`#1D4ED8`), `translateY(-1px)` | `--color-primary-active` (`#1E40AF`), `translateY(0)` |
| **Secondary (`.btn-secondary`)** | `--bg-surface` (`#111827`) | `--text-primary` (`#F8FAFC`) | `1px solid var(--border-interactive)` (`#64748B`) | `--bg-surface-elevated` (`#1E293B`), border `--text-muted` | `--bg-surface-subtle` |
| **Accent Gold (`.btn-gold`)** | `--color-secondary` (`#F59E0B`) | `--text-inverse` (`#0B1120`) | `1px solid transparent` | `--color-secondary-light` (`#FBBF24`) | `--color-secondary-hover` (`#D97706`) |
| **Success (`.btn-success`)** | `--color-success-solid` (`#047857`) | `--text-on-solid` (`#FFFFFF`) | `1px solid transparent` | `--color-success-hover` (`#065F46`) | `#064E3B` |
| **Danger (`.btn-danger`)** | `--color-danger-solid` (`#DC2626`) | `--text-on-solid` (`#FFFFFF`) | `1px solid transparent` | `--color-danger-hover` (`#B91C1C`) | `#991B1B` |
| **Ghost / Table Action (`.btn-ghost`)** | `transparent` | `--text-secondary` (`#CBD5E1`) | `1px solid var(--border-default)` | `rgba(255, 255, 255, 0.08)`, color `--text-primary` | `rgba(255, 255, 255, 0.12)` |
| **Compact (`.btn-sm`)** | Inherits variant | Inherits variant | Inherits variant | `min-height: 34px; padding: 6px 12px; font-size: 0.8125rem; border-radius: 6px;` | Same as parent |

- **Focus-Visible (all variants)**: `outline: 2px solid var(--border-focus); outline-offset: 2px;`.
- **Disabled (all variants)**: `opacity: 0.48; cursor: not-allowed; pointer-events: none;`.

### 4.3 Cards & Stat Tiles

- **Standard Card (`.card`, `.job-card`, `.announcement-card`)**:
  - Background: `--bg-surface` (`#111827`)
  - Border: `1px solid var(--border-default)` (`#334155`)
  - Radius: `12px` (`--radius-lg`)
  - Padding: `24px` (`--space-6`)
  - Internal structure: Vertical flex layout (`display: flex; flex-direction: column; justify-content: space-between;`), footer separated by `1px solid var(--border-subtle)` and `padding-top: 16px`.
  - Hover (interactive cards only): Border shifts to `--border-interactive` (`#64748B`), `transform: translateY(-2px)`, shadow `--shadow-md`.
- **KPI Stat Tile (`.stat-box`)**:
  - Background: `--bg-surface`, border `1px solid var(--border-default)`, `border-radius: 12px`, `padding: 20px`.
  - `.stat-num`: `2rem` (`32px`), weight `800`, `--text-primary`, `font-variant-numeric: tabular-nums`.
  - `.stat-label`: `0.75rem` (`12px`), uppercase, weight `700`, letter-spacing `+0.06em`, `--text-muted`.

### 4.4 Forms, Inputs & Validation States

- **Field Group (`.form-group`)**: Bottom margin `20px` (`--space-5`).
- **Label (`.form-label`)**: Block element above control, `font-size: 0.875rem`, weight `600`, color `--text-secondary`, `margin-bottom: 6px`. Required asterisk rendered in `--color-danger-text`.
- **Text Input, Select & Textarea (`.form-control`, `.search-input`, `.filter-select`)**:
  - Background: `--bg-surface-subtle` (`#162033`)
  - Text: `--text-primary` (`#F8FAFC`), Placeholder: `--text-muted` (`#94A3B8`)
  - Border: `1px solid var(--border-interactive)` (`#64748B` — guarantees `3.42:1` boundary contrast on `--bg-surface-subtle` and `3.73:1` on `--bg-surface`)
  - Radius: `8px` (`--radius-md`)
  - Padding: `10px 14px` (minimum height `42px` for single-line controls)
- **Interactive States**:
  - **Focus**: `border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.25); outline: none;`
  - **Invalid (`aria-invalid="true"` or `.is-invalid`)**: `border-color: var(--color-danger-accent); box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.22);` paired with visible `.form-error` text in `--color-danger-text` (`#FCA5A5`, `0.8125rem`) linked via `aria-describedby`.
  - **Disabled**: Background `--bg-canvas`, border `--border-subtle`, color `--text-disabled`, `cursor: not-allowed`.

### 4.5 Data Tables

Used across Member Directory (`/users`), Application Tracker (`/applications`), and Architecture Specs (`/about`):

- **Wrapper (`.table-responsive`)**: `overflow-x: auto; border: 1px solid var(--border-default); border-radius: 12px; background: var(--bg-surface);`.
- **Header (`<thead> th`)**: Background `--bg-surface-subtle` (`#162033`), color `--text-secondary`, `font-size: 0.75rem`, weight `700`, uppercase, letter-spacing `+0.05em`, padding `12px 16px`, bottom border `1px solid var(--border-default)`.
- **Body Cells (`<tbody> td`)**: Color `--text-secondary` (primary entity names/titles promoted to `--text-primary` weight `600`), `font-size: 0.9375rem`, padding `14px 16px`, bottom border `1px solid var(--border-subtle)`, vertical-align `middle`.
- **Row Hover**: `tbody tr:hover { background: var(--bg-surface-elevated); }`.
- **Action Column**: Right-aligned flex group (`gap: 8px`) using `.btn-sm` buttons with accessible `aria-label` including the row subject (e.g., `aria-label="Edit Ada Lovelace"`).

### 4.6 Badges, Modals, Toasts & Empty States

- **Status & Role Badges (`.badge`)**: Pill geometry (`border-radius: 9999px`), padding `3px 10px`, `font-size: 0.75rem`, weight `700`, uppercase, letter-spacing `+0.04em`, `1px solid` semantic border + subtle tinted surface + verified AAA semantic text token (see Section 2.5).
- **Modals (`.modal-overlay`, `.modal-dialog`)**:
  - Scrim: `--bg-scrim` with `backdrop-filter: blur(4px)`.
  - Dialog: Background `--bg-surface-elevated` (`#1E293B`), border `1px solid var(--border-default)`, `border-radius: 16px`, max-width `520px` (or `640px` for detailed forms), shadow `--shadow-xl`.
  - Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape-key dismissal, focus trap inside dialog, and focus return to trigger button on close.
- **Toast Alerts (`.toast`)**: Bottom-right fixed stack (`bottom: 24px; right: 24px; z-index: 2000;`), `role="status"` / `aria-live="polite"`, background `--bg-surface-elevated`, `border: 1px solid var(--border-default)`, `4px` left semantic accent bar, auto-dismiss after `4000ms` (pauses on hover).
- **Empty States (`.empty-state`)**: Centered inside dashed `1px dashed var(--border-default)` container (`padding: 48px 24px; border-radius: 12px;`), concise heading (`--text-primary`), helper guidance (`--text-muted`), and optional reset/create CTA.

---

## 5. Layout Principles

### 5.1 Spacing Grid (4px Base / 8px Primary Rhythm)

All margins, paddings, and flex/grid gaps MUST snap to this spacing scale:

| Token | Value | Pixels | Primary Application |
| :--- | :--- | :---: | :--- |
| `--space-1` | `0.25rem` | `4px` | Micro gaps (badge icon gap, tight inline spacing) |
| `--space-2` | `0.5rem` | `8px` | Button icon gap, inline badge clusters, form label bottom margin |
| `--space-3` | `0.75rem` | `12px` | Compact toolbar gaps, table header vertical padding |
| `--space-4` | `1rem` | `16px` | Card footer padding, form grid gap, default gutter |
| `--space-5` | `1.25rem` | `20px` | Stat tile padding, form group bottom margin |
| `--space-6` | `1.5rem` | `24px` | Standard card padding, container horizontal padding, grid gap |
| `--space-8` | `2rem` | `32px` | Subsection spacing, modal body breathing room |
| `--space-12` | `3rem` | `48px` | Major page section separation, main top/bottom padding |
| `--space-16` | `4rem` | `64px` | Hero vertical padding, landing section rhythm |

### 5.2 Container & Grid Architecture

- **Primary Content Container**: `max-width: 1200px; width: 100%; margin: 0 auto; padding-inline: 24px;` (`16px` on `< 640px`).
- **Reading-Focused Container** (e.g., `/about`, error states): `max-width: 960px`.
- **12-Column Grid**: Desktop layouts follow a conceptual 12-column grid with `24px` (`--space-6`) gutters:
  - **KPI Strip**: 4 equal columns (`repeat(4, minmax(0, 1fr))` → 2 columns on tablet → 1 column on narrow mobile).
  - **Card Catalog (`/jobs`, `/announcements`)**: 3 columns on desktop (`repeat(auto-fill, minmax(340px, 1fr))`), 2 on tablet, 1 on mobile.
  - **Homepage Hero**: Asymmetric 7/5 split (`1.25fr 0.95fr`) pairing editorial headline + CTAs with a structured Network Pulse summary panel.

### 5.3 Corner Radius Scale

| Token | Value | Usage |
| :--- | :---: | :--- |
| `--radius-sm` | `6px` | Compact `.btn-sm`, code snippets, HTTP method chips |
| `--radius-md` | `8px` | Buttons, inputs, selects, nav active pills, endpoint rows |
| `--radius-lg` | `12px` | Cards, stat tiles, table containers, filter toolbars |
| `--radius-xl` | `16px` | Modals, hero preview panels |
| `--radius-full` | `9999px` | Status badges, role pills, avatars, eyebrow tags |

---

## 6. Depth & Elevation Systems

### 6.1 Layered Luminance Model

Instead of muddying dark UIs with heavy grey drop shadows, elevation combines **lighter surface values** with subtle directional shadows:

| Elevation Level | Surface Token | Shadow Token | Typical Elements |
| :--- | :--- | :--- | :--- |
| **Level 0 — Base Canvas** | `--bg-canvas` (`#0B1120`) | `none` | `<body>`, page background |
| **Level 1 — Raised Surface** | `--bg-surface` (`#111827`) | `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.35)` | Cards, stat boxes, tables, toolbars |
| **Level 2 — Interactive Hover / Sticky** | `--bg-navbar` / `--bg-surface` | `--shadow-md`: `0 8px 24px -4px rgba(0, 0, 0, 0.45)` | Hovered interactive cards, sticky navbar |
| **Level 3 — Floating Overlay** | `--bg-surface-elevated` (`#1E293B`) | `--shadow-xl`: `0 24px 48px -12px rgba(0, 0, 0, 0.65)` | Modals, toast notifications, mobile nav drawer |

### 6.2 Z-Index Hierarchy

```css
:root {
  --z-base: 0;
  --z-sticky: 100;     /* Sticky <header> navigation */
  --z-drawer: 200;     /* Mobile navigation drawer */
  --z-modal: 1000;     /* Modal scrim & dialog */
  --z-toast: 2000;     /* Live toast notifications */
}
```

---

## 7. Do's and Don'ts

### Do's

- **DO** use CSS custom properties from `:root` for every color, spacing, radius, and shadow token—never hardcode ad-hoc hex values in inline `style=""` attributes.
- **DO** preserve semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) and existing DOM IDs/hydration comments (`<!-- INITIAL_USERS_DATA -->`, `<!-- INITIAL_JOBS_DATA -->`, `<!-- INITIAL_APPLICATIONS_DATA -->`, `<!-- INITIAL_ANNOUNCEMENTS_DATA -->`).
- **DO** keep `<title>` tags compatible with automated integration test contracts (e.g., `<title>Alumni Tracking System | Home</title>`).
- **DO** pair every form input with a visible `<label for="...">` and render validation/409 errors inline inside the form as well as via toast.
- **DO** respect `prefers-reduced-motion: reduce` by disabling card hover transforms and toast slide animations.

### Don'ts

- **DON'T** put white text (`#FFFFFF`) on Heritage Gold (`#F59E0B` / `#FBBF24`)—it fails WCAG AA (`2.15:1`). Always use `--text-inverse` (`#0B1120`) on gold fills.
- **DON'T** load external Google Fonts, Font Awesome CDNs, or remote icon scripts without updating Helmet CSP in `backend/src/app.js`; use self-hosted assets, system font stacks, and clean inline SVGs.
- **DON'T** use raw pure black (`#000000`) as a page background or harsh glowing neon drop shadows on standard cards.
- **DON'T** attach inline `onclick="..."` handlers in newly redesigned views—use clean `addEventListener` bindings compatible with strict CSP (`script-src-attr` safety).
- **DON'T** rely on color alone or raw emoji alone to communicate application status, priority, or error states.

---

## 8. Responsive Behavior

### 8.1 Breakpoints (Mobile-First Min-Width Thresholds)

| Breakpoint | Viewport Width | Layout Behavior |
| :--- | :--- | :--- |
| **Base / Mobile** | `< 640px` | Single-column grids (`1fr`), full-width stacked CTA buttons, `16px` page padding, `44px × 44px` minimum touch targets, collapsed mobile nav drawer. |
| **`sm` (Large Phone)** | `>= 640px` | 2-column KPI stat strip, inline horizontal CTA button groups, `20px` page padding. |
| **`md` (Tablet)** | `>= 768px` | 2-column card grids (`/jobs`, `/announcements`), side-by-side search + filter toolbar, `24px` page padding. |
| **`lg` (Desktop)** | `>= 1024px` | Full horizontal navbar links, 4-column KPI strip, asymmetric hero split, 3-column card catalog. |
| **`xl` (Wide Desktop)** | `>= 1280px` | Centered `1200px` max-width container with generous outer canvas margins. |

### 8.2 Component Adaptation Rules

- **Tables on Mobile**: Wrap every `<table>` in `.table-responsive` (`overflow-x: auto; -webkit-overflow-scrolling: touch;`) with `min-width: 680px` so columns never crush into illegible 2-character wraps; pin primary identifiers in column 1.
- **Toolbars on Mobile**: `.toolbar-left` wraps vertically (`flex-direction: column; align-items: stretch;`), expanding `.search-input` and `.filter-select` to `width: 100%`.
- **Modals on Mobile**: Expand `.modal-dialog` to `max-width: calc(100vw - 24px)` with `max-height: 90vh; overflow-y: auto;` so long job creation forms remain scrollable on small screens.
- **Motion Sensitivity**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 9. Agent Prompt Guide & Quick Reference

### 9.1 Copy-Paste `:root` Token Sheet (`backend/public/css/style.css`)

```css
:root {
  /* Surfaces */
  --bg-canvas: #0B1120;
  --bg-surface: #111827;
  --bg-surface-subtle: #162033;
  --bg-surface-elevated: #1E293B;
  --bg-navbar: rgba(11, 17, 32, 0.85);
  --bg-scrim: rgba(4, 7, 15, 0.78);

  /* Brand Primary (Collegiate Cobalt) */
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;
  --color-primary-accent: #3B82F6;
  --color-primary-text: #93C5FD;
  --color-primary-subtle: rgba(59, 130, 246, 0.14);

  /* Brand Secondary (Heritage Gold) */
  --color-secondary: #F59E0B;
  --color-secondary-hover: #D97706;
  --color-secondary-light: #FBBF24;
  --color-secondary-text: #FDE68A;
  --color-secondary-subtle: rgba(251, 191, 36, 0.14);

  /* Text Hierarchy */
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --text-disabled: #64748B;
  --text-on-solid: #FFFFFF;
  --text-inverse: #0B1120;

  /* Borders & Focus */
  --border-subtle: #1E293B;
  --border-default: #334155;
  --border-interactive: #64748B;
  --border-focus: #60A5FA;

  /* Semantic States */
  --color-success-solid: #047857;
  --color-success-hover: #065F46;
  --color-success-accent: #10B981;
  --color-success-text: #6EE7B7;
  --color-success-subtle: rgba(16, 185, 129, 0.14);
  --color-success-border: rgba(16, 185, 129, 0.38);

  --color-warning-solid: #B45309;
  --color-warning-accent: #F59E0B;
  --color-warning-text: #FCD34D;
  --color-warning-subtle: rgba(245, 158, 11, 0.14);
  --color-warning-border: rgba(245, 158, 11, 0.38);

  --color-danger-solid: #DC2626;
  --color-danger-hover: #B91C1C;
  --color-danger-accent: #EF4444;
  --color-danger-text: #FCA5A5;
  --color-danger-subtle: rgba(239, 68, 68, 0.14);
  --color-danger-border: rgba(239, 68, 68, 0.42);

  --color-info-solid: #0369A1;
  --color-info-accent: #38BDF8;
  --color-info-text: #7DD3FC;
  --color-info-subtle: rgba(56, 189, 248, 0.14);
  --color-info-border: rgba(56, 189, 248, 0.38);

  --color-role-admin-accent: #8B5CF6;
  --color-role-admin-text: #C4B5FD;
  --color-role-admin-subtle: rgba(139, 92, 246, 0.14);
  --color-role-admin-border: rgba(139, 92, 246, 0.38);

  /* Typography */
  --font-sans: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  /* Spacing Scale (4px / 8px rhythm) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Radii & Elevation */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 8px 24px -4px rgba(0, 0, 0, 0.45);
  --shadow-xl: 0 24px 48px -12px rgba(0, 0, 0, 0.65);

  /* Z-Index */
  --z-base: 0;
  --z-sticky: 100;
  --z-drawer: 200;
  --z-modal: 1000;
  --z-toast: 2000;
}
```

### 9.2 Page-by-Page Redesign Implementation Checklist for AI Agents

When redesigning any view (`home.html`, `users.html`, `jobs.html`, `applications.html`, `announcements.html`, `about.html`, `404.html`):

1. **Brand Alignment**: Follow [brand.md](./brand.md) — use **Alumni Hub** in visible brand lockups, plain-language headlines, and Verb + Noun CTAs while preserving `<title>` test assertions.
2. **Token Discipline**: Consume only variables declared in Section 9.1; eliminate ad-hoc `style="..."` color overrides.
3. **Contract Preservation**: Retain all hydration comment placeholders (`<!-- INITIAL_*_DATA -->`), form field `name` attributes, REST endpoint URLs, and `409 Conflict` / `400 Validation` handling.
4. **WCAG Verification**: Confirm every foreground/background pair meets `>= 4.5:1` (text) and `>= 3.0:1` (interactive borders/focus rings), keyboard tab order is logical, and all modals support Escape-to-close.
5. **Regression Gate**: Run `cd backend && npm test` after every view update to guarantee 100% pass across all automated suites.
