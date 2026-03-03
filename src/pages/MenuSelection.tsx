import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MenuCard from '@/components/menu/MenuCard';
import MenuDetailDialog from '@/components/menu/MenuDetailDialog';
import { menuTiers } from '@/data/menus';
import { useOrder } from '@/context/OrderContext';
import { MenuTier } from '@/types/catering';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface BackendBundle {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  is_active: boolean;
  items_in_bundle: { item_id: number; def_quality: number; item: { id: number; name: string; description: string | null } }[];
}

const bundleToMenuTier = (bundle: BackendBundle): MenuTier => ({
  id: String(bundle.id),
  bundleId: bundle.id,
  name: bundle.name,
  subtitle: 'Curated Experience',
  description: bundle.description || '',
  price: bundle.price,
  image: bundle.photoUrl || menuTiers[0]?.image || '',
  items: bundle.items_in_bundle.map(bi => ({
    id: String(bi.item_id),
    name: bi.item.name,
    description: bi.item.description || '',
    items: [],
  })),
});

const MenuSelection = () => {
  const navigate = useNavigate();
  const { selectedAirport, setSelectedMenu } = useOrder();
  const [detailMenu, setDetailMenu] = useState<MenuTier | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [menus, setMenus] = useState<MenuTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedAirport) {
      navigate('/');
    }
  }, [selectedAirport, navigate]);

  useEffect(() => {
    if (!selectedAirport) return;
    const url = selectedAirport.id
      ? `/api/v1/airports/${selectedAirport.id}/bundles`
      : '/api/v1/menu/bundles';
    api.get<BackendBundle[]>(url)
      .then(bundles => {
        setMenus(bundles.filter(b => b.is_active).map(bundleToMenuTier));
      })
      .catch(() => setMenus(menuTiers))
      .finally(() => setIsLoading(false));
  }, [selectedAirport]);

  const handleSelectMenu = (menu: MenuTier) => {
    setSelectedMenu(menu);
    navigate('/checkout');
  };

  const handleViewDetails = (menu: MenuTier) => {
    setDetailMenu(menu);
    setIsDetailOpen(true);
  };

  if (!selectedAirport) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container-luxury section-padding">
          {/* Back Button & Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Departure
            </Button>

            <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-full">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-sans text-sm">
                Departing from <span className="font-medium">{selectedAirport.city}</span>
              </span>
              <span className="font-serif font-medium text-accent">
                {selectedAirport.code}
              </span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              Choose Your Experience
            </h1>
            <p className="font-sans text-muted-foreground max-w-lg mx-auto">
              Select from our three curated menu tiers, each crafted to deliver an unforgettable 
              culinary journey above the clouds.
            </p>
          </motion.div>

          {/* Menu Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map(i => (
                <div key={i} className="card-luxury bg-card h-96 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-foreground mb-3">No menus available</p>
              <p className="font-sans text-muted-foreground">
                There are no catering options configured for {selectedAirport.city} yet.
                Please contact us directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {menus.map((menu, index) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  index={index}
                  onSelect={handleSelectMenu}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <MenuDetailDialog
        menu={detailMenu}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSelect={handleSelectMenu}
      />
    </div>
  );
};

export default MenuSelection;
