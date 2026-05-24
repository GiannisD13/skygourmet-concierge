# Handoff: Altitude Dining — Hero Section

## Overview
A single full-viewport hero section for a luxury private-jet catering brand. A vertical private-jet image rises through the center of a two-line headline as the user scrolls, splitting each line's words horizontally to the left and right. Dark luxury aesthetic — near-black background, cream serif type, gold accent.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior. They are **not production code to copy directly**. The task is to **recreate this hero in the target codebase's existing environment** (React, Vue, Next.js, Astro, etc.) using its established patterns, component conventions, and styling system (CSS Modules, Tailwind, styled-components, vanilla CSS, …).

The reference file is `altitude-hero.html`. Open it in a browser and scroll to see the animation. The README below captures every value, ratio, and timing you need — but the file is the ground truth if anything here is ambiguous.

## Fidelity
**High-fidelity (hifi).** Final colors, type, spacing, and motion are all settled. Recreate pixel-faithfully.

## Scope
This handoff covers **only the hero section** — one full-viewport block. The reference file also contains a tiny "Provenance" section below the hero; that section exists only to give the page scroll runway for testing the animation and should NOT be ported. Anything below `<section class="hero">…</section>` is throwaway.

---

## Layout

The hero is a single `position: relative` block that fills the viewport.

- **Height:** `100vh`, with `min-height: 720px`
- **Background:** `oklch(0.13 0.008 60)` — warm near-black
- **Overflow:** `hidden`
- **Stacking context:** `isolation: isolate`

### Children (z-index order, bottom → top)

| Layer | z-index | Role |
|---|---|---|
| `.sky` | 0 (default) | Warm radial gradient + base background |
| `.stars` | default | Pseudo-star field (multi-stop `radial-gradient` backgrounds) |
| `.grid-lines` | default | Faint horizontal "altitude tick" lines |
| `.jet-glow` | 2 | Soft warm radial glow tracking the jet |
| `.jet-stage > img.jet` | 3 | The vertical jet photo |
| `.bottom-fade` | 4 | Bottom gradient masking jet exhaust into the background |
| `.title` (h1) | 5 | Two-line headline (sits **in front of** the jet) |
| `.side.left`, `.side.right` | 6 | Vertical coordinate strips at the screen edges |
| `.top-fade` | 8 | Top gradient |

**Critical:** the jet (z:3) sits BEHIND the title (z:5). As the jet rises, the title's words slide outward, and the jet becomes visible through the gap they vacate. That layering IS the effect.

---

## Components

### 1. Background

```css
.sky {
  background:
    radial-gradient(60% 50% at 50% 45%, oklch(0.19 0.018 70) 0%, transparent 70%),
    radial-gradient(120% 70% at 50% 110%, oklch(0.16 0.012 60) 0%, transparent 60%),
    oklch(0.13 0.008 60);
}
```

- **`.stars`** — `position: absolute; inset: -10% -5%;` with ~10 stacked `radial-gradient` "dots" (1–1.6px), mixed cream and one warm-gold dot for visual rhythm. Parallax shifts down `+ scrollY * 0.08px`.
- **`.grid-lines`** — `background-image: linear-gradient(to bottom, transparent 49.5%, oklch(0.94 0.02 80 / 0.045) 50%, transparent 50.5%);` `background-size: 100% 18%;` masked to fade at edges with `mask-image: radial-gradient(60% 60% at 50% 50%, black, transparent 80%)`. Parallax shifts up `- scrollY * 0.18px`.
- **`.top-fade`** — top 180px linear gradient from `oklch(0.08 0.006 60)` → transparent.
- **`.bottom-fade`** — bottom 32% linear gradient from transparent → bg, ending at 80%.

### 2. Vertical Jet Image

- **Source:** `assets/jet-vertical.png` — 976 × 1085, transparent background (PNG). Nose points UP.
- **Element:** plain `<img>` inside `.jet-stage` (a fullscreen absolute container, `z-index: 3`, `pointer-events: none`).
- **Sizing:** `height: 118vh; width: auto;`
- **Anchor:** `position: absolute; left: 50%; bottom: 0;` then translated by JS.
- **Glow:** sibling `.jet-glow` element — `80vmin × 60vmin` radial-gradient blob, `filter: blur(40px)`, color `oklch(0.78 0.10 80 / 0.22)`, `z-index: 2`.
- **Drop shadow:** `filter: drop-shadow(0 30px 80px oklch(0 0 0 / 0.7)) drop-shadow(0 0 50px oklch(0.78 0.10 80 / 0.18));`

