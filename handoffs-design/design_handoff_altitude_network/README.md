# Handoff: Altitude Dining — Network / Greece Map Section

## Overview
The section that sits **directly underneath the hero** on the Altitude Dining landing page. A two-column layout:

- **Left (60%)** — a dark luxury map of Greece with three pulsing gold markers (Athens, Thessaloniki, Mykonos) and faint dashed route lines connecting them. Map bleeds to the left edge of the viewport.
- **Right (40%)** — vertically centered. A small uppercase "Our Network" label and a three-item editorial accordion listing the same airports. One item open at a time.

## About the Design Files
The file in this bundle is a **design reference created in HTML** — a working prototype showing intended look and behavior. It is **not production code to copy directly**. Recreate this section in the target codebase's existing environment (React, Vue, Next.js, Astro, etc.) using established component patterns and styling system. The reference is `altitude-network.html`; open it in a browser to see the live behavior.

## Placement
This section is the **second section on the page**, sitting directly beneath the hero. There is **intentionally minimal vertical breathing room** between hero and this section (~40px top padding, no border, no large heading) — the map appears to flow out of the hero's bottom fade.

## Fidelity
**High-fidelity (hifi).** Colors, type, spacing, and motion are settled. Recreate pixel-faithfully.

## Color tokens — MUST match the hero
This section uses the SAME color tokens as the hero. If the hero was already handed off and recreated, **reuse those tokens / theme variables exactly**. Do not introduce new ones.

| Token | Value | Use here |
|---|---|---|
| `--bg` | `oklch(0.13 0.008 60)` | Section background |
| `--cream` | `oklch(0.94 0.02 80)` | Airport names, marker labels |
| `--cream-dim` | `oklch(0.72 0.018 80)` | "Our Network" label, descriptions, ICAO codes, + icon (closed) |
| `--gold` | `oklch(0.78 0.10 80)` | Markers, route lines, pulse dots, + icon (open), accent on hover |
| `--rule` | `oklch(0.94 0.02 80 / 0.16)` | Hairline dividers between accordion items |

## Typography — also matches hero

- **Serif** — Cormorant Garamond (300 weight) — airport names in accordion
- **Sans** — Manrope (300/400/500) — labels, descriptions, ICAO codes
- **Mono** — JetBrains Mono / SF Mono / ui-monospace — ICAO row inside accordion body

