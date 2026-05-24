import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import ScrollReveal from '@/components/home/ScrollReveal';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

interface Stat {
  value: number;
  suffix?: string;
  decimals?: number;
  raw?: string; // non-numeric display (skips count-up)
  label: string;
}

const STATS: Stat[] = [
  { value: 3, label: 'Departure Airports' },
  { value: 4, suffix: 'h', label: 'Minimum Notice' },
  { value: 100, suffix: '+', label: 'Signature Dishes' },
  { value: 0, raw: '24/7', label: 'Private Concierge' },
];

function CountUp({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1800;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(value * easeOutCubic(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const StatsCounter = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-luxury">
        <ScrollReveal x={-40} y={60} className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-5xl font-medium text-accent text-glow-gold md:text-7xl">
                {stat.raw ? stat.raw : <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />}
              </div>
              <div className="mx-auto mt-3 mb-4 h-px w-10 bg-accent/40" />
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StatsCounter;
