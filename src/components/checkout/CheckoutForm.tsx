import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, Clock, User, FileText, Users, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CheckoutForm = () => {
  const { selectedAirport, selectedMenu, updateOrderDetails } = useOrder();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tailNumber: '',
    flightDate: '',
    deliveryTime: '',
    attendantName: '',
    passengerCount: 4,
    specialRequirements: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tailNumber || !formData.flightDate || !formData.deliveryTime || !formData.attendantName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    updateOrderDetails({
      tailNumber: formData.tailNumber,
      flightDate: formData.flightDate,
      deliveryTime: formData.deliveryTime,
      attendantName: formData.attendantName,
      passengerCount: formData.passengerCount,
      specialRequirements: formData.specialRequirements,
    });

    setIsProcessing(false);
    navigate('/confirmation');
  };

  const totalPrice = selectedMenu ? selectedMenu.price * formData.passengerCount : 0;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Flight Details */}
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-card">
        <h3 className="font-serif text-xl text-foreground mb-6 flex items-center gap-3">
          <Plane className="w-5 h-5 text-accent" />
          Flight Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Tail Number (Aircraft Registration) *
            </label>
            <div className="relative">
              <input
                type="text"
                name="tailNumber"
                value={formData.tailNumber}
                onChange={handleChange}
                placeholder="e.g., SX-ABC"
                className="input-luxury pl-10"
                required
              />
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Date of Flight *
            </label>
            <div className="relative">
              <input
                type="date"
                name="flightDate"
                value={formData.flightDate}
                onChange={handleChange}
                className="input-luxury pl-10"
                required
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Delivery / Pickup Time *
            </label>
            <div className="relative">
              <input
                type="time"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                className="input-luxury pl-10"
                required
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Lead Flight Attendant Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="attendantName"
                value={formData.attendantName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input-luxury pl-10"
                required
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Number of Guests
            </label>
            <div className="relative">
              <select
                name="passengerCount"
                value={formData.passengerCount}
                onChange={handleChange}
                className="input-luxury pl-10 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-sans text-sm text-muted-foreground mb-2">
            Special Requirements (Allergies, Dietary Restrictions, Plating Instructions)
          </label>
          <div className="relative">
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              placeholder="Please specify any allergies, dietary requirements, or special plating instructions..."
              rows={3}
              className="input-luxury pl-10 resize-none"
            />
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-card">
        <h3 className="font-serif text-xl text-foreground mb-6 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-accent" />
          Payment Details
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="4242 4242 4242 4242"
                className="input-luxury pl-10"
                maxLength={19}
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-sm text-muted-foreground mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                className="input-luxury"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-muted-foreground mb-2">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                className="input-luxury"
                maxLength={4}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Your payment details are encrypted and secure</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-secondary/50 rounded-lg p-6 md:p-8">
        <h3 className="font-serif text-xl text-foreground mb-4">Order Summary</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Departure</span>
            <span className="font-medium">{selectedAirport?.city} ({selectedAirport?.code})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Menu</span>
            <span className="font-medium">{selectedMenu?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Guests</span>
            <span className="font-medium">{formData.passengerCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per Guest</span>
            <span className="font-medium">€{selectedMenu?.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-end">
            <span className="font-serif text-lg">Total</span>
            <span className="font-serif text-3xl text-foreground">
              €{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="navy"
        size="xl"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Complete Order • €${totalPrice.toLocaleString()}`}
      </Button>
    </motion.form>
  );
};

export default CheckoutForm;
