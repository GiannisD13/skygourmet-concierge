import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_COLORS: Record<string, string> = {
  starter: 'bg-blue-100 text-blue-700',
  main: 'bg-amber-100 text-amber-700',
  dessert: 'bg-pink-100 text-pink-700',
  drink: 'bg-emerald-100 text-emerald-700',
};

interface ItemCardProps {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ id, name, price, category, description }) => {
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addItem({ id, name, price, category }, qty);
    openCart();
    toast({ title: `${name} added to cart`, description: `${qty}x — €${(price * qty).toLocaleString()}` });
  };

  const colorClass = CATEGORY_COLORS[category.toLowerCase()] ?? 'bg-secondary text-foreground';

  return (
    <div className="bg-card rounded-lg shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-medium text-foreground leading-tight">{name}</p>
          {description && (
            <p className="font-sans text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
        <span className={`text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>
          {category}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 mt-auto">
        <p className="font-serif text-lg text-foreground">€{price.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-sans text-sm w-4 text-center">{qty}</span>
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <Button variant="navy" size="sm" onClick={handleAdd} className="gap-1.5 ml-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
