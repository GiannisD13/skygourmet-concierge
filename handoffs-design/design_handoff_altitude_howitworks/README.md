# Handoff: Altitude Dining — "How It Works" Section

## Overview
The third section on the Altitude Dining landing page, sitting beneath the **hero** and the **network map**. A **sticky-pinned scrollytelling sequence** that walks the user through the 5-step ordering process — each step gets its own full-viewport frame with an editorial layout, and as the user scrolls, the frames crossfade while a horizontal timeline at the bottom advances.

The flight metaphor from the hero is preserved as poetic phase markers: **Wheels-Up · Climb · Cruise · Cruise · Descent**.

## About the Design Files
The file in this bundle is a **design reference created in HTML** — a working prototype showing intended look and behavior. It is **not production code to copy directly**. Recreate this section in the target codebase's existing environment (React, Vue, Next.js, Astro, etc.) using established component patterns and styling system. The reference is `altitude-howitworks.html`; open it in a browser and scroll past the first two sections to see the live behavior.

## Placement
This is the **third section** on the page, sitting directly beneath the network map. There's a normal-flow header ("Process / How it works.") above the pinned area so the user reads the section title before the scrolljack begins.

## Fidelity
**High-fidelity.** Colors, type, copy, and motion are settled.

## Color tokens — MUST match the hero & network sections
This section uses the SAME tokens. **Reuse the existing theme variables — do not introduce new ones.**

| Token | Value | Use here |
|---|---|---|
| `--bg` | `oklch(0.13 0.008 60)` | Section background, phone bezel inner |
| `--cream` | `oklch(0.94 0.02 80)` | Step titles, photo captions, active timeline label |
| `--cream-dim` | `oklch(0.72 0.018 80)` | Phase meta, T+ timestamps, descriptions, pairing key |
| `--gold` | `oklch(0.78 0.10 80)` | Step-number serif, italic accents in titles, timeline fill, active dot |
| `--rule` | `oklch(0.94 0.02 80 / 0.16)` | Divider hairlines, timeline rail |

## Typography — also matches hero
- **Serif** — Cormorant Garamond 300 — step number ("First Step"), step titles
- **Sans** — Manrope 300/400/500 — eyebrows, descriptions, captions, timeline labels
- **Mono** — JetBrains Mono / SF Mono / ui-monospace — T+ timestamps

---

## High-Level Mechanics

```
┌──────────────────────────────────────────────────────────────────┐
│  <section class="day">                                           │
│                                                                  │
│    <header class="day-head"> ─── normal flow ────────────────┐   │
│      Process                                                 │   │
│      How it works.                                           │   │
│      From request to wheels-up in five steps …               │   │
│    </header>                                                 ┘   │
│                                                                  │
│    <div class="day-track" style="height: 575vh">  ── tall! ──┐   │
│                                                              │   │
│      <div class="day-stage" style="position: sticky;        │   │
│                                  top: 0; height: 100vh">    │   │
│                                                              │   │
│        ┌──── 5 absolutely-positioned <article.day-frame> ───┴───┐│
│        │  Frame 0 · First Step  · Pick a location               ││
│        │  Frame 1 · Second Step · Pick a menu                   ││
│        │  Frame 2 · Third Step  · Sign in & order (PHONE BEZEL) ││
│        │  Frame 3 · Fourth Step · WhatsApp confirmation         ││
│        │  Frame 4 · Fifth Step  · Settle                        ││
│        └────────────────────────────────────────────────────────┘│
│                                                              │   │
│        <div class="day-tl">  ── bottom timeline ────────────┐│   │
│          rail · 5 dots · gold playhead · 5 labels           │┘   │
│                                                              │   │
│    </div>                                                    │   │
│                                                              ┘   │
│  </section>                                                      │
└──────────────────────────────────────────────────────────────────┘
```

The trick is the **tall `.day-track`** (575vh = ~115vh of scroll per step) wrapping a **`position: sticky; height: 100vh`** stage. As the user scrolls through the track, the stage stays pinned while a scroll-driven progress value crossfades between the 5 absolutely-positioned frames.

### Scroll progress calculation — CRITICAL

The progress value must be measured against **`.day-track`**, NOT against `.day` itself. The section includes a normal-flow header above the track; binding to the outer section gives wrong progress (already non-zero when frame 0 should still be fully visible).

