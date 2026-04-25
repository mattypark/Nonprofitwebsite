# Axiom — Coding Agent Session Log

A running log of what's been built on the Axiom (working-name) nonprofit landing page. Intended to hand off full context to a future agent / collaborator.

---

## 1. Project summary

**Axiom** is a student-led nonprofit giving high schoolers the teams, mentorship, and platform to do real AI / CS research and publish it. Three core programs:

- **Research Teams** — 3–5 students, produce a paper / report.
- **Build Projects** — ship real apps, tools, models.
- **Publishing Platform** — the *Axiom Journal*, a mini arXiv for HS research.

Target audience: ambitious high schoolers (researchers + builders) and founding team candidates (Tech Lead, Ops Lead, Content Lead).

---

## 2. Stack

- **Single static file**: `index.html` (no framework, no build step).
- **Fonts via CDN**: Instrument Serif (display) + Geist + Geist Mono.
- **Smooth scroll**: [Lenis 1.1.14](https://lenis.darkroom.engineering/) via jsDelivr CDN (Framer "sexyscroll" equivalent).
- **Animations**: CSS keyframes + transitions, `IntersectionObserver` reveals, `requestAnimationFrame`-throttled scroll listener.
- **No JS libraries** beyond Lenis.
- **Local preview**: just open `index.html` in a browser.

---

## 3. Page structure (current, top → bottom)

1. **Announce bar** — thin blue strip, "Applications open for the Fall 2026 Research Cohort."
2. **Topbar** (sticky pill) — left: `Axiom ●` logo. Right: `Menu` dark pill with stacked-bars icon.
3. **Menu overlay** (hidden until `Menu` clicked) — fullscreen, 6 uneven panels, d.school-inspired.
4. **Hero** — centered stack. Eyebrow + the **curious card** (the centerpiece).
5. **Teams section** — "Meet the research teams" with fanned SVG-emblem cards (5 tilted dark cards).
6. **Programs** — 3 program blocks.
7. **How it works** — numbered steps.
8. **Journal preview** — mini publication list.
9. **Pin section** — scroll-triggered word swap (red → white → blue).
10. **Apply** — CTA block.
11. **FAQ** — accordion.
12. **Footer**.

---

## 4. Change log (chronological)

### v0 — initial build
- Built the gallium.ai-inspired editorial landing page.
  - White / black / blue palette. Serif display (Instrument Serif) + mono + sans.
  - Sticky nav pill, hero with left text + right visual, marquee, sections, journal list, FAQ, footer.

### v1 — fanned teams section
- Added **"Meet the research teams"** fanned-cards section (5 tilted dark cards).
- Each card has a woven SVG emblem made of 7 interlocking stroked circles rotated around a center.
- Cards use CSS custom props (`--rot`, `--dy`, `--i`) for staggered fan layout; hover lifts the card upright.

### v2 — scroll-triggered word swap (pin section)
- Implemented the gallium frames 72–104 animation in vanilla JS/CSS (no GSAP):
  - `position: sticky` card, `height: 340vh` scroll track.
  - Scroll progress 0→1 drives 3 discrete states; cycles through `More Rigorous / Collaborative / Published`.
  - Three bars at the bottom fill continuously via `--fill` CSS variable (each bar fills across its own third of the scroll).
  - Center card grows vertically across states via `[data-state="0|1|2"]` height rules.
- Added **Lenis** smooth scroll for the "sexy scroll" feel; anchor links routed through `lenis.scrollTo()`.

### v3 — section reorder + naming
- Moved the teams section to be the **second page** (right after hero).
- Renamed center card's display: `Atlas → Matthew`, `Data Science → Computer Science`, `Flagship → Founder`.

### v4 — hero visual: 2-card flipstack
- Replaced the original stacked "6 cards" hero visual with 2 tilted cards that flip through *Building / Startups / Researching / AI* via CSS keyframe animation with staggered `animation-delay`.

### v5 — Stanford d.school curious card
- Replaced the 2-card flipstack with an **interactive "I'm curious about…" card** (d.school-inspired).
  - Auto-cycles through `research / startups / positions / building / AI` every 2.4s.
  - Chevron button opens a dropdown panel listing all 5 tracks (mono numbering + italic serif).
  - Clicking a track pins it; click outside / `Esc` closes.
  - Pauses auto-cycle while open.
- **Removed** the marquee strip ("Research · Build · Publish · Collaborate · Open Source · Mentorship") and its `@keyframes scroll` CSS.

### v6 — centered hero + new menu system
- Centered the entire hero (no more left/right split).
- **Removed**: `Apply to a cohort` + `Read the journal` buttons, the `3–5 / 8 wks / 100%` stats row.
- **Replaced the top nav** (Programs / How it Works / Journal / Apply / CTA) with a minimal two-piece sticky topbar: `Axiom` pill left, `Menu` pill right.
- Built a **d.school-style 6-panel menu overlay** that opens from the `Menu` button:
  - Uneven CSS grid: `grid-template-columns: 1.35fr 0.8fr 1.05fr`, `rows: 1.1fr 0.9fr`.
  - Each panel: side vertical label, diagonal colored ribbon with sliding repeated text, large serif italic watermark, circle arrow button, big title (`<strong>About</strong> · Get to know <em>the team</em>`), sub-link row.
  - Panels: **About** (cream), **Programs** (soft blue), **Journal** (peach), **Apply** (brand blue, white text), **Community** (ink/black, white text), **Contact** (sand).
  - Staggered fade-in on open; `Close Menu ✕` pill top-right; ESC / click / sub-nav-click all close.

### v7 — curious card iterations
- Removed the lead paragraph ("Axiom gives ambitious high schoolers…").
- Removed the H1 headline ("Where young minds publish real AI research.") — the curious card is now the hero's sole centerpiece.
- Bumped the card significantly:
  - `max-width`: 540 → 640 → 760 → **880px**
  - padding: 40 → 52 → **64px** sides
  - prompt font: `38→52` → `46→68` → **`56→88px`**
  - chevron button: 46 → 58 → **72px**

### v8 — pin color cycle
- Changed the scroll-pinned color cycle from **orange → red → purple** to **red → white → blue**:
  - `#ff7b3c` → `#ff3a3a`
  - `#ff3560` → `#ffffff`
  - `#5a5cff` → `#1f46ff`
- When the card flips white (state 1), the inner emblem box inverts to black (stroke → white) so the woven logo stays visible on the white card.

---

## 5. Key files & where to look

| File | Purpose |
|---|---|
| `index.html` | The entire site. ~1100 lines. All HTML + embedded `<style>` + single `<script>` block at bottom. |
| `README.md` | Brief public-facing description of the nonprofit. |
| `session-log/README.md` | **This file.** Running context for coding agents. |

Inside `index.html`:

- **CSS**: inline `<style>` block, top of file. Organized by section: root vars → announce → topbar + menu-btn → menu overlay → hero → curious card → sections → teams → programs → journal → pin → apply → faq → footer → reveal/stagger utilities.
- **HTML**: body sections in order listed above.
- **JS** (`<script>` at end): 4 IIFEs
  1. Lenis smooth-scroll init + anchor-link hijack.
  2. Menu overlay open/close (button + ESC + outside-click + nav-link close).
  3. Curious card auto-flip + dropdown (`setIdx`, `setOpen`, auto-tick every 2.4s, pauses while open).
  4. Reveal-on-scroll via `IntersectionObserver`.
  5. Pin-section scroll state machine (progress → state 0|1|2 + continuous bar fills via `--fill`).

---

## 6. Design system (current)

**Colors** (CSS vars on `:root`)
- `--ink` `#0a0a0a` — primary text / dark bg
- `--ink-soft` `#1a1a1a`
- `--paper` `#ffffff` — primary bg
- `--paper-warm` `#f6f5f1`
- `--blue` `#1f46ff` — brand accent
- `--blue-deep` — deep blue
- `--blue-soft` `#e8edff`
- `--rule` `rgba(10,10,10,.08)`
- `--mute` `rgba(10,10,10,.55)`

**Pin section** (dark, separate palette)
- Background `#050505`
- Cycle: `#ff3a3a` red → `#ffffff` white → `#1f46ff` blue

**Menu panel colors**
- About `#fbf5e6`, Programs `#e8edff`, Journal `#f6dccb`, Apply `var(--blue)`, Community `var(--ink)`, Contact `#e4e0cc`

**Typography**
- Display: **Instrument Serif**, 400 weight, italic for emphasis, letter-spacing `-.02em`.
- Body: **Geist** (sans).
- Labels / metadata: **Geist Mono**, UPPERCASE, letter-spacing `.2em`.

**Motion**
- Core easing: `cubic-bezier(.2,.9,.2,1)` and `cubic-bezier(.7,0,.2,1)` for snappy serif-editorial feel.
- Lenis scroll: `duration 1.25s`, `expoOut`.
- Hero entrance: staggered `rise` keyframe (`eyebrow → curious`).
- Menu overlay: staggered panel fades (`.06s` per panel).

---

## 7. Known state / next up

**Done**
- Hero redesigned to be d.school-style, centered, with the curious card as the focal element.
- Menu system complete (6 panels, interactive, accessible close).
- Pin section color-corrected to brand palette (red / white / blue).

**Open / potential next steps**
- Programs / How it Works / Journal / Apply / FAQ sections still use the original v0 content — may want to refresh copy to match the new editorial tone.
- Menu panels currently link to `#about`, `#team`, `#manifesto` etc. — several of these anchors **don't yet exist** on the page. Either add those sections or re-point the links.
- No mobile-specific hero review yet after the headline + lead were removed — the single card should still center nicely on mobile but hasn't been tested.
- The `.btn`, `.hero-actions`, `.meta-row` CSS classes still exist in the stylesheet but are only partially used (`.btn` is used in the Journal + Apply sections). Safe to leave.
- Apply flow is still a simple anchor target — no form wired up.

**Feedback heuristics from the user** (carry forward)
- Wants **bold, specific** design moves, not generic "live-coded" defaults.
- References real sites (gallium.ai, Stanford d.school) — study those and match the specific aesthetic.
- Prefers things **bigger and more centered** than the default attempt.
- "Sexy scroll" = Lenis smooth scroll.
- Colors must stay in the white / blue / black / ink family (the pin cycle is the one dark-themed exception).
- When told to remove something, remove it fully — don't leave leftovers like stat rows or marquee strips.

---

## 8. Quick dev notes

- Run locally: just open `index.html` (or `python3 -m http.server` for consistent font loading).
- Search landmarks inside `index.html`:
  - `/* -------- Topbar` — sticky nav pills
  - `/* -------- Menu overlay` — 6-panel fullscreen menu
  - `/* -------- Hero` — centered stack
  - `/* -------- Curious card` — the interactive "I'm curious about…" element
  - `/* -------- Pin:` — the scroll-pinned word-swap section
- JS IIFEs at end of file are independent — safe to edit one without affecting others.
