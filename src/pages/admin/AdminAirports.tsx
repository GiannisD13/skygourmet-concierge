import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Loader2, Plane, UtensilsCrossed, Package } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AirportItem {
  id: number;
  item: { id: number; name: string; category: string; price: number };
}

interface AirportBundle {
  id: number;
  bundle: { id: number; name: string; price: number };
}

interface Airport {
  id: number;
  name: string;
  code: string;
  city: string;
  is_active: boolean;
  airport_items: AirportItem[];
  airport_bundles: AirportBundle[];
}

interface MenuItem { id: number; name: string; category: string; is_active: boolean }
interface Bundle   { id: number; name: string; price: number; is_active: boolean }

interface AirportForm { name: string; code: string; city: string; is_active: boolean }
const emptyForm: AirportForm = { name: '', code: '', city: '', is_active: true };

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminAirports() {
  const { toast } = useToast();

  const [airports, setAirports]     = useState<Airport[]>([]);
  const [allItems, setAllItems]     = useState<MenuItem[]>([]);
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);
  const [loading, setLoading]       = useState(true);

  // CRUD dialog
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [form, setForm]                     = useState<AirportForm>(emptyForm);
  const [saving, setSaving]                 = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState<Airport | null>(null);

  // Manage dialog
  const [manageTarget, setManageTarget]   = useState<Airport | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [addItemId, setAddItemId]         = useState('');
  const [addBundleId, setAddBundleId]     = useState('');

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchAirports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Airport[]>('/api/v1/airports');
      setAirports(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load airports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchResources = useCallback(async () => {
    try {
      const [items, bundles] = await Promise.all([
        api.get<MenuItem[]>('/api/v1/menu/items?skip=0&limit=500'),
        api.get<Bundle[]>('/api/v1/menu/bundles'),
      ]);
      setAllItems(items.filter(i => i.is_active));
      setAllBundles(bundles.filter(b => b.is_active));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchAirports(); fetchResources(); }, [fetchAirports, fetchResources]);

  // Refresh manage dialog data after mutations
  const refreshManage = useCallback(async (airportId: number) => {
    setManageLoading(true);
    try {
      const detail = await api.get<Airport>(`/api/v1/airports/${airportId}`);
      setManageTarget(detail);
      // Also update the row in the table
      setAirports(prev => prev.map(a => a.id === airportId ? detail : a));
    } catch {
      toast({ title: 'Error', description: 'Failed to refresh airport', variant: 'destructive' });
    } finally {
      setManageLoading(false);
    }
  }, [toast]);

  // ── CRUD handlers ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingAirport(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (airport: Airport) => {
    setEditingAirport(airport);
    setForm({ name: airport.name, code: airport.code, city: airport.city, is_active: airport.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.city.trim()) {
      toast({ title: 'Validation', description: 'Name, code and city are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingAirport) {
        await api.patch(`/api/v1/airports/${editingAirport.id}`, form);
        toast({ title: 'Success', description: 'Airport updated' });
      } else {
        await api.post('/api/v1/airports', form);
        toast({ title: 'Success', description: 'Airport created' });
      }
      setDialogOpen(false);
      fetchAirports();
    } catch {
      toast({ title: 'Error', description: 'Failed to save airport', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/v1/airports/${deleteTarget.id}`);
      toast({ title: 'Success', description: 'Airport deactivated' });
      setDeleteTarget(null);
      fetchAirports();
    } catch {
      toast({ title: 'Error', description: 'Failed to deactivate airport', variant: 'destructive' });
    }
  };

  // ── Manage handlers ──────────────────────────────────────────────────────────

  const handleAssignItem = async () => {
    if (!manageTarget || !addItemId) return;
    try {
      await api.post(`/api/v1/airports/${manageTarget.id}/items/${addItemId}`);
      toast({ title: 'Success', description: 'Item assigned' });
      setAddItemId('');
      refreshManage(manageTarget.id);
    } catch {
      toast({ title: 'Error', description: 'Failed to assign item', variant: 'destructive' });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!manageTarget) return;
    try {
      await api.delete(`/api/v1/airports/${manageTarget.id}/items/${itemId}`);
      toast({ title: 'Success', description: 'Item removed' });
      refreshManage(manageTarget.id);
    } catch {
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const handleAssignBundle = async () => {
    if (!manageTarget || !addBundleId) return;
    try {
      await api.post(`/api/v1/airports/${manageTarget.id}/bundles/${addBundleId}`);
      toast({ title: 'Success', description: 'Bundle assigned' });
      setAddBundleId('');
      refreshManage(manageTarget.id);
    } catch {
      toast({ title: 'Error', description: 'Failed to assign bundle', variant: 'destructive' });
    }
  };

  const handleRemoveBundle = async (bundleId: number) => {
    if (!manageTarget) return;
    try {
      await api.delete(`/api/v1/airports/${manageTarget.id}/bundles/${bundleId}`);
      toast({ title: 'Success', description: 'Bundle removed' });
      refreshManage(manageTarget.id);
    } catch {
      toast({ title: 'Error', description: 'Failed to remove bundle', variant: 'destructive' });
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const assignedItemIds   = manageTarget?.airport_items.map(ai => ai.item.id) ?? [];
  const assignedBundleIds = manageTarget?.airport_bundles.map(ab => ab.bundle.id) ?? [];
  const availableItems    = allItems.filter(i => !assignedItemIds.includes(i.id));
  const availableBundles  = allBundles.filter(b => !assignedBundleIds.includes(b.id));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-semibold">Airports</h2>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Airport
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Bundles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {airports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No airports found.
                </TableCell>
              </TableRow>
            )}
            {airports.map(airport => (
              <TableRow key={airport.id}>
                <TableCell className="font-mono font-semibold text-base">{airport.code}</TableCell>
                <TableCell>{airport.name}</TableCell>
                <TableCell>{airport.city}</TableCell>
                <TableCell>{airport.airport_items.length}</TableCell>
                <TableCell>{airport.airport_bundles.length}</TableCell>
                <TableCell>
                  <Badge variant={airport.is_active ? 'default' : 'secondary'}>
                    {airport.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setManageTarget(airport); setAddItemId(''); setAddBundleId(''); }}>
                    <Plane className="h-4 w-4 mr-1" /> Manage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(airport)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteTarget(airport)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ── Create / Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAirport ? 'Edit Airport' : 'New Airport'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Thessaloniki Macedonia"
              />
            </div>
            <div className="grid gap-2">
              <Label>IATA Code</Label>
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SKG"
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Thessaloniki"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAirport ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Airport?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.code}) will no longer appear to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Manage Dialog (assign items / bundles) ────────────────────────────── */}
      <Dialog open={!!manageTarget} onOpenChange={o => !o && setManageTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {manageTarget?.city} ({manageTarget?.code}) — Manage Menu
            </DialogTitle>
          </DialogHeader>

          {manageLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 py-2">

              {/* Items */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="h-4 w-4" /> Items
                </h3>
                <div className="space-y-2 mb-3">
                  {(manageTarget?.airport_items.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">No items assigned.</p>
                  ) : (
                    manageTarget?.airport_items.map(ai => (
                      <div key={ai.id} className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                        <div>
                          <span className="text-sm font-medium">{ai.item.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{ai.item.category}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(ai.item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {availableItems.length > 0 && (
                  <div className="flex gap-2">
                    <Select value={addItemId} onValueChange={setAddItemId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map(item => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name} <span className="text-muted-foreground">({item.category})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssignItem} disabled={!addItemId}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Bundles */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4" /> Bundles
                </h3>
                <div className="space-y-2 mb-3">
                  {(manageTarget?.airport_bundles.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">No bundles assigned.</p>
                  ) : (
                    manageTarget?.airport_bundles.map(ab => (
                      <div key={ab.id} className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                        <div>
                          <span className="text-sm font-medium">{ab.bundle.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">€{ab.bundle.price.toLocaleString()}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveBundle(ab.bundle.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {availableBundles.length > 0 && (
                  <div className="flex gap-2">
                    <Select value={addBundleId} onValueChange={setAddBundleId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add bundle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBundles.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name} — €{b.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssignBundle} disabled={!addBundleId}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