```js
function compute() {
  const track = section.querySelector('.day-track');
  if (!track) return 0;
  const r = track.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = track.offsetHeight - vh;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, -r.top / span));
}
```

This is the single most important detail to get right. With it: progress is exactly 0 when the stage first pins, 1 when the pin releases at the bottom.

### Frame crossfade

Each step has an integer index `i`. The fractional course index is `idxF = p * (N - 1)`. Each frame's opacity is a ramp:

```js
const dist = Math.abs(idxF - i);
const op = Math.max(0, 1 - dist / 0.6);    // full opacity at dist=0, fade out by dist=0.6
frame.style.opacity = op;
```

The frame nearest to `idxF` (round) gets the `.is-active` class, which:
- Triggers a staggered rise-in animation on the copy children (`opacity 0→1`, `translateY 14px→0`)
- Settles the photo from `scale(1.02)` → `scale(1)`

### Smoothing

A simple lerp keeps the motion buttery — same pattern as the hero:
```js
smooth += (target - smooth) * 0.12;
```
`target` is updated on scroll; `smooth` drives the apply loop in a `requestAnimationFrame` loop. Gate the loop with `IntersectionObserver` (with `rootMargin: '50% 0px 50% 0px'`) so it doesn't run when the section is far off-screen — but **kick the loop unconditionally at init** in case the observer fires late.

### Timeline (bottom)

- A 1px hairline rail with N dots evenly spaced (0%, 25%, 50%, 75%, 100% for N=5).
- A **gold fill bar** with `transform-origin: 0 50%` and `transform: scaleX(progress)` — grows left-to-right as progress advances.
- A **gold playhead** circle with `left: ${progress * 100}%`.
- Dots gain `.is-past` (full gold) up to active index, `.is-active` (1.4× scale + glow) at active.
- Labels below the rail with serif italic step numbers ("01", "02", …) and uppercase short labels ("Location", "Menu", "Order", "Confirm", "Settle").

### Top-left "Process" chip

Mirrors the active frame's `data-phase` (Wheels-Up / Climb / Cruise / Descent) and `data-alt` ("Step 0X / 05"). Hidden on mobile (no room).

---

## The Five Steps

Each step's `<article class="day-frame">` carries `data-side="left"` or `data-side="right"` to alternate layout, plus `data-frame`, `data-phase`, `data-alt`.

| # | Side | Step number | Phase | T+ | Eyebrow | Title (italic accent in `<em>`) | Description | Pairing key / value | Photo |
|---|---|---|---|---|---|---|---|---|---|
| 0 | left | First Step | Wheels-Up · Origin & Destination | T+00:00 | Select your route | Pick your *location*. | Tell us where you depart, where you land, and how many will be on board. Our network covers every Greek FBO — from Athens and Thessaloniki to the smallest island fields. | Coverage / All Hellenic airfields & islands | `step-1-tarmac.jpg` (private jet on dark tarmac) |
| 1 | right | Second Step | Climb · The Menu | T+00:15 | Choose or compose | Pick a menu, or *compose* one. | Choose from our seasonal flight menus, or build your own with our chefs — kosher, halal, vegan, allergen-free, or anything in between. Every dish is plated for cabin service. | Options / Curated · Custom · Sommelier-paired | `step-2-menu.jpg` (plated dishes) |
| 2 | left | Third Step | Cruise · Sign In & Order | T+00:30 | Place your order | Sign in, place the *order*. | Existing client? Sign in. New to Altitude? Create an account in under a minute. Submit your manifest, dietary requirements, and any special notes for the kitchen. | Account / Encrypted · Saved manifests · One-tap reorder | `step-3-signin.png` (UI screenshot — **inside a phone bezel**) |
| 3 | right | Fourth Step | Cruise · Confirmation | T+01:00 | Direct confirmation | A message, *finalised*. | Within the hour, you receive a WhatsApp message from your assigned concierge — confirming every line of the manifest, settling timings, and answering any last requests before the kitchen begins. | Channel / WhatsApp · 24 / 7 concierge | `step-4-whatsapp.png` (phone in hand with WhatsApp) |
| 4 | left | Fifth Step | Descent · Settle | T+24:00 | Invoice & settlement | Settle quietly, *fly well*. | After wheels-down, your invoice arrives by email — itemised, transparent, settled in your preferred currency. House accounts are billed monthly. | Billing / Per-flight · House account · Multi-currency | `step-5-dine.jpg` (diners with champagne) |

