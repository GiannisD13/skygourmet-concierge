import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-catering.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury private jet catering"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container-luxury section-padding pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-accent font-sans text-sm uppercase tracking-[0.2em] mb-4"
          >
            Private Aviation Catering
          </motion.p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6">
            Exceptional Cuisine
            <span className="block text-accent">Above the Clouds</span>
          </h1>
          <p className="font-sans text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg">
            Curated gourmet experiences for discerning travelers. 
            From Athens to Mykonos, we bring Michelin-quality dining to your private flight.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
