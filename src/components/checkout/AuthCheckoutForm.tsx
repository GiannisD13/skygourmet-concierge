import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Users, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const AuthCheckoutForm = () => {
  const { selectedMenu } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tailNumber, setTailNumber] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [flightDate, setFlightDate] = useState<Date | undefined>();
  const [flightTime, setFlightTime] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tailNumber || !flightDate) {
      setError('Please fill in all required fields');
      return;
    }

    const now = new Date();
    const combinedDate = new Date(flightDate);
    if (flightTime) {
      const [h, m] = flightTime.split(':').map(Number);
      combinedDate.setHours(h, m, 0, 0);
    }
    if (combinedDate <= now) {
      setError('Flight date must be in the future');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create draft
      const draft = await api.post<{ id: number }>('/api/v1/orders/draft');

      // 2. Add bundle
      const bundleId = selectedMenu?.bundleId;
      if (bundleId) {
        await api.post(`/api/v1/orders/draft/bundles/${bundleId}`);
      }

      // 3. Update details
      await api.patch('/api/v1/orders/draft/details', {
        tail_number: tailNumber,
        passenger_count: passengerCount,
        flight_date: combinedDate.toISOString(),
      });

      // 4. Confirm
      await api.post('/api/v1/orders/draft/confirm');

      navigate('/confirmation', { state: { orderId: draft.id } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'input-luxury pl-10';

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Greeting */}
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-card">
        <h3 className="font-serif text-xl text-foreground mb-2">
          Welcome back, {user?.full_name}
        </h3>
        <p className="font-sans text-sm text-muted-foreground">
          Your account details will be used for this order.
        </p>
      </div>

      {/* Flight Details */}
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-card">
        <h3 className="font-serif text-xl text-foreground mb-6 flex items-center gap-3">
          <Plane className="w-5 h-5 text-accent" />
          Flight Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Tail Number *</label>
            <div className="relative">
              <input type="text" value={tailNumber} onChange={e => setTailNumber(e.target.value)} placeholder="e.g., SX-ABC" className={inputClass} required />
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Passengers *</label>
            <div className="relative">
              <input type="number" value={passengerCount} onChange={e => setPassengerCount(Number(e.target.value))} min={1} max={50} className={inputClass} required />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Flight Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className={cn(inputClass, 'text-left flex items-center', !flightDate && 'text-muted-foreground')}>
                  <CalendarIcon className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  {flightDate ? format(flightDate, 'PPP') : 'Pick a date'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={flightDate}
                  onSelect={setFlightDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Flight Time</label>
            <div className="relative">
              <input type="time" value={flightTime} onChange={e => setFlightTime(e.target.value)} className={inputClass} />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-sans text-sm text-muted-foreground mb-2">Special Requirements</label>
          <div className="relative">
            <textarea value={specialRequirements} onChange={e => setSpecialRequirements(e.target.value)} placeholder="Allergies, dietary requirements, plating instructions..." rows={3} className="input-luxury pl-10 resize-none" />
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive font-sans">
          {error}
        </div>
      )}

      <Button type="submit" variant="navy" size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
        ) : (
          `Complete Order • €${selectedMenu ? (selectedMenu.price * passengerCount).toLocaleString() : 0}`
        )}
      </Button>
    </motion.form>
  );
};

export default AuthCheckoutForm;
