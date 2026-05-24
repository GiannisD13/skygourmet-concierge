import { useState, useEffect } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { airports as staticAirports, airportMeta, Airport } from '@/types/catering';
import { useOrder } from '@/context/OrderContext';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/home/ScrollReveal';

// Alternating diagonal directions so cards fan into place
const CARD_X = [-60, 0, 60];

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
    <section id="locations" className="section-padding scroll-mt-24 bg-background">
      <div className="container-luxury">
        <ScrollReveal x={50} y={50} className="mb-12 text-center md:mb-16">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-accent">Your Departure</p>
          <h2 className="mb-4 font-serif text-4xl text-foreground md:text-5xl">Where is your next departure?</h2>
          <p className="mx-auto max-w-md font-sans text-muted-foreground">
            Select your departure airport to explore our curated catering options
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="glass-dark h-56 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {airports.map((airport, i) => (
              <ScrollReveal key={airport.code} x={CARD_X[i % CARD_X.length]} y={80}>
                <button
                  onClick={() => handleSelectAirport(airport)}
                  className="glass-dark group relative h-full w-full overflow-hidden rounded-xl p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:border-accent/40 hover:shadow-[0_24px_60px_-20px_hsl(43_54%_59%/0.35)]"
                >
                  {/* gold glow that blooms on hover */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/0 blur-3xl transition-colors duration-500 group-hover:bg-accent/20" />

                  <div className="relative mb-8 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/5">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-serif text-5xl font-medium text-accent/20 transition-colors duration-500 group-hover:text-accent/70">
                      {airport.code}
                    </span>
                  </div>

                  <h3 className="relative mb-2 font-serif text-2xl text-foreground">{airport.city}</h3>
                  <p className="relative mb-8 font-sans text-sm text-muted-foreground">{airport.name}</p>

                  <div className="relative flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-accent opacity-60 transition-all duration-300 group-hover:gap-3 group-hover:opacity-100">
                    <span>Select</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationSelector;
