# OASYS — Brand Reference

Source: current live site ([oasysgroupe.com](https://oasysgroupe.com)) + Phase 1 Content Handoff (Wasabie Studio, 26 Aug 2026).
Purpose: lock a color + type system for Phase 2 visual design. Colors below are extracted directly from the live site's CSS; fonts are pairing options to choose between.

---

## 1. Color — extracted from the current site

| Role (as used today) | Hex | Where it appears |
|---|---|---|
| Primary — Forest Green | `#115B44` | Nav bar, primary buttons ("Rejoignez-Nous"), section labels (H4 eyebrows), logo wordmark |
| Accent — Bright Green | `#24B242` | Logo accent dot, hero H1 highlight color |
| Ink / Dark Navy | `#202135` | Occasional subheadings, darker text on light sections |
| Body text | `#333333` | Paragraph copy, service/sector card headings |
| Secondary text | `#666666` | Muted/support copy |
| Tertiary text | `#8D8D8D` | Placeholder-level text |
| Surface — off-white | `#FAF9FB` | Alternating section backgrounds |
| Surface — white | `#FFFFFF` | Base background |
| Ink — black | `#000000` | High-contrast text, icon fills |

**Read on it:** the green is the whole identity — it's a credible, institutional forest green (not a bright "tech" green), which fits a Dakar-based development-consulting firm working with governments and NGOs. Recommend keeping `#115B44` as the one non-negotiable brand color. `#24B242` is a legitimate secondary accent (CTAs, highlights, icons) but reads a little more "startup" — use it sparingly rather than as a second primary. Drop `#202135` unless a section genuinely needs a dark navy alternative to the green — right now it's used inconsistently.

**Proposed system for the redesign:**

- **Primary:** `#115B44` (Forest Green) — nav, primary buttons, key headings, active states
- **Accent:** `#24B242` (Signal Green) — small highlights, icons, hover/active accents only — never large fills
- **Ink:** `#1B1B1B` (near-black, warmer than pure `#000`) — body headings
- **Body:** `#3A3A3A` — paragraph text
- **Muted:** `#6B6B6B` — captions, meta text (dates, labels)
- **Surface tint:** `#F7F8F5` — alternating section background (slightly warmer than the current `#FAF9FB`, pairs better with forest green)
- **Base:** `#FFFFFF`
- **Border/divider:** `#E3E5E1`

---

## 2. Typography — LOCKED: Source Serif 4 + Inter

OASYS reads as **formal, credible, institutional** — a consulting firm pitching governments, NGOs, and foundations. The system is a serif/sans split: serif for headlines and section titles (gravitas), clean sans for body and UI (readability at small sizes).

**Bilingual (FR + EN):** the site is fully bilingual with a language switcher, so both faces must carry the full French accent set (é è ê ë à â ç î ï ô û ù œ « » and guillemets). Both chosen fonts cover Latin Extended and are Google Fonts, so FR renders cleanly with no fallback substitution.

### ✅ Headings — Source Serif 4 (serif)
A contemporary, authoritative serif — less "editorial-magazine" than Playfair, holds up at both hero size and small card titles. Full Latin Extended (FR-safe).
- Weights to load: 400 (Regular), 600 (SemiBold), 700 (Bold)

### ✅ Body / UI — Inter (sans-serif)
Clean, neutral, excellent small-size readability; the de facto standard for institutional/professional sites. Full FR accent support.
- Weights to load: 400 (Regular), 500 (Medium), 600 (SemiBold)

**Why this pairing:** feels like a modern international-development / policy consultancy (World Bank / UNDP-adjacent) rather than a corporate template — the right register for a firm pitching Gates Foundation / Gavi / ministries. Cheap to implement, both on Google Fonts, both fully bilingual.

**Google Fonts embed:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
```

**CSS variables:**
```css
:root {
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-sans: "Inter", "Helvetica Neue", Arial, sans-serif;
}
```

### Type scale (starting point for Phase 2)
| Use | Font | Size / Weight |
|---|---|---|
| Hero H1 | Source Serif 4 | 56px / 700 |
| Section H2 | Source Serif 4 | 36px / 600 |
| Card / sub H3 | Source Serif 4 | 22px / 600 |
| Eyebrow / label | Inter | 13px / 600, letter-spacing 0.08em, uppercase |
| Body | Inter | 17px / 400, line-height 1.6 |
| Small / meta | Inter | 14px / 500 |
| Button | Inter | 15px / 600 |

> French runs ~15–20% longer than English — leave headline containers and buttons room to grow so FR strings don't wrap awkwardly or clip.

---

## 3. Notes for Phase 2

- Keep the pill-shaped buttons (`border-radius: 800px` on the live site) — it's a small consistent brand detail worth carrying forward.
- Logo lockup (green wordmark + accent dot) can stay as-is; no rebrand requested in the content handoff.
- **Bilingual FR + EN confirmed** — both languages ship with a switcher. Build every component with flexible text containers (FR runs longer); keep the type system (above) identical across both languages for a consistent voice.
