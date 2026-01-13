import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const navigate = useNavigate();
  const { selectedAirport, selectedMenu } = useOrder();

  useEffect(() => {
    if (!selectedAirport || !selectedMenu) {
      navigate('/');
    }
  }, [selectedAirport, selectedMenu, navigate]);

  if (!selectedAirport || !selectedMenu) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container-luxury section-padding max-w-3xl">
          {/* Back Button & Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </Button>

            <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-full">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-sans text-sm">
                {selectedAirport.city} • {selectedMenu.name}
              </span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Complete Your Order
            </h1>
            <p className="font-sans text-muted-foreground">
              Enter your flight details to finalize your catering reservation.
            </p>
          </motion.div>

          <CheckoutForm />
        </div>
      </main>
    </div>
  );
};

export default Checkout;
