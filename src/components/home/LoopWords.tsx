import { AnimatePresence, motion } from 'framer-motion';
import { useLoop } from '@/components/ui/loop-animation-hook';
import ScrollReveal from '@/components/home/ScrollReveal';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

const WORDS = ['Caviar', 'Truffle', 'Champagne', 'Saffron', 'Lobster', 'Foie Gras', 'Oysters', 'Wagyu'];

const LoopWords = () => {
  const reduced = prefersReducedMotion();
  // Pause the auto-advance under reduced motion (huge delay = effectively static)
  const { key } = useLoop(reduced ? 100_000_000 : 2200);
  const index = key % WORDS.length;

  return (
    <section className="section-padding overflow-hidden bg-background">
      <div className="container-luxury">
        <ScrollReveal x={-40} y={50} className="text-center">
          <p className="mb-8 font-sans text-xs uppercase tracking-[0.4em] text-accent">The taste of altitude</p>

          <div className="font-serif text-4xl font-medium leading-none text-foreground md:text-6xl lg:text-7xl">
            <span>Plated with </span>
            {/* Fixed-height, clipped box so each word slides cleanly up and out */}
            <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '-100%' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="block whitespace-nowrap text-accent text-glow-gold"
                >
                  {WORDS[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LoopWords;
