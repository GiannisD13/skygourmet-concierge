import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

interface ScrollRevealProps {
  children: ReactNode;
  /** Horizontal drift in px — the sign sets the diagonal direction. */
  x?: number;
  /** Vertical rise in px (element starts this far below its resting place). */
  y?: number;
  /** Subtle tilt in degrees while travelling. */
  rotate?: number;
  className?: string;
  /**
   * ScrollTrigger start/end — controls where along the scroll the reveal runs.
   * The window is kept short so elements near the page bottom still finish.
   */
  start?: string;
  end?: string;
}

/**
 * Scroll-linked diagonal reveal. As the user scrolls the element into view it
 * rises and drifts sideways into place, scrubbed to scroll position (not time),
 * so motion tracks the scroll exactly. Uses transform + opacity only for 60fps.
 */
const ScrollReveal = ({
  children,
  x = 0,
  y = 80,
  rotate = 0,
  className,
  start = 'top 85%',
  end = 'top 58%',
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, x: 0, y: 0, rotation: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, x, y, rotation: rotate },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start, end, scrub: true },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [x, y, rotate, start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
