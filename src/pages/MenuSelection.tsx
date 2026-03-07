import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MenuCard from '@/components/menu/MenuCard';
import MenuDetailDialog, { BackendBundleFull } from '@/components/menu/MenuDetailDialog';
import ItemCard from '@/components/menu/ItemCard';
import { menuTiers } from '@/data/menus';
import { useOrder } from '@/context/OrderContext';
import { useCart, CartBundle } from '@/context/CartContext';
import { MenuTier } from '@/types/catering';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';

interface BackendItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_active: boolean;
}

const bundleToMenuTier = (bundle: BackendBundleFull): MenuTier => ({
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

const CATEGORIES = ['All', 'Starter', 'Main', 'Dessert', 'Drink'];

const MenuSelection = () => {
  const navigate = useNavigate();
  const { selectedAirport } = useOrder();
  const { addBundle, openCart } = useCart();

  const [detailBundle, setDetailBundle] = useState<BackendBundleFull | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bundles, setBundles] = useState<BackendBundleFull[]>([]);
  const [menus, setMenus] = useState<MenuTier[]>([]);
  const [airportItems, setAirportItems] = useState<BackendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!selectedAirport) navigate('/');
  }, [selectedAirport, navigate]);

  useEffect(() => {
    if (!selectedAirport) return;

    const bundleUrl = selectedAirport.id
      ? `/api/v1/airports/${selectedAirport.id}/bundles`
      : '/api/v1/menu/bundles';
    const itemUrl = selectedAirport.id
      ? `/api/v1/airports/${selectedAirport.id}/items`
      : '/api/v1/menu/items';

    Promise.allSettled([
      api.get<BackendBundleFull[]>(bundleUrl),
      api.get<BackendItem[]>(itemUrl),
    ]).then(([bundleRes, itemRes]) => {
      if (bundleRes.status === 'fulfilled') {
        const active = bundleRes.value.filter(b => b.is_active);
        setBundles(active);
        setMenus(active.map(bundleToMenuTier));
      } else {
        setMenus(menuTiers);
      }
      if (itemRes.status === 'fulfilled') {
        setAirportItems(itemRes.value.filter(i => i.is_active));
      }
    }).finally(() => setIsLoading(false));
  }, [selectedAirport]);

  // Quick-add from MenuCard (no dialog) — adds with pax=2
  const handleAddToCart = (menu: MenuTier) => {
    const raw = bundles.find(b => b.id === menu.bundleId);
    if (!raw) return;
    const cartBundle: CartBundle = {
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      photoUrl: raw.photoUrl ?? undefined,
      paxCount: 2,
      basePrice: raw.price,
      lineItems: raw.items_in_bundle.map(bi => ({
        id: bi.item_id,
        name: bi.item.name,
        unitPrice: bi.item.price,
        defaultQty: bi.def_quality,
        quantity: bi.def_quality,
      })),
    };
    addBundle(cartBundle);
    openCart();
  };

  const handleViewDetails = (menu: MenuTier) => {
    const raw = bundles.find(b => b.id === menu.bundleId);
    if (raw) { setDetailBundle(raw); setIsDetailOpen(true); }
  };

  const filteredItems = activeCategory === 'All'
    ? airportItems
    : airportItems.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

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
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2 self-start">
              <ArrowLeft className="w-4 h-4" />
              Change Departure
            </Button>
            <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-full">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-sans text-sm">
                Departing from <span className="font-medium">{selectedAirport.city}</span>
              </span>
              <span className="font-serif font-medium text-accent">{selectedAirport.code}</span>
            </div>
          </motion.div>

          {/* Page header */}
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
              Select a curated menu package, or build your own with individual items below. Click "View Details" to customise quantities per passenger count.
            </p>
          </motion.div>

          {/* Bundle Cards */}
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
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Individual Items Section */}
          {!isLoading && airportItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16"
            >
              <div className="mb-8">
                <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">Individual Items</h2>
                <p className="font-sans text-muted-foreground text-sm">
                  Complement your menu or build a custom selection.
                </p>
              </div>

              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
                <TabsList className="flex-wrap h-auto gap-1">
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="font-sans text-sm">{cat}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {filteredItems.length === 0 ? (
                <p className="font-sans text-muted-foreground text-sm">No items in this category.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      category={item.category}
                      description={item.description || undefined}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <MenuDetailDialog
        bundle={detailBundle}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

export default MenuSelection;
