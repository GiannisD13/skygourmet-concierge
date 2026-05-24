import { Plane, Clock, Award } from 'lucide-react';
import ScrollReveal from '@/components/home/ScrollReveal';

const features = [
  {
    icon: Plane,
    index: '01',
    title: 'Direct to Aircraft',
    description: 'Seamless delivery straight to your aircraft at VIP terminals across Greece.',
    x: -70,
  },
  {
    icon: Clock,
    index: '02',
    title: '4-Hour Notice',
    description: 'Flexible ordering with just 4 hours minimum notice for last-minute departures.',
    x: 0,
  },
  {
    icon: Award,
    index: '03',
    title: 'Michelin Quality',
    description: "Partnered with Greece's finest chefs to deliver exceptional culinary experiences.",
    x: 70,
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding surface-raised">
      <div className="container-luxury">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <ScrollReveal key={feature.title} x={feature.x} y={90}>
              <div className="glass-dark group relative h-full overflow-hidden rounded-xl p-8 transition-transform duration-500 hover:-translate-y-2">
                <span className="absolute right-6 top-5 font-serif text-5xl text-accent/10 transition-colors duration-500 group-hover:text-accent/25">
                  {feature.index}
                </span>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/5 transition-colors duration-500 group-hover:bg-accent/15">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-3 font-serif text-2xl text-foreground">{feature.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
