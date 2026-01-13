import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { MenuTier } from '@/types/catering';
import { Button } from '@/components/ui/button';

interface MenuDetailDialogProps {
  menu: MenuTier | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (menu: MenuTier) => void;
}

const MenuDetailDialog: React.FC<MenuDetailDialogProps> = ({
  menu,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!menu) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:max-h-[85vh] bg-card rounded-lg shadow-hover z-50 overflow-hidden flex flex-col"
          >
            {/* Header Image */}
            <div className="relative h-48 md:h-56 flex-shrink-0">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-accent mb-1">
                  {menu.subtitle}
                </p>
                <h2 className="font-serif text-3xl text-foreground">
                  {menu.name}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <p className="font-sans text-muted-foreground mb-8">
                {menu.description}
              </p>

              <div className="space-y-8">
                {menu.items.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      {section.name}
                    </h3>
                    <p className="font-sans text-sm text-accent mb-4">
                      {section.description}
                    </p>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="font-sans text-sm text-muted-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/30">
              <div>
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
                  Per Guest
                </p>
                <p className="font-serif text-3xl text-foreground">
                  €{menu.price.toLocaleString()}
                </p>
              </div>
              <Button
                variant="navy"
                size="xl"
                onClick={() => {
                  onSelect(menu);
                  onClose();
                }}
              >
                Add to Flight
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuDetailDialog;
