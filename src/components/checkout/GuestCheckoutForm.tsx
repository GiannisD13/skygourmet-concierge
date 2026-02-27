import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Plane, Users, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutResponse {
  order_id: number;
  access_token: string;
  token_type: string;
  is_new_user: boolean;
}

const GuestCheckoutForm = () => {
  const { selectedMenu } = useOrder();
  const { setTokenAndFetchUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tail_number: '',
    passenger_count: 1,
    special_requirements: '',
  });
  const [flightDate, setFlightDate] = useState<Date | undefined>();
  const [flightTime, setFlightTime] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'passenger_count' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.phone.length < 10) {
      setError('Phone must be at least 10 characters');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!flightDate) {
      setError('Please select a flight date');
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
      const bundleId = selectedMenu?.bundleId;
      const body = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        tail_number: form.tail_number,
        passenger_count: form.passenger_count,
        flight_date: combinedDate.toISOString(),
        bundles: bundleId ? [bundleId] : [],
        custom_items: [],
      };

      const res = await api.post<CheckoutResponse>('/api/v1/orders/checkout', body);

      // Store token and update auth state
      localStorage.setItem('auth_token', res.access_token);
      await setTokenAndFetchUser(res.access_token);

      navigate('/confirmation', { state: { orderId: res.order_id } });
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
      {/* Your Details */}
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-card">
        <h3 className="font-serif text-xl text-foreground mb-6 flex items-center gap-3">
          <User className="w-5 h-5 text-accent" />
          Your Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Full Name *</label>
            <div className="relative">
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" className={inputClass} required />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Email *</label>
            <div className="relative">
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputClass} required />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Phone *</label>
            <div className="relative">
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+30 210 123 4567" className={inputClass} required minLength={10} />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" className={inputClass} required minLength={8} />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-sans text-sm text-muted-foreground mb-2">Confirm Password *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={inputClass} required minLength={8} />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
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
              <input type="text" name="tail_number" value={form.tail_number} onChange={handleChange} placeholder="e.g., SX-ABC" className={inputClass} required />
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm text-muted-foreground mb-2">Passengers *</label>
            <div className="relative">
              <input type="number" name="passenger_count" value={form.passenger_count} onChange={handleChange} min={1} max={50} className={inputClass} required />
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
              <input type="time" name="flightTime" value={flightTime} onChange={(e) => setFlightTime(e.target.value)} className={inputClass} />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-sans text-sm text-muted-foreground mb-2">Special Requirements</label>
          <div className="relative">
            <textarea name="special_requirements" value={form.special_requirements} onChange={handleChange} placeholder="Allergies, dietary requirements, plating instructions..." rows={3} className="input-luxury pl-10 resize-none" />
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
          `Complete Order • €${selectedMenu ? (selectedMenu.price * form.passenger_count).toLocaleString() : 0}`
        )}
      </Button>

      <p className="text-center font-sans text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline font-medium">Login →</Link>
      </p>
    </motion.form>
  );
};

export default GuestCheckoutForm;
