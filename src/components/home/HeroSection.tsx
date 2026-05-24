import { useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import heroImage from '@/assets/hero-catering.jpg';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

// Flight trajectory drawn across the hero (viewBox 1440 x 800)
const FLIGHT_PATH = 'M -80 660 C 320 600, 620 470, 880 340 S 1320 150 1540 120';
// Plane travels to this fraction of the path; the dotted trail reveals to the
// same fraction so the nose always sits at the leading edge of the trail.
const PLANE_END = 0.82;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const lineUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const HeroSection = ({ ready = true }: { ready?: boolean }) => {
  const root = useRef<HTMLElement>(null);

  // Scroll-linked motion (parallax backdrop + diagonal drift-out of content)
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.to('.hero-bg', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      if (!reduced) {
        // As you scroll past the hero, the content rises and slides diagonally away
        gsap.to('.hero-content', {
          y: -150,
          x: 90,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  // Entrance flight — waits for `ready` so it begins as the loader lifts
  useEffect(() => {
    if (!ready) return;
    const reduced = prefersReducedMotion();
    const path = root.current?.querySelector<SVGPathElement>('.flight-path');
    const plane = root.current?.querySelector<HTMLElement>('.hero-plane');

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.trail-mask', { strokeDashoffset: 1 - PLANE_END });
        if (plane && path) {
          gsap.set(plane, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: PLANE_END },
            autoAlpha: 1,
          });
        }
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });

      // Dotted trail and plane share duration + easing + endpoint → perfectly in sync
      tl.fromTo('.trail-mask', { strokeDashoffset: 1 }, { strokeDashoffset: 1 - PLANE_END, duration: 3.2 }, 0);
      if (plane && path) {
        tl.fromTo(plane, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.15);
        tl.to(
          plane,
          { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: PLANE_END }, duration: 3.2 },
          0,
        );
      }
      tl.fromTo('.dest-dot', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, 2.7);
    }, root);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={root} className="relative grain-overlay flex min-h-[100dvh] items-center overflow-hidden">
      {/* Backdrop (GSAP parallax target) */}
      <div className="hero-bg absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury private jet catering"
          className="animate-ken-burns h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Flight path — dotted trail revealed in step with the plane */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="trail-reveal" maskContentUnits="userSpaceOnUse">
            <path
              className="trail-mask"
              d={FLIGHT_PATH}
              fill="none"
              stroke="#fff"
              strokeWidth={32}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          </mask>
        </defs>

        <path
          className="flight-path"
          d={FLIGHT_PATH}
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="2 11"
          opacity={0.9}
          mask="url(#trail-reveal)"
        />

        <circle className="dest-dot" cx={1300} cy={168} r={7} fill="hsl(var(--gold))" />
        <circle className="dest-dot" cx={1300} cy={168} r={14} fill="none" stroke="hsl(var(--gold))" strokeWidth={1.5} opacity={0.4} />
      </svg>

      {/* Jet (top-view silhouette, GSAP MotionPath target) */}
      <div
        className="hero-plane pointer-events-none absolute left-0 top-0 z-[2] opacity-0"
        style={{ filter: 'drop-shadow(0 0 12px hsl(43 54% 59% / 0.5))' }}
      >
        <svg width="44" height="44" viewBox="0 0 100 100" fill="hsl(var(--gold))" aria-hidden="true">
          <path d="M97.6 50c0-2.3-1.8-4.2-4.1-4.4L62 43.2 41.7 16.8c-.6-.8-1.5-1.3-2.5-1.3h-6.4c-1.4 0-2.4 1.3-2 2.6l7.9 26.4-18.6-1.5-6.2-9.3c-.5-.7-1.3-1.1-2.1-1.1H7.4c-1.3 0-2.3 1.2-2 2.5l3.6 14.7-3.6 14.7c-.3 1.3.7 2.5 2 2.5h4.4c.8 0 1.6-.4 2.1-1.1l6.2-9.3 18.6-1.5-7.9 26.4c-.4 1.3.6 2.6 2 2.6h6.4c1 0 1.9-.5 2.5-1.3L62 56.8l31.5-2.4c2.3-.2 4.1-2.1 4.1-4.4z" />
        </svg>
      </div>

      {/* Content (GSAP diagonal drift-out target wraps the Framer entrance) */}
      <div className="hero-content container-luxury section-padding relative z-[3] w-full">
        <motion.div variants={container} initial="hidden" animate={ready ? 'show' : 'hidden'} className="max-w-3xl">
          <motion.p variants={lineUp} className="mb-6 font-sans text-xs uppercase tracking-[0.4em] text-accent">
            Private Aviation Catering · Greece
          </motion.p>

          <h1 className="mb-8 font-serif text-5xl font-medium leading-[1.05] text-foreground md:text-7xl lg:text-8xl">
            <motion.span variants={lineUp} className="block">
              Exceptional Cuisine
            </motion.span>
            <motion.span variants={lineUp} className="block text-accent text-glow-gold">
              Above the Clouds
            </motion.span>
          </h1>

          <motion.p variants={lineUp} className="max-w-xl font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
            Curated gourmet experiences for discerning travelers. From Athens to Mykonos,
            we bring Michelin-quality dining to your private flight.
          </motion.p>

          <motion.div variants={lineUp} className="mt-12">
            <a
              href="#locations"
              className="group inline-flex items-center gap-3 font-sans text-sm uppercase tracking-[0.2em] text-foreground transition-colors hover:text-accent"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 transition-colors group-hover:border-accent group-hover:bg-accent/10">
                <ArrowDown className="h-5 w-5 animate-bounce text-accent motion-reduce:animate-none" />
              </span>
              Begin your journey
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