---

## Layout per Frame

```
data-side="left":                      data-side="right":
┌────────────────────────┐             ┌────────────────────────┐
│ [PHOTO 58%] [COPY 42%] │             │ [COPY 42%] [PHOTO 58%] │
└────────────────────────┘             └────────────────────────┘
```

Implemented with `flex-direction: row | row-reverse` on the frame.

### Photo column (`.day-photo`)
- `flex: 0 0 58%; height: 78vh; padding: 0 clamp(24px, 3vw, 60px);`
- Vertically centers a single inner element — either a `.photo` (for steps 1, 2, 4, 5) or `.phone` (step 3).

### Unified photo treatment (`.photo`)
All photo frames apply a consistent grade so the disparate stock-y source images look like they were art-directed together:

```css
.photo img {
  filter: brightness(0.88) contrast(1.04) saturate(0.85);
  object-fit: cover;
}
.photo::after {
  /* vignette overlay */
  background:
    radial-gradient(120% 80% at 50% 50%, transparent 40%, oklch(0 0 0 / 0.45) 100%),
    linear-gradient(180deg, transparent 60%, oklch(0 0 0 / 0.35) 100%);
}
.photo .cap {
  /* small uppercase tag in lower-left, e.g. "Wheels-Up · Step 01" */
  position: absolute; left: 24px; bottom: 22px;
  font-family: Manrope; font-size: 9px; font-weight: 500;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: var(--cream); opacity: 0.78;
}
.photo .cap::before {
  content: ""; width: 18px; height: 1px; background: var(--gold);
}
```

### Phone bezel (`.phone`) — step 3 only
A custom CSS phone frame, NOT an image. Holds the sign-in screenshot.

```css
.phone {
  --phone-w: min(280px, 36vh);
  width: var(--phone-w);
  height: calc(var(--phone-w) * 2.05);     /* ~iPhone 14 aspect */
  border-radius: 38px;
  padding: 10px;                            /* makes the bezel */
  background: linear-gradient(160deg, oklch(0.28 0.012 70) 0%, oklch(0.14 0.008 60) 60%);
  box-shadow:
    0 0 0 1px oklch(0.94 0.02 80 / 0.06),   /* inner hairline */
    0 30px 70px oklch(0 0 0 / 0.55),         /* drop shadow */
    0 0 60px oklch(0.78 0.10 80 / 0.08);    /* gold ambient glow */
}
.phone-screen {
  width: 100%; height: 100%;
  border-radius: 30px; overflow: hidden;
}
.phone-screen img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: top center;  /* CRUCIAL — without this the img sizes by aspect ratio and only fills half the bezel */
}
.phone::before {
  /* Dynamic island */
  content: ""; position: absolute;
  top: 22px; left: 50%; transform: translateX(-50%);
  width: 86px; height: 22px; border-radius: 14px;
  background: oklch(0.06 0.004 60);
}
.phone::after {
  /* Side button (right edge) */
  content: ""; position: absolute;
  right: -2px; top: 22%;
  width: 2px; height: 60px; border-radius: 2px 0 0 2px;
  background: oklch(0.20 0.010 70);
}
```

### Copy column (`.day-copy`)
- `flex: 0 0 42%; padding: 0 clamp(48px, 5vw, 96px); color: var(--cream);`
- Children in order:
  1. `.day-num` — "First Step" — Cormorant Garamond italic 300, clamp(56px, 5.6vw, 92px), gold
  2. `.day-phase` — "Wheels-Up · Origin & Destination" — Manrope 500 10px, 0.42em letter-spacing, uppercase, cream-dim. Middle dot `<span class="sep">·</span>` is `oklch(0.94 0.02 80 / 0.25)`.
  3. `.day-tplus` — "T+00:00" — JetBrains Mono 10px, 0.3em letter-spacing, uppercase, cream-dim
  4. `.day-divider` — 56px × 1px hairline (`--rule`), 36px above / 28px below
  5. `.day-eyebrow` — "Select your route" — Manrope 500 10px, 0.42em letter-spacing, uppercase, gold
  6. `.day-title` — Cormorant Garamond 300, clamp(36px, 4vw, 60px), cream. Italic accent word in `<em>` styled gold.
  7. `.day-desc` — Manrope 300 15px, line-height 1.6, cream-dim, max-width 42ch
  8. `.day-pairing` — flex row with key (uppercase, cream-dim, gold hairline prefix) and value (serif italic, cream)

