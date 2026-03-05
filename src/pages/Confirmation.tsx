import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, MapPin, Phone, MessageCircle, Calendar, Plane, Users, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface OrderItemDetail {
  id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  bundle_id: number | null;
  item: { id: number; name: string; description: string | null };
}

interface OrderDetail {
  id: number;
  tail_number: string;
  passenger_count: number;
  flight_date: string;
  total_amount: number;
  status: string;
  order_items: OrderItemDetail[];
}

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedAirport, resetOrder } = useOrder();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    api.get<OrderDetail>(`/api/v1/orders/${orderId}`)
      .then(setOrder)
      .catch(() => navigate('/'))
      .finally(() => setIsLoading(false));
  }, [orderId, navigate]);

  const handleNewOrder = () => {
    resetOrder();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-luxury section-padding max-w-2xl space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-24 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container-luxury section-padding max-w-2xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8"
          >
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Order Confirmed
            </h1>
            <p className="font-sans text-muted-foreground">
              Thank you for your order. Your culinary experience awaits.
            </p>
            <p className="font-sans text-sm text-muted-foreground mt-1">
              Order #{order.id}
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg shadow-card p-6 md:p-8 mb-8"
          >
            <h2 className="font-serif text-xl text-foreground mb-6">Order Details</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Plane className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-muted-foreground">Aircraft</p>
                  <p className="font-medium">{order.tail_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-muted-foreground">Flight Date</p>
                  <p className="font-medium">
                    {new Date(order.flight_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-muted-foreground">Passengers</p>
                  <p className="font-medium">{order.passenger_count}</p>
                </div>
              </div>

              {order.order_items.length > 0 && (
                <div className="pt-4 border-t border-border space-y-2">
                  <p className="font-sans text-sm text-muted-foreground mb-2">Items</p>
                  {order.order_items.map(oi => (
                    <div key={oi.id} className="flex justify-between items-center">
                      <span className="font-medium text-sm">{oi.item.name} × {oi.quantity}</span>
                      <span className="text-sm text-muted-foreground">
                        €{(oi.unit_price * oi.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <p className="font-medium">Total</p>
                <p className="font-serif text-2xl text-foreground">
                  €{order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pickup Location */}
          {selectedAirport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary text-primary-foreground rounded-lg p-6 md:p-8 mb-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-xl mb-2">Pickup Location</h3>
                  <p className="font-medium text-lg">{selectedAirport.city} ({selectedAirport.code})</p>
                  {selectedAirport.pickupLocation && (
                    <p className="text-primary-foreground/80 mt-1">
                      {selectedAirport.pickupLocation}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative h-40 rounded-lg overflow-hidden bg-primary-foreground/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm text-primary-foreground/70">
                      {selectedAirport.name}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-serif text-lg text-center text-foreground mb-4">
              Need Assistance?
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <a
                href="tel:+302101234567"
                className="flex items-center justify-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-secondary transition-colors"
              >
                <Phone className="w-5 h-5 text-accent" />
                <span className="font-sans text-sm font-medium">Call Dispatch</span>
              </a>

              <a
                href="https://wa.me/302101234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-secondary transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-accent" />
                <span className="font-sans text-sm font-medium">WhatsApp Support</span>
              </a>
            </div>

            <Button
              variant="navy-outline"
              size="lg"
              className="w-full mt-6"
              onClick={handleNewOrder}
            >
              <Home className="w-4 h-4 mr-2" />
              Place New Order
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
