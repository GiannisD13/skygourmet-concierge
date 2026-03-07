import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartBundleLineItem {
  id: number;        // item_id
  name: string;
  unitPrice: number; // item.price
  defaultQty: number;// admin-set qty for selected paxCount
  quantity: number;  // current qty (user-adjusted in dialog)
}

export interface CartBundle {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
  paxCount: number;
  basePrice: number;        // admin-set bundle price for paxCount
  lineItems: CartBundleLineItem[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

/** Price of a bundle = basePrice + Σ (qty - defaultQty) * unitPrice for each lineItem */
export function calcBundlePrice(bundle: CartBundle): number {
  const adjustment = bundle.lineItems.reduce(
    (sum, li) => sum + (li.quantity - li.defaultQty) * li.unitPrice,
    0
  );
  return Math.max(0, bundle.basePrice + adjustment);
}

interface CartContextType {
  cartBundles: CartBundle[];
  cartItems: CartItem[];
  isOpen: boolean;
  totalAmount: number;
  totalCount: number;
  addBundle: (bundle: CartBundle) => void;
  removeBundle: (id: number) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, qty: number) => void;
  updateItemQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartBundles, setCartBundles] = useState<CartBundle[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const totalAmount =
    cartBundles.reduce((sum, b) => sum + calcBundlePrice(b), 0) +
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const totalCount =
    cartBundles.length + cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const addBundle = (bundle: CartBundle) => {
    setCartBundles(prev => {
      // replace if same bundle id already in cart
      if (prev.find(b => b.id === bundle.id)) {
        return prev.map(b => b.id === bundle.id ? bundle : b);
      }
      return [...prev, bundle];
    });
  };

  const removeBundle = (id: number) => {
    setCartBundles(prev => prev.filter(b => b.id !== id));
  };

  const addItem = (item: Omit<CartItem, 'quantity'>, qty: number) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateItemQty = (id: number, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => { setCartBundles([]); setCartItems([]); };
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider value={{
      cartBundles, cartItems, isOpen, totalAmount, totalCount,
      addBundle, removeBundle, addItem, updateItemQty, removeItem,
      clearCart, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
