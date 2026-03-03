import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { airports as staticAirports, airportMeta, Airport } from '@/types/catering';
import { useOrder } from '@/context/OrderContext';
import { api } from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const LocationSelector = () => {
  const navigate = useNavigate();
  const { setSelectedAirport } = useOrder();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Airport[]>('/api/v1/airports')
      .then(data => {
        // Merge API airports with local metadata (pickupLocation, coordinates)
        const merged = data.map(a => ({ ...a, ...(airportMeta[a.code] ?? {}) }));
        setAirports(merged);
      })
      .catch(() => {
        // Fallback to static data if API unavailable
        setAirports(staticAirports);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAirport = (airport: Airport) => {
    setSelectedAirport(airport);
    navigate('/menu');
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
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Where is your next departure?
          </h2>
          <p className="font-sans text-muted-foreground max-w-md mx-auto">
            Select your departure airport to explore our curated catering options
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="card-luxury bg-card h-48 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {airports.map((airport) => (
              <motion.button
                key={airport.code}
                variants={cardVariants}
                onClick={() => handleSelectAirport(airport)}
                className="group card-luxury bg-card p-8 text-left"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-serif text-4xl font-medium text-accent/30 group-hover:text-accent transition-colors">
                    {airport.code}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-foreground mb-2">
                  {airport.city}
                </h3>
                <p className="font-sans text-sm text-muted-foreground mb-6">
                  {airport.name}
                </p>

                <div className="flex items-center gap-2 text-accent font-sans text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Select</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LocationSelector;
