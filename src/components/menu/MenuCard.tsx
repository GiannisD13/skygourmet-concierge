import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { MenuTier } from '@/types/catering';
import { Button } from '@/components/ui/button';

interface MenuCardProps {
  menu: MenuTier;
  index: number;
  onSelect: (menu: MenuTier) => void;
  onViewDetails: (menu: MenuTier) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ menu, index, onSelect, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`card-luxury bg-card overflow-hidden ${
        menu.featured ? 'ring-2 ring-accent' : ''
      }`}
    >
      {menu.featured && (
        <div className="bg-accent text-primary text-xs font-sans uppercase tracking-widest py-2 text-center">
          Most Popular
        </div>
      )}

      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src={menu.image}
          alt={menu.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-4">
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-accent mb-2">
            {menu.subtitle}
          </p>
          <h3 className="font-serif text-2xl md:text-3xl text-foreground">
            {menu.name}
          </h3>
        </div>

        <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-6">
          {menu.description}
        </p>

        <div className="space-y-2 mb-6">
          {menu.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div>
            <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
              Starting from
            </p>
            <p className="font-serif text-3xl text-foreground">
              €{menu.price.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(menu)}
              className="text-accent hover:text-accent"
            >
              View Details
            </Button>
            <Button
              variant="navy"
              size="sm"
              onClick={() => onSelect(menu)}
              className="gap-2"
            >
              Add to Flight
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