### Per-frame entrance animation
Once a frame becomes `.is-active`, its copy children rise into place with a tight stagger:
```css
.day-copy > * {
  opacity: 0; transform: translateY(14px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.is-active .day-copy > *:nth-child(N) { transition-delay: 0.04s * N; }
```
Photo settles `scale(1.02) → 1` over 1.4s.

---

## Responsive (≤820px)

This was carefully reworked to avoid overlaps. Key changes:

- `.day-head` padding shrinks to `80px 24px 32px`
- `.day-track` extends to **700vh** (more scroll runway per step on small screens)
- `.day-stage` becomes `height: 100vh; min-height: 0`
- `.day-meta-tl` (top-left chip) is **hidden** — no room
- `.day-frame` stacks to a single column with `flex-direction: column; justify-content: center; gap: 20px`. **`justify-content: center` is important** — `flex-start` leaves a big void above the timeline.
- `.day-frame` padding `24px 0 90px` — top breath + reserved space for the timeline anchored at `bottom: 20px`
- `.day-photo`: full width, `height: 36vh`, 20px horizontal padding
- `.phone` shrinks: `--phone-w: min(190px, 30vh)`; dynamic island scales to `64px × 16px`
- Copy fonts scale down: `.day-num` 36px, `.day-title` 28px, `.day-desc` 13px
- Timeline width 92vw, label font 7px (0.20em letter-spacing), serif numbers 11px

---

## Reduced motion

Already handled at the page root:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Additionally, scroll-driven JS should still set `frames[N-1].classList.add('is-active')` or similar when reduced motion is active, so the user can see all five steps by manually scrolling (without the crossfade animation between them).

---

## Accessibility

- `<section data-screen-label="How It Works">` for skip-nav.
- The `<header class="day-head">` carries the semantic `<h2>` heading.
- Each step is `<article>` with its own `<h3 class="day-title">`.
- Photo captions are decorative — they repeat info in the copy. Consider hiding from screen readers with `aria-hidden="true"`.
- The timeline at the bottom is purely visual progress — `aria-hidden="true"` is fine; the step numbers already exist in each `<article>`.
- The phone bezel: the inner `<img>` should have a meaningful `alt` describing what's on the screen ("Sign in to your account on SkyGourmet").

---

## Files in This Bundle

- `altitude-howitworks.html` — full reference (all four sections: hero, network, how-it-works, plus loaders). Only port the **`<section class="day">…</section>`** block and its associated JS (the IIFE labeled `A Day on Board — scroll-jacked sticky stage`).
- `assets/step-1-tarmac.jpg`
- `assets/step-2-menu.jpg`
- `assets/step-3-signin.png`
- `assets/step-4-whatsapp.png`
- `assets/step-5-dine.jpg`
- `README.md` — this file.

## Implementation Checklist

- [ ] Place the new section directly after the network map section.
- [ ] Reuse the color tokens, font families, and font URL from the previous two handoffs. Do not duplicate or rename.
- [ ] Copy the 5 step photos into the project's public/assets folder; ensure the bundler/loader can serve them.
- [ ] Bind scroll progress to **`.day-track`** (NOT `.day`). This is the most common porting mistake.
- [ ] Use `requestAnimationFrame` with lerp smoothing 0.12. Gate with IntersectionObserver but also start the loop unconditionally at init.
- [ ] CSS phone bezel for step 3, with `object-fit: cover; object-position: top center;` on the screen `<img>` so the UI fills the entire bezel and doesn't size by aspect ratio.
- [ ] Apply the unified photo grade: `brightness(0.88) contrast(1.04) saturate(0.85)` + dark vignette `::after`.
- [ ] Confirm the responsive layout at ≤820px: photo + copy stacked, no gap between text and timeline, top chip hidden.
- [ ] Confirm `prefers-reduced-motion` doesn't break the section.
