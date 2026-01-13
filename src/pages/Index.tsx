import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import LocationSelector from '@/components/home/LocationSelector';
import { motion } from 'framer-motion';
import { Plane, Clock, Award } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Plane,
      title: 'Direct to Aircraft',
      description: 'Seamless delivery straight to your aircraft at VIP terminals across Greece.',
    },
    {
      icon: Clock,
      title: '4-Hour Notice',
      description: 'Flexible ordering with just 4 hours minimum notice for last-minute departures.',
    },
    {
      icon: Award,
      title: 'Michelin Quality',
      description: 'Partnered with Greece\'s finest chefs to deliver exceptional culinary experiences.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <LocationSelector />

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding bg-primary text-primary-foreground">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-accent transform -rotate-45" />
              <span className="font-serif text-xl">SkyGourmet Concierge</span>
            </div>
            <p className="font-sans text-sm text-primary-foreground/60">
              © 2025 SkyGourmet Concierge. Luxury catering for private aviation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
