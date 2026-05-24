import { useCallback, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Plane, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import AltitudeHero from '@/components/home/AltitudeHero';
import AltitudeNetwork from '@/components/home/AltitudeNetwork';
import Marquee from '@/components/home/Marquee';
import StatsCounter from '@/components/home/StatsCounter';
import FeaturesSection from '@/components/home/FeaturesSection';
import FoodShowcase from '@/components/home/FoodShowcase';
import LoopWords from '@/components/home/LoopWords';
import LocationSelector from '@/components/home/LocationSelector';
import SectionDivider from '@/components/home/SectionDivider';
import ScrollReveal from '@/components/home/ScrollReveal';
import LoadingScreen from '@/components/home/LoadingScreen';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const Index = () => {
  useSmoothScroll();

  // Loading screen plays once per browser session
  const firstVisit = useRef(typeof window !== 'undefined' && sessionStorage.getItem('sg-loaded') !== '1');
  const [loaded, setLoaded] = useState(!firstVisit.current);

  const reveal = useCallback(() => {
    sessionStorage.setItem('sg-loaded', '1');
    setLoaded(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {firstVisit.current && <LoadingScreen onReveal={reveal} />}

      <div className="dark home-cinematic min-h-screen overflow-x-hidden text-foreground">
        <Header />
        <AltitudeHero ready={loaded} />
        <AltitudeNetwork />
        <Marquee />
        <StatsCounter />

        {/* Stats (background) → Features (raised) */}
        <SectionDivider className="bg-background text-[hsl(220_30%_12%)]" />
        <FeaturesSection />
        {/* Features (raised) → Food showcase (background) */}
        <SectionDivider flip className="bg-background text-[hsl(220_30%_12%)]" />

        {/* Looping gourmet words — bridges Features → Collections */}
        <LoopWords />

        <FoodShowcase />
        <LocationSelector />

        {/* CTA (raised) */}
        <SectionDivider className="bg-background text-[hsl(220_30%_12%)]" />
        <section className="section-padding surface-raised">
          <div className="container-luxury">
            <ScrollReveal x={-50} y={70} className="mx-auto max-w-2xl text-center">
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-accent">Ready when you are</p>
              <h2 className="mb-8 font-serif text-4xl leading-tight text-foreground md:text-6xl">
                Dining worthy of the journey
              </h2>
              <a
                href="#locations"
                className="group inline-flex items-center gap-3 rounded-full border border-accent px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] text-accent transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                Start your order
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-accent/10 bg-background section-padding">
          <div className="container-luxury">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-3">
                <Plane className="h-6 w-6 -rotate-45 text-accent" />
                <span className="font-serif text-xl text-foreground">SkyGourmet Concierge</span>
              </div>
              <p className="font-sans text-sm text-muted-foreground">
                © 2025 SkyGourmet Concierge. Luxury catering for private aviation.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
};

export default Index;