### 3. Headline

Two lines, four word-groups. The line is a `grid-template-columns: 1fr 1fr` with a large center gap — that gap is the corridor the jet flies through.

```
Line 1:  [Fine]      ←gap→      [Dining.]
Line 2:  [Above the] ←gap→      [Clouds.]
```

- **Font:** Cormorant Garamond, 300 weight (Google Fonts)
- **Size:** `clamp(56px, 9.2vw, 156px)`
- **Line-height:** `0.92`
- **Letter-spacing:** `-0.018em`
- **Color:** `oklch(0.94 0.02 80)` (cream)
- **Accent word:** "Above" — italic, gold `oklch(0.78 0.10 80)`
- **Center corridor:** `column-gap: clamp(120px, 14vw, 240px)` on each `.line`
- **Left half:** `justify-self: end; text-align: right;`
- **Right half:** `justify-self: start; text-align: left;`
- **Each word wrapped in:**
  - outer `<span class="word l|r">` — gets the horizontal `translate3d` from scroll
  - inner `<span class="inner">` — gets the load-in rise animation (110% → 0)

### 4. Coordinate Strips (vertical, screen edges)

Both edges of the hero. Vertical writing.

- **Position:** `position: absolute; top: 50%;` `transform: translateY(-50%)` (left side is also `rotate(180deg)`).
- **Distance from edge:** `44px` (desktop), `18px` (≤820px).
- **Font:** Manrope 400, 10px, `letter-spacing: 0.42em`, uppercase, `writing-mode: vertical-rl`.
- **Composition (per side):** label · gold dot · accent value · thin rule (40px × 1px, `oklch(0.94 0.02 80 / 0.16)`) · label.
- **Left content:** `N · 47.4° 22'   •   FL410 (gold)   |   Mach 0.85`
- **Right content:** `W · 122.3° 18'   •   −54°C   |   Heading 284°`
- **Color:** body `oklch(0.72 0.018 80)` (cream-dim); gold accent `oklch(0.78 0.10 80)`.

---

## Interactions & Behavior

### Entrance (page load, runs once)

1. **t = 0.20s** — jet fades in (`opacity 0 → 1`) and rises from `~+18% below rest` to its rest position (eased over 1.4s, cubic ease-out).
2. **t = 0.35s** — `Fine` rises into view (translateY 110% → 0, opacity 0 → 1, 1.4s cubic-bezier(0.2, 0.78, 0.15, 1)).
3. **t = 0.42s** — `Dining.` rises (same easing).
4. **t = 0.55s** — `Above the` rises.
5. **t = 0.62s** — `Clouds.` rises.
6. **t = 0.80s** — coordinate strips fade in (1.4s).

Stagger increment: ~70ms between adjacent words.

### Scroll choreography

A `requestAnimationFrame` loop lerps a `smooth` value toward `window.scrollY` (factor 0.085) for buttery feel, then drives:

- **Jet** — rises from a "cockpit-tip peeking" rest position to fully exited above the viewport, while also scaling `1 → 1.04` over the climb. Rest and exit positions are computed from real element dimensions each frame (so the choreography is correct on any viewport size).
- **Word groups** — each side translates outward by up to `28vw` (`SPLIT_MAX_VW`). Line 2 trails line 1 by ~4% progress for a layered feel.
- **Stars** — drift down `+ p * 0.08 * vh px`.
- **Grid lines** — drift up `- p * 0.18 * vh px`.
- **Glow** — translates with the jet, fades from `0.9 → ~0.18` opacity by exit.

Progress `p` is `easeInOut(clamp01(smooth / vh))` — i.e. one full viewport of scroll completes the takeoff.

### Math for jet bounds (important — port faithfully)

Read each frame:
```js
const jh = jet.offsetHeight;
const hh = hero.clientHeight;
const vh = window.innerHeight;
const PEEK_PX = 70;  // how much of the cockpit pokes into view at rest

const restPct = ((vh - PEEK_PX) - (hh - jh)) / jh * 100;
const exitPct = (-PEEK_PX - hh) / jh * 100;
```

