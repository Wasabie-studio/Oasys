# OASYS Website Redesign — Phase 2 (Visual Design)

Working files for the OASYS Groupe homepage redesign (Wasabie Studio).
Client: OASYS — consulting & technical assistance for development projects, Dakar, Senegal.

## Contents

| File | What it is |
|---|---|
| `oasys-home.html` | The homepage mockup/prototype. Single self-contained file (all CSS/JS inline, images embedded as data URIs). Open directly in a browser. |
| `brand.md` | Brand system: colour palette (extracted from the live site) + locked typography pairing. |
| `oasys-specimen.html` | Visual brand specimen — palette swatches + type scale shown in FR/EN. |
| `assets/` | Source images used in the hero and cards (full-res originals). |

## Brand system (see `brand.md` for detail)

- **Primary:** Forest Green `#115B44` — used as a *secondary/tertiary* accent, not the dominant colour.
- **Accent:** Signal Green `#24B242` / `#1F9E3D` — small highlights, hovers, icons only.
- **Base:** clean off-white `#F7F8F3` with white cards. **Light mode only** (no dark mode).
- **Type:** Source Serif 4 (display/headings) + Inter (body/UI). Both cover full French accents.
- **Two green sections:** the Services (areas of expertise) block and the Worldwide map. Everything else is off-white.

## Homepage structure (matches the Figma "Basic structure" + Phase 2 doc)

Hero → About teaser → Key Numbers → **Services** → **Services (alternative layout, index+preview — comparison variant)** → Sectors → Worldwide map → Results → Team → Contact → Footer.

## Notable interactions

- **Hero:** full-bleed photo, left text, frosted-glass stat card (bottom-right).
- **Services grid:** each expertise cell reveals an image on hover; card 02 ("Planning, Monitoring, Evaluation & Learning") uses a real photo that **wipes up from the bottom**.
- **Services (alt variant):** numbered index on the left; hovering an area cross-fades a large preview on the right with the wipe-up image. This is a *comparison variant* — pick this or the grid, then delete the other.
- **Sectors:** 3×3 hairline grid with big "09" header; image pops in on hover. (Open item: exploring a "spotlight grid" alternative — hover scales the tile + reveals photo, others dim.)
- **Worldwide map:** real inlined world map (256 countries grouped into Africa / Asia / Europe / Caribbean). Hovering a region (or a country) fills that region crisp light-green and dims the rest; two-way synced with the region list.
- **Bilingual FR/EN toggle** in the nav (swaps content live).

## Open items / next steps

- Real OASYS photography to replace the remaining placeholder image areas (hero, About, focus tile, results, team, most sector/expertise cells).
- Real figures for the Key Numbers bar (marked `TBC`): missions completed, countries, network size.
- Decide Services layout: **grid** vs **index+preview** variant (remove the unused one).
- Decide Sectors treatment (current hover-pop grid vs spotlight-grid alternative).
- Testimonials, Partners logos, and News content still to be finalised (see Phase 1 content handoff).
- Real OASYS logo (green ISO-9001 badge) to replace the text wordmark.

## Tech notes

- No build step, no dependencies. `oasys-home.html` is ~2.2 MB because the hero + card images are embedded as base64 data URIs (so it renders anywhere, including sandboxed artifact hosts). For production, swap the data URIs back to real `<img>`/`background-image` file references from `assets/` and add responsive `srcset`.
- Fonts load from Google Fonts.
- Motion is plain JS + CSS (IntersectionObserver reveals, count-ups, hover states), all with a `prefers-reduced-motion` fallback.
