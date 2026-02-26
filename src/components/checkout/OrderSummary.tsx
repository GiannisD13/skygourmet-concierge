import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';

const OrderSummary = () => {
  const { selectedAirport, selectedMenu } = useOrder();

  if (!selectedMenu || !selectedAirport) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Location */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-full">
        <MapPin className="w-4 h-4 text-accent" />
        <span className="font-sans text-sm">
          {selectedAirport.city} ({selectedAirport.code})
        </span>
      </div>

      {/* Bundle Card */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        {selectedMenu.image && (
          <img
            src={selectedMenu.image}
            alt={selectedMenu.name}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground mb-1">
            {selectedMenu.name}
          </h3>
          {selectedMenu.subtitle && (
            <p className="font-sans text-sm text-accent mb-3">
              {selectedMenu.subtitle}
            </p>
          )}
          <p className="font-sans text-sm text-muted-foreground mb-4">
            {selectedMenu.description}
          </p>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-end">
              <span className="font-sans text-sm text-muted-foreground">Price per guest</span>
              <span className="font-serif text-2xl text-foreground">
                €{selectedMenu.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
