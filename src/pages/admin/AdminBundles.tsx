import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';

const PAX = [2, 4, 6, 8, 10] as const;
type PaxCount = typeof PAX[number];

interface BundleItemRow {
  item_id: number;
  item_name: string;
  def_quality: number;      // qty for 2 pax
  qty_4: number | null;
  qty_6: number | null;
  qty_8: number | null;
  qty_10: number | null;
}

interface BackendBundleItem {
  item_id: number;
  def_quality: number;
  qty_4: number | null;
  qty_6: number | null;
  qty_8: number | null;
  qty_10: number | null;
  item?: { id: number; name: string };
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  price: number;       // price for 2 pax
  price_4?: number | null;
  price_6?: number | null;
  price_8?: number | null;
  price_10?: number | null;
  photoUrl?: string;
  is_active: boolean;
  items_in_bundle: BackendBundleItem[];
}

interface MenuItem { id: number; name: string; category: string; is_active: boolean; }

interface BundleForm {
  name: string;
  description: string;
  price: string;       // price for 2 pax
  price_4: string;
  price_6: string;
  price_8: string;
  price_10: string;
  photoUrl: string;
  is_active: boolean;
  items: BundleItemRow[];
}

const emptyForm: BundleForm = {
  name: '', description: '', price: '', price_4: '', price_6: '', price_8: '', price_10: '',
  photoUrl: '', is_active: true, items: [],
};

