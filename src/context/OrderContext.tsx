import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Airport, MenuTier, OrderDetails } from '@/types/catering';

interface OrderContextType {
  selectedAirport: Airport | null;
  selectedMenu: MenuTier | null;
  orderDetails: Partial<OrderDetails>;
  setSelectedAirport: (airport: Airport) => void;
  setSelectedMenu: (menu: MenuTier) => void;
  updateOrderDetails: (details: Partial<OrderDetails>) => void;
  resetOrder: () => void;
  isOrderComplete: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuTier | null>(null);
  const [orderDetails, setOrderDetails] = useState<Partial<OrderDetails>>({});
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  const updateOrderDetails = (details: Partial<OrderDetails>) => {
    setOrderDetails((prev) => ({ ...prev, ...details }));
    if (details.tailNumber && details.flightDate && details.deliveryTime && details.attendantName) {
      setIsOrderComplete(true);
    }
  };

  const resetOrder = () => {
    setSelectedAirport(null);
    setSelectedMenu(null);
    setOrderDetails({});
    setIsOrderComplete(false);
  };

  return (
    <OrderContext.Provider
      value={{
        selectedAirport,
        selectedMenu,
        orderDetails,
        setSelectedAirport,
        setSelectedMenu,
        updateOrderDetails,
        resetOrder,
        isOrderComplete,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
