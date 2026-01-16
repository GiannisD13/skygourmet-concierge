import { useState } from 'react';
import { motion } from 'framer-motion';
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
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 md:py-32 bg-[hsl(0,0%,4%)]">
      <div className="container-luxury">
        {/* Minimal header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-28"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[hsl(45,50%,55%)] mb-6 block">
            Select Departure
          </span>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-tight">
            Choose Your Origin
          </h2>
        </motion.div>

        {/* Landmarks grid - no boxes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-20"
        >
          {airports.map((airport) => {
            const isHovered = hoveredCode === airport.code;
            
            return (
              <motion.button
                key={airport.code}
                variants={itemVariants}
                onClick={() => handleSelectAirport(airport)}
                onMouseEnter={() => setHoveredCode(airport.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className="group relative flex flex-col items-center text-center focus:outline-none"
              >
                {/* Gold glow behind SVG on hover */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, hsl(45, 50%, 50%) 0%, transparent 70%)',
                  }}
                  animate={{ 
                    opacity: isHovered ? 0.15 : 0,
                    scale: isHovered ? 1.2 : 0.8,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* SVG Landmark */}
                <div className="relative w-48 h-36 md:w-56 md:h-40 lg:w-64 lg:h-48 mb-8">
                  {getLandmarkComponent(airport.code, isHovered)}
                </div>

                {/* City name - elegant serif */}
                <motion.h3 
                  className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-2"
                  animate={{ 
                    color: isHovered ? 'hsl(45, 50%, 60%)' : 'hsl(0, 0%, 85%)',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {airport.city}
                </motion.h3>

                {/* Airport code - minimal */}
                <motion.span 
                  className="font-sans text-xs tracking-[0.3em] uppercase"
                  animate={{ 
                    color: isHovered ? 'hsl(45, 45%, 55%)' : 'hsl(0, 0%, 45%)',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {airport.code} · {airport.name.split(' ')[0]}
                </motion.span>

                {/* Subtle underline on hover */}
                <motion.div
                  className="mt-6 h-px bg-[hsl(45,50%,50%)]"
                  animate={{ 
                    width: isHovered ? 60 : 0,
                    opacity: isHovered ? 0.6 : 0,
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
