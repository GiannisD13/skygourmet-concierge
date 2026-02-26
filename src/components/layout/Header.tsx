import { motion } from 'framer-motion';
import { Plane, Phone, LogIn, User, ChevronDown, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isHome ? 'bg-transparent' : 'bg-card/95 backdrop-blur-md shadow-elegant'
      }`}
    >
      <div className="container-luxury">
        <div className="flex items-center justify-between h-20 px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Plane className="w-8 h-8 text-accent transform -rotate-45 transition-transform group-hover:rotate-0" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold tracking-tight text-primary">
                SkyGourmet
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Concierge
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="tel:+302101234567"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline font-sans">+30 210 123 4567</span>
            </a>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 font-sans text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user?.full_name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="flex items-center gap-2 font-sans text-sm">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