Then animate `translate3d(-50%, ${jetPct}%, 0)` with `jetPct` interpolating `restPct → exitPct` along `p`.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Scroll-driven JS animations should also short-circuit (set jet to rest pose, leave words centered) under `matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## State Management

The hero is presentational. No app state beyond:

- A scroll listener (`passive: true`) that updates a `target` scalar.
- An rAF loop maintaining the lerped `smooth` value.
- No data fetching, no forms, no routes.

If your framework prefers hooks/composables, wrap the rAF loop in something like `useScrollRig` and tear it down on unmount. Add `IntersectionObserver` if you want to pause the loop when the hero scrolls out of view.

---

## Design Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `oklch(0.13 0.008 60)` | Hero background |
| `--bg-deep` | `oklch(0.08 0.006 60)` | Top fade |
| `--cream` | `oklch(0.94 0.02 80)` | Headline, body |
| `--cream-dim` | `oklch(0.72 0.018 80)` | Coordinate text |
| `--gold` | `oklch(0.78 0.10 80)` | Accent word, ticks, glow |
| `--rule` | `oklch(0.94 0.02 80 / 0.16)` | Hairline rules |

### Typography

| Stack | Family | Weights used |
|---|---|---|
| `--serif` | Cormorant Garamond | 300 italic, 300 |
| `--sans` | Manrope | 400 |

Google Fonts URL:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600&display=swap
```

### Spacing / sizing

- Hero side padding: handled by intrinsic centering — no horizontal padding on the hero block itself.
- Coordinate strip offset from edge: `44px` (desktop), `18px` (≤820px).
- Title font-size: `clamp(56px, 9.2vw, 156px)`.
- Title center corridor: `clamp(120px, 14vw, 240px)`.
- Jet image height: `118vh` (do not change — affects choreography math).

### Motion

| Curve | Use |
|---|---|
| `cubic-bezier(0.2, 0.78, 0.15, 1)` | Word rise on load |
| `cubic-bezier(0.2, 0.7, 0.2, 1)` | Generic fade-up |
| `cubic-bezier(0.22, 0.65, 0.18, 1)` | Jet entrance |
| `easeInOut(t)` (custom JS) | Scroll progress |
| Lerp factor `0.085` | Scroll smoothing |

---

## Assets

- **`assets/jet-vertical.png`** — 976 × 1085 PNG, transparent background, nose-up vertical orientation. The user owns this image. If you re-process, preserve the alpha cutout (no black background) and keep nose pointing up.

No icons. No other imagery in the hero.

---

## Responsive Behavior

- **≥ 821px:** Layout as described.
- **≤ 820px:**
  - Coordinate strip offset reduces to `18px`.
  - Coordinate font-size reduces to `9px`.
  - Jet height drops to `100vh`.
  - Headline font-size auto-scales via `clamp(..., 9.2vw, ...)`.

The two-line / four-word structure stays intact at all sizes. Do NOT collapse to single-column on mobile — the corridor and the split are the design.

---

## Implementation Notes for the Integrator

1. **Match the layering exactly.** Title z-index MUST be greater than jet z-index. This is what produces the "flying through" illusion.
2. **Don't replace the scroll lerp with naive `scrollY` binding** — the smoothing is half of why it feels expensive. A lerp factor of `~0.085` at 60fps is the target.
3. **Compute jet bounds from element dimensions**, not from fixed percentages. The hero's `min-height: 720px` decouples it from the viewport at short heights; static percentages misplace the jet.
4. **Fonts must be loaded before the load-in animation** for the rise to look correct. Use `font-display: swap` (default for Google Fonts) and don't pre-translate words off-screen until fonts are ready, or accept the FOUT.
5. **Hairline performance:** put `will-change: transform` on the jet, glow, word groups, stars, and grid-lines. Use `translate3d` everywhere to keep things on the GPU compositor.
6. **Accessibility:**
   - The headline is an `<h1>` with `aria-label="Fine Dining. Above the Clouds."` since the visible word order is split across spans.
   - Jet image has empty `alt=""` (decorative).
   - Coordinate strips are decorative; consider `aria-hidden="true"` if you don't want them announced.

---

## Files in This Bundle

- `altitude-hero.html` — full working reference. The hero is `<section class="hero" id="hero">`. Everything after `</section>` (the "Provenance" block) is scroll runway and should NOT be ported.
- `assets/jet-vertical.png` — the jet image with alpha background.
- `README.md` — this file.