function numOrNull(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function intOrNull(val: number | null | undefined): number | null {
  return val == null ? null : val;
}

export default function AdminBundles() {
  const { toast } = useToast();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [form, setForm] = useState<BundleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);

  const [addItemId, setAddItemId] = useState('');

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Bundle[]>('/api/v1/menu/bundles');
      setBundles(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load bundles', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.get<MenuItem[]>('/api/v1/menu/items?skip=0&limit=500');
      setAllItems(data.filter(i => i.is_active));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchBundles(); fetchItems(); }, [fetchBundles, fetchItems]);

  const openCreate = () => { setEditingBundle(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (b: Bundle) => {
    setEditingBundle(b);
    setForm({
      name: b.name,
      description: b.description || '',
      price: String(b.price),
      price_4: b.price_4 != null ? String(b.price_4) : '',
      price_6: b.price_6 != null ? String(b.price_6) : '',
      price_8: b.price_8 != null ? String(b.price_8) : '',
      price_10: b.price_10 != null ? String(b.price_10) : '',
      photoUrl: b.photoUrl || '',
      is_active: b.is_active,
      items: b.items_in_bundle.map(i => ({
        item_id: i.item_id,
        item_name: i.item?.name || `Item #${i.item_id}`,
        def_quality: i.def_quality,
        qty_4: i.qty_4 ?? null,
        qty_6: i.qty_6 ?? null,
        qty_8: i.qty_8 ?? null,
        qty_10: i.qty_10 ?? null,
      })),
    });
    setDialogOpen(true);
  };

  const addItemToForm = () => {
    const id = Number(addItemId);
    if (!id || form.items.some(i => i.item_id === id)) return;
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    setForm(f => ({
      ...f,
      items: [...f.items, { item_id: id, item_name: item.name, def_quality: 1, qty_4: null, qty_6: null, qty_8: null, qty_10: null }],
    }));
    setAddItemId('');
  };

  const removeItemFromForm = (itemId: number) =>
    setForm(f => ({ ...f, items: f.items.filter(i => i.item_id !== itemId) }));

  const updateItemQtyField = (itemId: number, field: keyof BundleItemRow, value: string) => {
    setForm(f => ({
      ...f,
      items: f.items.map(i => {
        if (i.item_id !== itemId) return i;
        if (field === 'def_quality') return { ...i, def_quality: Math.max(1, Number(value) || 1) };
        const n = value === '' ? null : Math.max(1, Number(value) || 1);
        return { ...i, [field]: n };
      }),
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || Number(form.price) < 0) {
      toast({ title: 'Validation', description: 'Name and price for 2 pax (≥0) are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingBundle) {
        // Update bundle info
        const body: Record<string, unknown> = {};
        if (form.name !== editingBundle.name) body.name = form.name;
        if ((form.description || '') !== (editingBundle.description || '')) body.description = form.description || undefined;
        if (Number(form.price) !== editingBundle.price) body.price = Number(form.price);
        body.price_4  = numOrNull(form.price_4);
        body.price_6  = numOrNull(form.price_6);
        body.price_8  = numOrNull(form.price_8);
        body.price_10 = numOrNull(form.price_10);
        if ((form.photoUrl || '') !== (editingBundle.photoUrl || '')) body.photoUrl = form.photoUrl || undefined;
        if (form.is_active !== editingBundle.is_active) body.is_active = form.is_active;
        if (Object.keys(body).length) await api.patch(`/api/v1/menu/bundles/${editingBundle.id}`, body);

        // Sync items
        const oldItems = editingBundle.items_in_bundle;
        const oldIds = new Set(oldItems.map(i => i.item_id));
        const newIds = new Set(form.items.map(i => i.item_id));

        for (const old of oldItems) {
          if (!newIds.has(old.item_id)) {
            await api.delete(`/api/v1/menu/bundles/${editingBundle.id}/items/${old.item_id}`);
          }
        }
        for (const item of form.items) {
          const oldItem = oldItems.find(o => o.item_id === item.item_id);
          const payload = {
            item_id: item.item_id,
            def_quality: item.def_quality,
            qty_4: intOrNull(item.qty_4),
            qty_6: intOrNull(item.qty_6),
            qty_8: intOrNull(item.qty_8),
            qty_10: intOrNull(item.qty_10),
          };
          if (!oldIds.has(item.item_id)) {
            await api.post(`/api/v1/menu/bundles/${editingBundle.id}/items`, payload);
          } else {
            // check if anything changed
            const changed =
              oldItem?.def_quality !== item.def_quality ||
              oldItem?.qty_4 !== item.qty_4 ||
              oldItem?.qty_6 !== item.qty_6 ||
              oldItem?.qty_8 !== item.qty_8 ||
              oldItem?.qty_10 !== item.qty_10;
            if (changed) {
              await api.delete(`/api/v1/menu/bundles/${editingBundle.id}/items/${item.item_id}`);
              await api.post(`/api/v1/menu/bundles/${editingBundle.id}/items`, payload);
            }
          }
        }
      } else {
        await api.post('/api/v1/menu/bundles', {
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
          price_4: numOrNull(form.price_4),
          price_6: numOrNull(form.price_6),
          price_8: numOrNull(form.price_8),
          price_10: numOrNull(form.price_10),
          photoUrl: form.photoUrl || undefined,
          is_active: form.is_active,
          items: form.items.map(i => ({
            item_id: i.item_id,
            def_quality: i.def_quality,
            qty_4: intOrNull(i.qty_4),
            qty_6: intOrNull(i.qty_6),
            qty_8: intOrNull(i.qty_8),
            qty_10: intOrNull(i.qty_10),
          })),
        });
      }
      toast({ title: 'Success', description: editingBundle ? 'Bundle updated' : 'Bundle created' });
      setDialogOpen(false);
      fetchBundles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Save failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/v1/menu/bundles/${deleteTarget.id}`);
      toast({ title: 'Success', description: 'Bundle deleted' });
      setDeleteTarget(null);
      fetchBundles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Delete failed', variant: 'destructive' });
    }
  };

  const availableItems = allItems.filter(i => !form.items.some(fi => fi.item_id === i.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-serif font-semibold">Bundles</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Bundle</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price (2 pax)</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No bundles found</TableCell></TableRow>
              ) : bundles.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-right">€{b.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{b.items_in_bundle?.length ?? 0}</TableCell>
                  <TableCell><Badge variant={b.is_active ? 'default' : 'secondary'}>{b.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(b)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBundle ? 'Edit Bundle' : 'New Bundle'}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Photo URL</Label><Input value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>

            {/* Pricing per passenger count */}
            <div className="border-t pt-4 space-y-3">
              <Label className="text-base font-semibold">Pricing per Passenger Count</Label>
              <p className="text-xs text-muted-foreground">Leave blank to auto-calculate (linear scaling from 2-pax price).</p>
              <div className="grid grid-cols-5 gap-2">
                {PAX.map(n => (
                  <div key={n}>
                    <Label className="text-xs">{n} pax {n === 2 ? '*' : ''}</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={n === 2 ? form.price : form[`price_${n}` as keyof BundleForm] as string}
                      onChange={e => {
                        const field = n === 2 ? 'price' : `price_${n}`;
                        setForm(f => ({ ...f, [field]: e.target.value }));
                      }}
                      placeholder={n === 2 ? 'Required' : 'Auto'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bundle Items */}
            <div className="border-t pt-4 space-y-3">
              <Label className="text-base font-semibold">Bundle Items & Quantities</Label>
              <p className="text-xs text-muted-foreground">Set quantity per passenger count for each item. Leave blank to auto-scale.</p>

              {form.items.length > 0 && (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_repeat(5,48px)_32px] gap-1 text-xs text-muted-foreground px-3">
                    <span>Item</span>
                    {PAX.map(n => <span key={n} className="text-center">{n}p</span>)}
                    <span />
                  </div>
                  {form.items.map(item => (
                    <div key={item.item_id} className="grid grid-cols-[1fr_repeat(5,48px)_32px] gap-1 items-center bg-muted rounded-md px-3 py-2">
                      <span className="text-sm truncate">{item.item_name}</span>
                      {PAX.map(n => {
                        const field = n === 2 ? 'def_quality' : `qty_${n}` as keyof BundleItemRow;
                        const val = n === 2 ? item.def_quality : (item[field as 'qty_4'] ?? '');
                        return (
                          <Input
                            key={n}
                            type="number" min="1"
                            className="h-8 px-1 text-center text-sm"
                            value={val === null ? '' : val}
                            placeholder={n === 2 ? '—' : 'auto'}
                            onChange={e => updateItemQtyField(item.item_id, field, e.target.value)}
                          />
                        );
                      })}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemFromForm(item.item_id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select value={addItemId} onValueChange={setAddItemId}>
                    <SelectTrigger><SelectValue placeholder="Select item to add..." /></SelectTrigger>
                    <SelectContent>
                      {availableItems.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={addItemToForm} disabled={!addItemId}>Add Item</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBundle ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the bundle.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
