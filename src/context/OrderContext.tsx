import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Airport, OrderDetails } from '@/types/catering';

interface OrderContextType {
  selectedAirport: Airport | null;
  orderDetails: Partial<OrderDetails>;
  setSelectedAirport: (airport: Airport) => void;
  updateOrderDetails: (details: Partial<OrderDetails>) => void;
  resetOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [orderDetails, setOrderDetails] = useState<Partial<OrderDetails>>({});

  const updateOrderDetails = (details: Partial<OrderDetails>) => {
    setOrderDetails((prev) => ({ ...prev, ...details }));
  };

  const resetOrder = () => {
    setSelectedAirport(null);
    setOrderDetails({});
  };

  return (
    <OrderContext.Provider
      value={{
        selectedAirport,
        orderDetails,
        setSelectedAirport,
        updateOrderDetails,
        resetOrder,
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
