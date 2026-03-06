import { motion } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';

const OrderSummary = () => {
  const { selectedAirport } = useOrder();
  const { cartBundles, cartItems, totalAmount, removeBundle, removeItem } = useCart();

  if (!selectedAirport) return null;

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

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <div className="p-6 space-y-4">
          <h3 className="font-serif text-lg text-foreground">Order Summary</h3>

          {/* Bundles */}
          {cartBundles.map(bundle => (
            <div key={bundle.id} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-foreground font-medium leading-tight">{bundle.name}</p>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">Menu package</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-serif text-sm text-foreground">€{bundle.price.toLocaleString()}</span>
                <button
                  onClick={() => removeBundle(bundle.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Items */}
          {cartItems.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-foreground font-medium leading-tight">{item.name}</p>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">× {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-serif text-sm text-foreground">€{(item.price * item.quantity).toLocaleString()}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-4 mt-2">
            <div className="flex justify-between items-end">
              <span className="font-sans text-sm text-muted-foreground">Total</span>
              <span className="font-serif text-2xl text-foreground">
                €{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
