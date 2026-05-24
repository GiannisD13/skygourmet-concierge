import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

const WORDS = [
  'Athens',
  'Mykonos',
  'Thessaloniki',
  'Michelin Quality',
  '4-Hour Notice',
  'Direct to Aircraft',
  '24/7 Concierge',
];

const Marquee = () => {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const skewTo = gsap.quickTo('.marquee-skew', 'skewX', { duration: 0.7, ease: 'power3' });
      let idle: ReturnType<typeof setTimeout>;

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -130);
          skewTo(v);
          clearTimeout(idle);
          idle = setTimeout(() => skewTo(0), 120);
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // Two copies back-to-back so the CSS translateX(-50%) loops seamlessly
  const strip = [...WORDS, ...WORDS];

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-accent/15 bg-background py-8 md:py-12"
      aria-hidden="true"
    >
      <div className="marquee-skew">
        <div className="animate-marquee flex w-max items-center whitespace-nowrap">
          {strip.map((word, i) => (
            <span key={i} className="flex items-center">
              <span className="px-8 font-serif text-4xl font-medium tracking-tight text-foreground/90 md:text-6xl">
                {word}
              </span>
              <span className="h-2 w-2 rotate-45 bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
