import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Minus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartBundle, CartBundleLineItem } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BundleItemData {
  item_id: number;
  def_quality: number;   // qty for 2 pax
  qty_4: number | null;
  qty_6: number | null;
  qty_8: number | null;
  qty_10: number | null;
  item: { id: number; name: string; description: string | null; price: number };
}

export interface BackendBundleFull {
  id: number;
  name: string;
  description: string | null;
  price: number;        // price for 2 pax
  price_4: number | null;
  price_6: number | null;
  price_8: number | null;
  price_10: number | null;
  photoUrl: string | null;
  is_active: boolean;
  items_in_bundle: BundleItemData[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PAX_OPTIONS = [2, 4, 6, 8, 10] as const;
type PaxCount = typeof PAX_OPTIONS[number];

function getBundleBasePrice(bundle: BackendBundleFull, pax: PaxCount): number {
  if (pax === 4)  return bundle.price_4  ?? Math.round(bundle.price * 2);
  if (pax === 6)  return bundle.price_6  ?? Math.round(bundle.price * 3);
  if (pax === 8)  return bundle.price_8  ?? Math.round(bundle.price * 4);
  if (pax === 10) return bundle.price_10 ?? Math.round(bundle.price * 5);
  return bundle.price; // 2
}

function getItemDefaultQty(bi: BundleItemData, pax: PaxCount): number {
  if (pax === 4)  return bi.qty_4  ?? Math.round(bi.def_quality * 2);
  if (pax === 6)  return bi.qty_6  ?? Math.round(bi.def_quality * 3);
  if (pax === 8)  return bi.qty_8  ?? Math.round(bi.def_quality * 4);
  if (pax === 10) return bi.qty_10 ?? Math.round(bi.def_quality * 5);
  return bi.def_quality; // 2
}

// ── Component ──────────────────────────────────────────────────────────────────

interface MenuDetailDialogProps {
  bundle: BackendBundleFull | null;
  isOpen: boolean;
  onClose: () => void;
}

const MenuDetailDialog: React.FC<MenuDetailDialogProps> = ({ bundle, isOpen, onClose }) => {
  const { addBundle, openCart } = useCart();
  const { toast } = useToast();

  const [pax, setPax] = useState<PaxCount>(2);
  const [lineItems, setLineItems] = useState<{ id: number; name: string; unitPrice: number; defaultQty: number; quantity: number }[]>([]);

  // Rebuild lineItems when bundle or pax changes
  useEffect(() => {
    if (!bundle) return;
    setLineItems(
      bundle.items_in_bundle.map(bi => {
        const defaultQty = getItemDefaultQty(bi, pax);
        return {
          id: bi.item_id,
          name: bi.item.name,
          unitPrice: bi.item.price,
          defaultQty,
          quantity: defaultQty,
        };
      })
    );
  }, [bundle, pax]);

  if (!bundle) return null;

  const basePrice = getBundleBasePrice(bundle, pax);
  const adjustment = lineItems.reduce(
    (sum, li) => sum + (li.quantity - li.defaultQty) * li.unitPrice,
    0
  );
  const totalPrice = Math.max(0, basePrice + adjustment);

  const updateQty = (id: number, delta: number) => {
    setLineItems(prev =>
      prev.map(li =>
        li.id === id ? { ...li, quantity: Math.max(0, li.quantity + delta) } : li
      )
    );
  };

  const handleAddToCart = () => {
    const cartBundle: CartBundle = {
      id: bundle.id,
      name: bundle.name,
      description: bundle.description ?? undefined,
      photoUrl: bundle.photoUrl ?? undefined,
      paxCount: pax,
      basePrice,
      lineItems: lineItems as CartBundleLineItem[],
    };
    addBundle(cartBundle);
    openCart();
    onClose();
    toast({ title: `${bundle.name} added to cart`, description: `${pax} passengers — €${totalPrice.toLocaleString()}` });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl max-h-[90vh] bg-card rounded-lg shadow-hover overflow-hidden flex flex-col"
            >
              {/* Header Image */}
              <div className="relative h-44 md:h-52 flex-shrink-0">
                {bundle.photoUrl && (
                  <img src={bundle.photoUrl} alt={bundle.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="font-serif text-3xl text-foreground">{bundle.name}</h2>
                  {bundle.description && (
                    <p className="font-sans text-sm text-muted-foreground mt-1 line-clamp-1">{bundle.description}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Passenger selector */}
                <div className="px-6 pt-5 pb-4 border-b border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="font-sans text-sm font-medium text-foreground">Passengers</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {PAX_OPTIONS.map(n => (
                      <button
                        key={n}
                        onClick={() => setPax(n)}
                        className={`px-4 py-1.5 rounded-full font-sans text-sm border transition-colors ${
                          pax === n
                            ? 'bg-accent text-primary border-accent font-medium'
                            : 'border-border text-muted-foreground hover:border-accent hover:text-foreground'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items list with qty adjusters */}
                <div className="px-6 py-4 space-y-3">
                  <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Included items — adjust quantities as needed
                  </p>
                  {lineItems.map(li => {
                    const delta = li.quantity - li.defaultQty;
                    return (
                      <div
                        key={li.id}
                        className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-foreground">{li.name}</p>
                          {delta !== 0 && (
                            <p className={`font-sans text-xs mt-0.5 ${delta > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                              {delta > 0 ? '+' : ''}{delta} from default
                              {' '}({delta > 0 ? '+' : ''}€{(delta * li.unitPrice).toLocaleString()})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-sans text-xs text-muted-foreground w-10 text-right">
                            €{li.unitPrice}/unit
                          </span>
                          <button
                            onClick={() => updateQty(li.id, -1)}
                            disabled={li.quantity === 0}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`font-sans text-sm w-6 text-center font-medium ${li.quantity !== li.defaultQty ? 'text-accent' : ''}`}>
                            {li.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(li.id, 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/30 gap-4">
                <div>
                  <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
                    {pax} passengers
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-serif text-3xl text-foreground">€{totalPrice.toLocaleString()}</p>
                    {adjustment !== 0 && (
                      <p className={`font-sans text-sm ${adjustment > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        ({adjustment > 0 ? '+' : ''}€{adjustment.toLocaleString()} adj.)
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="navy" size="xl" onClick={handleAddToCart} className="gap-2 flex-shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuDetailDialog;
