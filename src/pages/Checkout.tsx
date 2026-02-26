import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import GuestCheckoutForm from '@/components/checkout/GuestCheckoutForm';
import AuthCheckoutForm from '@/components/checkout/AuthCheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const navigate = useNavigate();
  const { selectedAirport, selectedMenu } = useOrder();
  const { isAuthenticated } = useAuth();

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
        <div className="container-luxury section-padding">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </Button>
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
              {isAuthenticated
                ? 'Enter your flight details to finalize your catering reservation.'
                : 'Create an account and enter your flight details to place your order.'}
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {isAuthenticated ? <AuthCheckoutForm /> : <GuestCheckoutForm />}
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