Google Fonts URL (already loaded by hero, don't double-load):
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600&display=swap
```

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  routes section — padding: 40px 0 140px;  background: --bg;          │
│  ┌─────────────────────────────────────┬─────────────────────────┐   │
│  │                                     │  OUR NETWORK            │   │
│  │                                     │                         │   │
│  │   ┌──────────────────────────┐      │  ─────────────────────  │   │
│  │   │      MAP OF GREECE       │      │  Athens          ＋     │   │
│  │   │   (bleeds left, 1:1.05   │      │  ─────────────────────  │   │
│  │   │    aspect ratio)         │      │  Thessaloniki    ＋     │   │
│  │   │                          │      │  ─────────────────────  │   │
│  │   │   • markers              │      │  Mykonos         ＋     │   │
│  │   │                          │      │  ─────────────────────  │   │
│  │   └──────────────────────────┘      │                         │   │
│  │                                     │                         │   │
│  └─────────────────────────────────────┴─────────────────────────┘   │
│           60% width                            40% width             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Section:** `padding: 40px 0 140px`. No horizontal padding so the map can bleed left. No border-top — flows directly from the hero.
- **Grid:** `display: grid; grid-template-columns: 60% 40%; align-items: center; gap: 0;`
- **Map column (`.map-col`):** padding: 0. The `<svg>` fills it 100%.
- **Network column (`.network-col`):** padding `0 clamp(40px, 6vw, 96px) 0 clamp(48px, 6vw, 96px);`. Inner wrapper `max-width: 520px`.

### Responsive (≤820px)

Stack into one column: map on top (full-width), accordion below with 24px horizontal padding. `network-inner` removes its max-width.

---

## Map Implementation

### Source data
A **Greece GeoJSON** loaded at runtime from a public CDN. Two mirrors are tried in order:

1. `https://raw.githubusercontent.com/georgique/world-geojson/develop/countries/greece.json`
2. `https://raw.githubusercontent.com/georgique/world-geojson/master/countries/greece.json`

Both return the same `FeatureCollection` for the Hellenic Republic. Cross-origin GET is allowed by GitHub raw.

**For production, vendor the JSON file** rather than fetching from raw.githubusercontent.com on each visit — it's not a CDN, it's source hosting. Copy the JSON into your assets folder and serve it from your own origin.

### Dependency
**d3-geo only** (not full d3) — used for the `geoMercator` projection function. Loaded as part of full d3 in the reference (`https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`) for reliability, but you can swap to the much smaller `d3-geo` package directly:

```bash
npm install d3-geo
```

```js
import { geoMercator } from 'd3-geo';
```

### CRITICAL — Path rendering quirk
The georgique/world-geojson dataset has **reversed polygon winding** (CW outer rings instead of the RFC 7946 CCW convention). This breaks `d3.geoPath` — every feature renders as the complement of itself (rest-of-world instead of Greece).

**Do NOT use `d3.geoPath` for this dataset.** Instead, walk the GeoJSON rings yourself and project each `[lon, lat]` coordinate through `projection([lon, lat])` to build SVG path strings directly. SVG's `nonzero` fill rule doesn't care about winding direction, so this Just Works.

Reference implementation (~25 lines in `altitude-network.html`):

```js
function featureToPath(feature) {
  const geom = feature.geometry || feature;
  let polys;
  if (geom.type === 'MultiPolygon') polys = geom.coordinates;
  else if (geom.type === 'Polygon') polys = [geom.coordinates];
  else return '';
  let d = '';
  for (const poly of polys) {
    for (const ring of poly) {
      let first = true;
      for (const coord of ring) {
        const pt = projection(coord);
        if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) continue;
        d += (first ? 'M' : 'L') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1) + ' ';
        first = false;
      }
      d += 'Z ';
    }
  }
  return d.trim();
}
```

If you swap to a well-formed Greece GeoJSON (e.g. from Natural Earth via topojson + ISO code 300), you can use `d3.geoPath()` normally. But the manual ring-walker is winding-agnostic and a safe default.

### Projection
Hard-coded — do NOT use `fitExtent` against this dataset (its `d3.geoBounds` reports global bounds due to the same winding issue).

```js
const projection = d3.geoMercator()
  .center([23.6, 38.7])        // mainland Greece centroid
  .scale(5300)                  // tuned for 1000×1050 viewBox
  .translate([W / 2, H / 2]);
```

If you change the SVG viewBox dimensions, retune `scale` empirically.

### SVG structure

```html
<svg viewBox="0 0 1000 1050" preserveAspectRatio="xMidYMid meet">
  <g id="mapPaths"></g>     <!-- land features -->
  <g id="routeLines"></g>   <!-- dashed gold curves between markers -->
  <g id="markers"></g>      <!-- pulse rings + cores + labels -->
</svg>
```

The SVG container has `aspect-ratio: 1 / 1.05` and a subtle radial wash behind it:

```css
.map-wrap {
  width: 100%;
  aspect-ratio: 1 / 1.05;
  background: radial-gradient(60% 50% at 50% 45%, oklch(0.16 0.012 65) 0%, transparent 70%);
}
```

### Land styling
```css
.map-svg .land {
  fill: oklch(0.20 0.010 70);
  stroke: oklch(0.78 0.10 80 / 0.45);     /* faint gold edge */
  stroke-width: 0.5;
  stroke-linejoin: round;
  stroke-linecap: round;
  paint-order: fill stroke;
}
```

### Markers

Three cities, plotted via the same `projection([lon, lat])` call:

| Name | Code | Lon | Lat | Label anchor | dx | dy |
|---|---|---|---|---|---|---|
| Thessaloniki | SKG | 22.9444 | 40.6401 | start | +22 | −14 |
| Athens | ATH | 23.9445 | 37.9364 | start | +22 | +18 |
| Mykonos | JMK | 25.3289 | 37.4467 | end | −22 | −14 |

Each marker is a `<g class="marker">` with `transform="translate(x y)"` containing:

1. **`<circle class="ring">`** — expanding pulse ring (`r: 3 → 26`, `opacity: 0.9 → 0`), 2.6s loop.
2. **`<circle class="core">`** — central gold dot with breathing pulse (`r: 2.4 → 3.6`, gold drop-shadow).
3. **`<line class="leader">`** — short hairline gold leader to the label.
4. **`<text class="label">`** — uppercase, 11px Manrope 500, 0.28em letter-spacing, cream with `paint-order: stroke` + bg-colored stroke for legibility over the landmass.
5. **`<text class="label-sub">`** — IATA code, smaller, dimmer.

Markers stagger via class:
```css
.marker.delay-2 .ring, .marker.delay-2 .core { animation-delay: 0.87s; }
.marker.delay-3 .ring, .marker.delay-3 .core { animation-delay: 1.73s; }
```

### Route lines
Two dashed quadratic-curve segments connecting Thessaloniki → Athens → Mykonos. Each curve's control point is offset upward by 40px for a gentle arch.

```css
.map-svg .route-line {
  fill: none;
  stroke: oklch(0.78 0.10 80 / 0.55);
  stroke-width: 0.8;
  stroke-dasharray: 2 4;
  stroke-linecap: round;
  opacity: 0;
  animation: routeFade 1.4s ease 0.4s forwards;
}
```

### Keyframes

```css
@keyframes ringPulse {
  0%   { r: 3;  opacity: 0.9; }
  100% { r: 26; opacity: 0; }
}
@keyframes corePulse {
  0%, 100% { r: 2.4; opacity: 1; }
  50%      { r: 3.6; opacity: 0.85; }
}
@keyframes routeFade { to { opacity: 1; } }
```

---

## Network Accordion

### Markup pattern (per item)

```html
<article class="acc-item" data-airport="ath">
  <button class="acc-head" type="button" aria-expanded="false">
    <span class="acc-name">
      Athens<span class="acc-faint">Eleftherios Venizelos</span>
    </span>
    <span class="acc-icon" aria-hidden="true"></span>
  </button>
  <div class="acc-body" aria-hidden="true">
    <div class="acc-body-inner">
      <div class="acc-meta">
        <span class="acc-icao">LGAV / ATH · N 37.94° E 23.94°</span>
        <span class="acc-status"><span class="acc-pulse"></span>Active</span>
      </div>
      <p class="acc-desc">Primary kitchen · Twenty-four-hour provisioning · Ninety-minute lead time to wheels-up.</p>
    </div>
  </div>
</article>
```

### Items in order

1. **Athens** · Eleftherios Venizelos · `LGAV / ATH · N 37.94° E 23.94°` · status **Active** · "Primary kitchen · Twenty-four-hour provisioning · Ninety-minute lead time to wheels-up."
2. **Thessaloniki** · Macedonia · `LGTS / SKG · N 40.64° E 22.95°` · status **Active** · "Macedonian provenance · Two-hour lead time · Private terminal & direct apron access."
3. **Mykonos** · Island · `LGMK / JMK · N 37.45° E 25.33°` · status **Seasonal** · "Seasonal service · April through October · Aegean seafood within the hour."

### Styles

| Element | Spec |
|---|---|
| `.accordion` | `border-bottom: 1px solid var(--rule);` |
| `.acc-item` | `border-top: 1px solid var(--rule);` (hairline above every item — combined with the bottom on .accordion, this gives a clean separator stack) |
| `.acc-head` | `display:flex; justify-content:space-between; padding: 28px 0; background:transparent; border:0;` |
| `.acc-name` | Cormorant Garamond 300, `clamp(28px, 2.6vw, 40px)`, line-height 1, letter-spacing −0.012em, cream |
| `.acc-faint` (suffix) | italic, cream-dim, `font-size: 0.6em`, `margin-left: 6px` |
| `.acc-icon` | 18×18 box with two 1px pseudo-elements forming a + (horizontal + vertical lines through center). Rotates 45° on open to become ×. |
| `.acc-body` | `max-height: 0; overflow:hidden; transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1);` |
| `.acc-body-inner` | `padding: 4px 0 32px;` + opacity/translateY transition |
| `.acc-icao` | JetBrains Mono / monospace 11px, 0.32em letter-spacing, uppercase, cream-dim |
| `.acc-status` + `.acc-pulse` | inline flex with a 6px gold dot pulsing via `dotPulse` keyframe (1.8s) |
| `.acc-desc` | Manrope 300, 14px, line-height 1.55, cream-dim, max-width 44ch |

### Interaction (the editorial part)

- **Single-open** — clicking an item closes all others first.
- **Click an open item** — closes it; everything ends closed.
- **`max-height` is set imperatively** to `body.scrollHeight + 'px'` on open (and `0px` on close) so the animation eases over the panel's real height, not an arbitrary upper bound. This is what gives the motion its precise, editorial feel — no overshoot, no slow tail.
- **Easing** — `cubic-bezier(0.4, 0, 0.2, 1)` for both height and the icon rotation. 450ms.
- **Inner body** also transitions opacity (0 → 1) and `translateY(-4px → 0)` over 400ms for a subtle layered reveal.
- **Hover state on the head** — both the name and the `+` icon shift to gold.
- **Re-measure on window resize** — when an item is open, recompute `scrollHeight` so content reflow doesn't break the animation.

### Reference JS

```js
function setOpen(item, open) {
  const head  = item.querySelector('.acc-head');
  const body  = item.querySelector('.acc-body');
  const inner = item.querySelector('.acc-body-inner');
  if (open) {
    body.style.maxHeight = inner.scrollHeight + 'px';
    item.classList.add('open');
    head.setAttribute('aria-expanded', 'true');
    body.setAttribute('aria-hidden', 'false');
  } else {
    body.style.maxHeight = '0px';
    item.classList.remove('open');
    head.setAttribute('aria-expanded', 'false');
    body.setAttribute('aria-hidden', 'true');
  }
}

items.forEach(item => {
  item.querySelector('.acc-head').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    items.forEach(i => setOpen(i, false));
    if (!isOpen) setOpen(item, true);
  });
});
```

---

## Accessibility

- The `+`/`×` icon is decorative — `aria-hidden="true"`. The button itself is the toggle; screen readers announce `aria-expanded` state.
- `aria-hidden` on `.acc-body` flips in sync with open state.
- Buttons have a visible `:focus-visible` outline (1px gold, 8px offset).
- The map's `<svg>` has `aria-hidden="true"` (decorative); the airport names in the accordion carry the semantic information. Add a `<title>` element if you want screen readers to announce "Map of Greece showing three destinations".
- All animations short-circuit under `@media (prefers-reduced-motion: reduce)` — pulse rings stop, accordion still expands but without the bounce/fade subtlety.

---

## Files in This Bundle

- `altitude-network.html` — the full reference page (hero + this section). The hero portion is `<section class="hero" id="hero">…</section>`; this section is `<section class="routes" id="routes">…</section>`. **Only port the routes section.** (The hero has its own separate handoff bundle.)
- `README.md` — this file.

## Implementation Checklist for the Integrator

- [ ] Place the new component/section directly after the hero in the page layout.
- [ ] Reuse the color tokens, font families, and font URL from the hero. Do not duplicate or rename.
- [ ] Vendor the Greece GeoJSON into your repo's assets folder (don't fetch from GitHub raw in production).
- [ ] Install d3-geo (or include the projection function inline — only `geoMercator` is used).
- [ ] Use the **manual ring-walker** for path generation if you keep the georgique dataset. If you switch to a clean GeoJSON, you can use `d3.geoPath` normally.
- [ ] Implement single-open accordion with imperative max-height = scrollHeight.
- [ ] Verify the map bleeds to the left viewport edge (no horizontal padding on the section).
- [ ] Confirm responsive behavior: stacks to one column ≤ 820px.
- [ ] Confirm `prefers-reduced-motion` short-circuits the pulse animations.
