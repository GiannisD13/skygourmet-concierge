import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { airports } from '@/types/catering';
import { useOrder } from '@/context/OrderContext';
import ParthenonSVG from '@/components/landmarks/ParthenonSVG';
import WhiteTowerSVG from '@/components/landmarks/WhiteTowerSVG';
import MykonosSVG from '@/components/landmarks/MykonosSVG';

const LocationSelector = () => {
  const navigate = useNavigate();
  const { setSelectedAirport } = useOrder();
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const handleSelectAirport = (airport: typeof airports[0]) => {
    setSelectedAirport(airport);
    navigate('/menu');
  };

  const getLandmarkComponent = (code: string, isHovered: boolean) => {
    switch (code) {
      case 'ATH':
        return <ParthenonSVG isHovered={isHovered} />;
      case 'SKG':
        return <WhiteTowerSVG isHovered={isHovered} />;
      case 'JMK':
        return <MykonosSVG isHovered={isHovered} />;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="section-padding bg-secondary/50">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-6 h-6 text-accent" />
            <span className="font-sans text-sm uppercase tracking-widest text-accent">
              Select Departure
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
            Where is your next departure?
          </h2>
          <p className="font-sans text-muted-foreground max-w-md mx-auto">
            Hover over your destination to reveal its beauty
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
        >
          {airports.map((airport) => {
            const isHovered = hoveredCode === airport.code;
            
            return (
              <motion.button
                key={airport.code}
                variants={cardVariants}
                onClick={() => handleSelectAirport(airport)}
                onMouseEnter={() => setHoveredCode(airport.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-500 aspect-[4/5]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* SVG Landmark */}
                <div className="absolute inset-0">
                  {getLandmarkComponent(airport.code, isHovered)}
                </div>

                {/* Overlay gradient */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent"
                  animate={{ opacity: isHovered ? 0.6 : 0.8 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  {/* Airport Code Badge */}
                  <motion.div
                    className="absolute top-6 right-6"
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      color: isHovered ? 'hsl(45, 80%, 60%)' : 'hsl(var(--muted-foreground))'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-serif text-5xl md:text-6xl font-bold opacity-50">
                      {airport.code}
                    </span>
                  </motion.div>

                  {/* City Info */}
                  <motion.div
                    animate={{ y: isHovered ? -10 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-serif text-3xl md:text-4xl text-white mb-2">
                      {airport.city}
                    </h3>
                    <p className="font-sans text-sm text-white/70 mb-4">
                      {airport.name}
                    </p>

                    {/* CTA */}
                    <motion.div 
                      className="flex items-center gap-2 text-accent font-sans text-sm uppercase tracking-wider"
                      animate={{ 
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -20
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>Explore Menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: isHovered 
                      ? 'inset 0 0 0 2px hsl(45, 80%, 50%), 0 0 30px hsl(45, 80%, 50%, 0.3)' 
                      : 'inset 0 0 0 1px transparent'
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default LocationSelector;
