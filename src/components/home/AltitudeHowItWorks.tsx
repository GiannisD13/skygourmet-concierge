import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

// Scroll lerp factor — same "buttery" smoothing as the hero/handoff.
const SMOOTHING = 0.12;
// How quickly a frame fades out as the fractional index moves away from it.
// Full opacity at dist 0, gone by dist 0.6 (ported verbatim from the handoff).
const FADE_SPAN = 0.6;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

interface Step {
  side: 'left' | 'right';
  phase: string; // top-left chip + photo caption phase word
  alt: string; // "Step 0X / 05" for the chip
  num: string; // serif step number, e.g. "First Step"
  phaseTail: string; // text after the phase word in the copy column
  tplus: string;
  eyebrow: string;
  // Title is split so the accent word can sit inside an <em>.
  titlePre: string;
  titleEm: string;
  titlePost: string;
  desc: string;
  pkey: string;
  pval: string;
  tlLabel: string; // short timeline label
  media:
    | { type: 'photo'; src: string; alt: string; cap: string }
    | { type: 'phone'; src: string; alt: string };
}

const STEPS: Step[] = [
  {
    side: 'left',
    phase: 'Wheels-Up',
    alt: 'Step 01 / 05',
    num: 'First Step',
    phaseTail: 'Origin & Destination',
    tplus: 'T+00:00',
    eyebrow: 'Select your route',
    titlePre: 'Pick your ',
    titleEm: 'location',
    titlePost: '.',
    desc: 'Tell us where you depart, where you land, and how many will be on board. Our network covers every Greek FBO — from Athens and Thessaloniki to the smallest island fields.',
    pkey: 'Coverage',
    pval: 'All Hellenic airfields & islands',
    tlLabel: 'Location',
    media: { type: 'photo', src: '/assets/step-1-tarmac.jpg', alt: 'Private jet on a dark tarmac', cap: 'Wheels-Up · Step 01' },
  },
  {
    side: 'right',
    phase: 'Climb',
    alt: 'Step 02 / 05',
    num: 'Second Step',
    phaseTail: 'The Menu',
    tplus: 'T+00:15',
    eyebrow: 'Choose or compose',
    titlePre: 'Pick a menu, or ',
    titleEm: 'compose',
    titlePost: ' one.',
    desc: 'Choose from our seasonal flight menus, or build your own with our chefs — kosher, halal, vegan, allergen-free, or anything in between. Every dish is plated for cabin service.',
    pkey: 'Options',
    pval: 'Curated · Custom · Sommelier-paired',
    tlLabel: 'Menu',
    media: { type: 'photo', src: '/assets/step-2-menu.jpg', alt: 'Plated dish on board', cap: 'Climb · Step 02' },
  },
  {
    side: 'left',
    phase: 'Cruise',
    alt: 'Step 03 / 05',
    num: 'Third Step',
    phaseTail: 'Sign In & Order',
    tplus: 'T+00:30',
    eyebrow: 'Place your order',
    titlePre: 'Sign in, place the ',
    titleEm: 'order',
    titlePost: '.',
    desc: 'Existing client? Sign in. New to Altitude? Create an account in under a minute. Submit your manifest, dietary requirements, and any special notes for the kitchen.',
    pkey: 'Account',
    pval: 'Encrypted · Saved manifests · One-tap reorder',
    tlLabel: 'Order',
    media: { type: 'phone', src: '/assets/step-3-signin.png', alt: 'Sign in to your account on SkyGourmet' },
  },
  {
    side: 'right',
    phase: 'Cruise',
    alt: 'Step 04 / 05',
    num: 'Fourth Step',
    phaseTail: 'Confirmation',
    tplus: 'T+01:00',
    eyebrow: 'Direct confirmation',
    titlePre: 'A message, ',
    titleEm: 'finalised',
    titlePost: '.',
    desc: 'Within the hour, you receive a WhatsApp message from your assigned concierge — confirming every line of the manifest, settling timings, and answering any last requests before the kitchen begins.',
    pkey: 'Channel',
    pval: 'WhatsApp · 24 / 7 concierge',
    tlLabel: 'Confirm',
    media: { type: 'photo', src: '/assets/step-4-whatsapp.png', alt: 'A hand holding a phone with WhatsApp open', cap: 'Cruise · Step 04' },
  },
  {
    side: 'left',
    phase: 'Descent',
    alt: 'Step 05 / 05',
    num: 'Fifth Step',
    phaseTail: 'Settle',
    tplus: 'T+24:00',
    eyebrow: 'Invoice & settlement',
    titlePre: 'Settle quietly, ',
    titleEm: 'fly well',
    titlePost: '.',
    desc: 'After wheels-down, your invoice arrives by email — itemised, transparent, settled in your preferred currency. House accounts are billed monthly.',
    pkey: 'Billing',
    pval: 'Per-flight · House account · Multi-currency',
    tlLabel: 'Settle',
    media: { type: 'photo', src: '/assets/step-5-dine.jpg', alt: 'Diners enjoying champagne on board', cap: 'Descent · Step 05' },
  },
];

const N = STEPS.length;

/**
 * "How it works" — a sticky-pinned scrollytelling sequence. A tall `.day-track`
 * wraps a `position: sticky; height: 100vh` stage holding 5 absolutely-stacked
 * frames. Scroll progress (measured against the TRACK, never the section — the
 * header sits above the pin in normal flow) drives a 0→1 value that crossfades
 * the frames, advances the bottom timeline, and updates the top-left chip.
 *
 * Reuses the hero/network tokens; sits directly under the network section.
 */
const AltitudeHowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const phaseElRef = useRef<HTMLSpanElement>(null);
  const altElRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Reduced motion: snap straight to scroll position (no lerp) so frames track
    // 1:1 and every step stays readable by manual scrolling. The CSS reduced-
    // motion block zeroes the copy-rise / photo-settle transitions.
    const smoothing = prefersReducedMotion() ? 1 : SMOOTHING;

    let target = 0;
    let smooth = 0;
    let lastActive = -1;
    let raf = 0;

    const compute = () => {
      const r = track.getBoundingClientRect();
      const span = track.offsetHeight - window.innerHeight;
      if (span <= 0) return 0;
      return clamp01(-r.top / span);
    };

    const apply = () => {
      smooth += (target - smooth) * smoothing;
      const p = smooth; // 0 → 1
      const idxF = p * (N - 1); // fractional step index
      const activeIdx = Math.round(idxF);

      // Crossfade — opacity ramps to 0 by FADE_SPAN away from each frame's index.
      for (let i = 0; i < N; i++) {
        const f = frameRefs.current[i];
        if (!f) continue;
        f.style.opacity = Math.max(0, 1 - Math.abs(idxF - i) / FADE_SPAN).toFixed(3);
      }

      // Class toggles only fire when the active step changes — cheap + avoids
      // re-triggering the copy stagger every frame.
      if (activeIdx !== lastActive) {
        frameRefs.current.forEach((f, i) => f?.classList.toggle('is-active', i === activeIdx));
        dotRefs.current.forEach((d, i) => {
          d?.classList.toggle('is-active', i === activeIdx);
          d?.classList.toggle('is-past', i < activeIdx);
        });
        labelRefs.current.forEach((l, i) => l?.classList.toggle('is-active', i === activeIdx));
        const a = STEPS[activeIdx];
        if (a) {
          if (phaseElRef.current) phaseElRef.current.textContent = a.phase;
          if (altElRef.current) altElRef.current.textContent = a.alt;
        }
        lastActive = activeIdx;
      }

      // Timeline playhead + fill bar.
      if (headRef.current) headRef.current.style.left = `${(p * 100).toFixed(3)}%`;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;

      raf = requestAnimationFrame(apply);
    };

    const onScroll = () => {
      target = compute();
    };

    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(apply);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    onScroll();
    smooth = target; // initialise instantly so frame 0 is solid at section enter
    frameRefs.current[0]?.classList.add('is-active');
    start(); // kick unconditionally — don't rely on the observer firing in time

    // Pause the loop while the section is far off-screen.
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) start();
            else stop();
          }
        },
        { rootMargin: '50% 0px 50% 0px' },
      );
      io.observe(section);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io?.disconnect();
      stop();
    };
  }, []);

  return (
    <section ref={sectionRef} className="altitude-howitworks" data-screen-label="How It Works">
      <header className="day-head">
        <div className="day-head-eyebrow">Process</div>
        <h2>
          How it <em>works</em>.
        </h2>
        <p>From request to wheels-up in five steps — each handled by a member of our concierge team.</p>
      </header>

      <div className="day-track" ref={trackRef}>
        <div className="day-stage">
          <div className="day-meta-tl" aria-hidden="true">
            <span>Process</span>
            <span className="dot" />
            <span className="v" ref={phaseElRef}>
              {STEPS[0].phase}
            </span>
            <span className="dot" />
            <span className="v" ref={altElRef}>
              {STEPS[0].alt}
            </span>
          </div>

          {STEPS.map((step, i) => (
            <article
              key={i}
              className="day-frame"
              data-side={step.side}
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
            >
              <div className="day-photo">
                {step.media.type === 'phone' ? (
                  <div className="phone" aria-label="SkyGourmet sign-in screen">
                    <div className="phone-screen">
                      <img src={step.media.src} alt={step.media.alt} loading="lazy" />
                    </div>
                  </div>
                ) : (
                  <div className="photo">
                    <img src={step.media.src} alt={step.media.alt} loading="lazy" />
                    <span className="cap" aria-hidden="true">
                      {step.media.cap}
                    </span>
                  </div>
                )}
              </div>
              <div className="day-copy">
                <div className="day-num">{step.num}</div>
                <div className="day-phase">
                  {step.phase}
                  <span className="sep">·</span>
                  {step.phaseTail}
                </div>
                <div className="day-tplus">{step.tplus}</div>
                <div className="day-divider" />
                <div className="day-eyebrow">{step.eyebrow}</div>
                <h3 className="day-title">
                  {step.titlePre}
                  <em>{step.titleEm}</em>
                  {step.titlePost}
                </h3>
                <p className="day-desc">{step.desc}</p>
                <div className="day-pairing">
                  <span className="pkey">{step.pkey}</span>
                  <span className="pval">{step.pval}</span>
                </div>
              </div>
            </article>
          ))}

          <div className="day-tl" aria-hidden="true">
            <div className="day-tl-rail">
              <div className="day-tl-fill" ref={fillRef} />
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className="day-tl-dot"
                  style={{ left: `${(i / (N - 1)) * 100}%` }}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                />
              ))}
              <span className="day-tl-head" ref={headRef} style={{ left: '0%' }} />
            </div>
            <div className="day-tl-labels">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="day-tl-label"
                  style={{ left: `${(i / (N - 1)) * 100}%` }}
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                >
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  {step.tlLabel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AltitudeHowItWorks;
