import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

// --- Choreography tunables (ported faithfully from the design handoff) ---
const PEEK_PX = 70; // how far the cockpit tip pokes into the viewport at rest
const SPLIT_MAX_VW = 28; // each headline half slides this many vw outward at full scroll
const SMOOTHING = 0.085; // scroll lerp factor — the "buttery" feel lives here
const ENTER_MS = 1400; // jet entrance duration
const ENTER_DELAY = 200; // jet entrance delay after the loader lifts

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Altitude hero — a vertical jet rises through the centre of a two-line
 * headline as you scroll, splitting each line's words left and right so the
 * jet appears to fly through the gap they vacate. The jet (z-3) deliberately
 * sits BEHIND the title (z-5); that layering IS the effect.
 *
 * `ready` gates the entrance so it begins as the loading screen lifts, matching
 * the rest of the home page.
 */
const AltitudeHero = ({ ready = true }: { ready?: boolean }) => {
  const heroRef = useRef<HTMLElement>(null);
  const jetRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const l1L = useRef<HTMLSpanElement>(null);
  const l1R = useRef<HTMLSpanElement>(null);
  const l2L = useRef<HTMLSpanElement>(null);
  const l2R = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready) return;
    const hero = heroRef.current;
    const jet = jetRef.current;
    if (!hero || !jet) return;

    // Jet translateY% bounds, computed from REAL element dimensions each frame so
    // the choreography stays correct at any viewport size or hero min-height.
    const jetBounds = () => {
      const jh = jet.offsetHeight || 1;
      const hh = hero.clientHeight;
      const vh = window.innerHeight;
      const restPct = (vh - PEEK_PX - (hh - jh)) / jh * 100;
      const exitPct = (-PEEK_PX - hh) / jh * 100;
      return { restPct, exitPct };
    };

    // Reduced motion: park the jet at rest, leave the headline centred, no rAF.
    if (prefersReducedMotion()) {
      const { restPct } = jetBounds();
      jet.style.transform = `translate3d(-50%, ${restPct}%, 0)`;
      jet.style.opacity = '1';
      if (glowRef.current) glowRef.current.style.opacity = '0.45';
      return;
    }

    let target = window.scrollY || 0;
    let smooth = target;
    let raf = 0;
    const startTime = performance.now();

    const onScroll = () => {
      target = window.scrollY || 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const frame = () => {
      // Lerp the smoothed scroll value toward the real one for an eased feel.
      smooth += (target - smooth) * SMOOTHING;

      const vh = window.innerHeight;
      const linearP = clamp01(smooth / vh); // 0 → 1 across one viewport of scroll
      const p = easeInOut(linearP); // eased takeoff progress

      // Entrance progress — 0 → 1 over ENTER_MS after ENTER_DELAY.
      const elapsed = performance.now() - startTime - ENTER_DELAY;
      const enterP = easeOut(clamp01(elapsed / ENTER_MS));

      // Jet: rise from a "cockpit peeking" rest pose to fully exited, scaling 1 → 1.04.
      const { restPct, exitPct } = jetBounds();
      const offRest = restPct + 18; // slightly lower than rest at load (cockpit hidden)
      const enterPct = offRest + (restPct - offRest) * enterP;
      const jetPct = enterPct + (exitPct - restPct) * p;
      jet.style.transform = `translate3d(-50%, ${jetPct}%, 0) scale(${1 + p * 0.04})`;
      jet.style.opacity = String(enterP);

      // Glow tracks the jet, weakening as it exits.
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(-50%, ${30 - 180 * p}%, 0)`;
        glowRef.current.style.opacity = String(0.9 * (1 - p * 0.8));
      }

      // Title split — words slide outward; line 2 trails line 1 for a layered feel.
      const split1 = SPLIT_MAX_VW * p;
      const split2 = SPLIT_MAX_VW * Math.max(0, p - 0.04) * 1.05;
      if (l1L.current) l1L.current.style.transform = `translate3d(${-split1}vw, 0, 0)`;
      if (l1R.current) l1R.current.style.transform = `translate3d(${split1}vw, 0, 0)`;
      if (l2L.current) l2L.current.style.transform = `translate3d(${-split2}vw, 0, 0)`;
      if (l2R.current) l2R.current.style.transform = `translate3d(${split2}vw, 0, 0)`;

      // Background parallax.
      if (starsRef.current) starsRef.current.style.transform = `translate3d(0, ${linearP * vh * 0.08}px, 0)`;
      if (gridRef.current) gridRef.current.style.transform = `translate3d(0, ${-linearP * vh * 0.18}px, 0)`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  return (
    <section ref={heroRef} className={`altitude-hero${ready ? ' is-ready' : ''}`}>
      <div className="sky" aria-hidden="true" />
      <div ref={starsRef} className="stars" aria-hidden="true" />
      <div ref={gridRef} className="grid-lines" aria-hidden="true" />

      {/* Coordinate strips — decorative flight telemetry at the screen edges */}
      <div className="side left" aria-hidden="true">
        <span className="label">{"N · 47.4° 22'"}</span>
        <span className="tick" />
        <span className="v gold">FL410</span>
        <span className="rule" />
        <span className="label">{'Mach 0.85'}</span>
      </div>
      <div className="side right" aria-hidden="true">
        <span className="label">{"W · 122.3° 18'"}</span>
        <span className="tick" />
        <span className="v">{'−54°C'}</span>
        <span className="rule" />
        <span className="label">{'Heading 284°'}</span>
      </div>

      <div ref={glowRef} className="jet-glow" aria-hidden="true" />
      <div className="jet-stage" aria-hidden="true">
        <img ref={jetRef} className="jet" src="/assets/jet-vertical.png" alt="" />
      </div>

      <h1 className="title" aria-label="Fine Dining. Above the Clouds.">
        <span className="line line-1">
          <span ref={l1L} className="word l">
            <span className="inner">Fine</span>
          </span>
          <span ref={l1R} className="word r">
            <span className="inner">Dining.</span>
          </span>
        </span>
        <span className="line line-2">
          <span ref={l2L} className="word l">
            <span className="inner">
              <em>Above</em>&nbsp;the
            </span>
          </span>
          <span ref={l2R} className="word r">
            <span className="inner">Clouds.</span>
          </span>
        </span>
      </h1>

      <div className="top-fade" aria-hidden="true" />
      <div className="bottom-fade" aria-hidden="true" />
    </section>
  );
};

export default AltitudeHero;
