import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plane, Users, Calendar, ChevronDown, ChevronUp, Package, Loader2, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  bundle_id: number | null;
  item: {
    id: number;
    name: string;
    category: string;
    price: number;
  };
}

interface Order {
  id: number;
  user_id: string;
  tail_number: string;
  passenger_count: number;
  flight_date: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [detailCache, setDetailCache] = useState<Record<number, Order>>({});
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get<Order[]>('/api/v1/orders/?skip=0&limit=50')
      .then(setOrders)
      .catch(() => toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const toggleDetails = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!detailCache[orderId]) {
      setDetailLoading(orderId);
      try {
        const detail = await api.get<Order>(`/api/v1/orders/${orderId}`);
        setDetailCache(prev => ({ ...prev, [orderId]: detail }));
      } catch {
        toast({ title: 'Error', description: 'Failed to load order details', variant: 'destructive' });
      } finally {
        setDetailLoading(null);
      }
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.delete(`/api/v1/orders/${cancelId}/cancel`);
      setOrders(prev => prev.map(o => o.id === cancelId ? { ...o, status: 'cancelled' } : o));
      setDetailCache(prev => {
        const copy = { ...prev };
        delete copy[cancelId];
        return copy;
      });
      toast({ title: 'Order cancelled' });
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel order', variant: 'destructive' });
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-luxury pt-28 pb-16 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-semibold text-primary mb-8">My Orders</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center gap-4">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
                <p className="text-muted-foreground text-lg">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/')} className="btn-navy mt-2">
                  Place your first order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const sc = statusConfig[order.status] || statusConfig.draft;
                const detail = detailCache[order.id];
                const isExpanded = expandedId === order.id;

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg font-serif">Order #{order.id}</CardTitle>
                        <Badge className={sc.className}>{sc.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Plane className="w-4 h-4" />
                          <span>{order.tail_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{order.passenger_count} pax</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.flight_date)}</span>
                        </div>
                        <div className="font-semibold text-primary text-right">
                          €{order.total_amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button variant="outline" size="sm" onClick={() => toggleDetails(order.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </Button>
                        {order.status === 'pending' && (
                          <Button variant="destructive" size="sm" onClick={() => setCancelId(order.id)}>
                            Cancel Order
                          </Button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-3" />
                            {detailLoading === order.id ? (
                              <div className="flex justify-center py-6">
                                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              </div>
                            ) : detail ? (
                              <div className="space-y-2">
                                {/* Group by bundle */}
                                {(() => {
                                  const bundled = detail.order_items.filter(i => i.bundle_id);
                                  const standalone = detail.order_items.filter(i => !i.bundle_id);
                                  const bundleGroups: Record<number, OrderItem[]> = {};
                                  bundled.forEach(i => {
                                    if (!bundleGroups[i.bundle_id!]) bundleGroups[i.bundle_id!] = [];
                                    bundleGroups[i.bundle_id!].push(i);
                                  });

                                  return (
                                    <>
                                      {Object.entries(bundleGroups).map(([bid, items]) => (
                                        <div key={bid} className="bg-secondary/50 rounded-md p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-4 h-4 text-accent" />
                                            <span className="font-medium text-sm">Bundle #{bid}</span>
                                          </div>
                                          {items.map(it => (
                                            <div key={it.id} className="flex justify-between text-sm pl-6 py-0.5">
                                              <span>{it.item.name} × {it.quantity}</span>
                                              <span className="text-muted-foreground">€{(it.unit_price * it.quantity).toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                      {standalone.map(it => (
                                        <div key={it.id} className="flex justify-between text-sm py-1">
                                          <span>{it.item.name} × {it.quantity}</span>
                                          <span className="text-muted-foreground">€{(it.unit_price * it.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </>
                                  );
                                })()}
                                <Separator />
                                <div className="flex justify-between font-semibold text-primary">
                                  <span>Total</span>
                                  <span>€{detail.total_amount.toFixed(2)}</span>
                                </div>
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      <AlertDialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order #{cancelId}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The order will be marked as cancelled.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling} className="bg-destructive text-destructive-foreground">
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
