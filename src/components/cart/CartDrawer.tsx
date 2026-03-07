import { useNavigate, Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingCart, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart, calcBundlePrice } from '@/context/CartContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cartBundles, cartItems, isOpen, totalAmount,
    removeBundle, updateItemQty, removeItem, clearCart, closeCart,
  } = useCart();

  const isEmpty = cartBundles.length === 0 && cartItems.length === 0;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) closeCart(); }}>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
            <p className="font-serif text-lg text-foreground">Your cart is empty</p>
            <p className="font-sans text-sm text-muted-foreground">
              Add menus or individual items to get started.
            </p>
            <Button variant="ghost" asChild className="text-accent hover:text-accent" onClick={closeCart}>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Menus section */}
              {cartBundles.length > 0 && (
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Menus
                  </h3>
                  <div className="space-y-3">
                    {cartBundles.map(bundle => (
                      <div
                        key={bundle.id}
                        className="flex items-start justify-between gap-3 bg-secondary/40 rounded-lg p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-base text-foreground leading-tight">{bundle.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="font-sans text-xs text-muted-foreground">{bundle.paxCount} passengers</span>
                          </div>
                          <p className="font-serif text-sm text-accent mt-1">
                            €{calcBundlePrice(bundle).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeBundle(bundle.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                          aria-label="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Items section */}
              {cartItems.length > 0 && (
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Extra Items
                  </h3>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-secondary/40 rounded-lg p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-foreground leading-tight">{item.name}</p>
                          <p className="font-sans text-xs text-muted-foreground mt-0.5 capitalize">{item.category}</p>
                          <p className="font-serif text-sm text-accent mt-1">
                            €{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateItemQty(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQty(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="font-serif text-2xl text-foreground">€{totalAmount.toLocaleString()}</span>
              </div>
              <Button variant="navy" size="xl" className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <button
                onClick={clearCart}
                className="w-full font-sans text-xs text-muted-foreground hover:text-destructive transition-colors text-center"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
