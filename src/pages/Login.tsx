import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Plane, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
      setIsSubmitting(false);
      return;
    }

    // login sets token, user will be fetched async — we need to wait for it
    // Small delay to let the user state populate
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  // Redirect once user is loaded after login
  if (user) {
    if (user.is_admin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/menu', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <Plane className="w-8 h-8 text-accent transform -rotate-45 transition-transform group-hover:rotate-0" />
            <span className="font-serif text-2xl font-semibold text-primary">SkyGourmet</span>
          </Link>
          <p className="mt-3 font-sans text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="card-luxury p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-sans text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans text-sm text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-luxury"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-sans text-sm text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-luxury pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-navy py-3"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Continue as guest
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
