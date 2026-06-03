import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

const JET_PATH =
  'M97.6 50c0-2.3-1.8-4.2-4.1-4.4L62 43.2 41.7 16.8c-.6-.8-1.5-1.3-2.5-1.3h-6.4c-1.4 0-2.4 1.3-2 2.6l7.9 26.4-18.6-1.5-6.2-9.3c-.5-.7-1.3-1.1-2.1-1.1H7.4c-1.3 0-2.3 1.2-2 2.5l3.6 14.7-3.6 14.7c-.3 1.3.7 2.5 2 2.5h4.4c.8 0 1.6-.4 2.1-1.1l6.2-9.3 18.6-1.5-7.9 26.4c-.4 1.3.6 2.6 2 2.6h6.4c1 0 1.9-.5 2.5-1.3L62 56.8l31.5-2.4c2.3-.2 4.1-2.1 4.1-4.4z';

const LoadingScreen = ({ onReveal }: { onReveal: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const duration = reduced ? 350 : 1200;
    const startTime = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      setProgress(Math.round(easeOut(p) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setHiding(true); // start the curtain-up exit
        onReveal(); // let the hero begin its flight as the curtain lifts
        exitTimer = setTimeout(() => setGone(true), reduced ? 0 : 800);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
    };
  }, [onReveal]);

  if (gone) return null;

  return (
    <div
      className={`dark fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground transition-transform [transition-duration:750ms] [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] ${
        hiding ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Orbit */}
      <div className="relative h-44 w-44">
        {/* dashed track */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.35" />
        </svg>

        {/* orbiting jet */}
        <div className="animate-orbit absolute inset-0">
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{ filter: 'drop-shadow(0 0 10px hsl(38 59% 64% / 0.6))' }}
          >
            <svg width="34" height="34" viewBox="0 0 100 100" fill="hsl(var(--accent))" aria-hidden="true">
              <path d={JET_PATH} />
            </svg>
          </div>
        </div>

        {/* percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-4xl font-medium tabular-nums text-accent text-glow-gold">
            {progress}
            <span className="text-2xl">%</span>
          </span>
        </div>
      </div>

      {/* brand */}
      <div className="mt-10 text-center">
        <p className="font-serif text-2xl text-foreground">SkyGourmet Concierge</p>
        <p className="mt-2 font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Preparing your journey
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
