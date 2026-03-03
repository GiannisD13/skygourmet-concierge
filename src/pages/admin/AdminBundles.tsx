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

interface BundleItem { item_id: number; item_name?: string; def_quality: number; }
interface Bundle { id: number; name: string; description?: string; price: number; photo_url?: string; is_active: boolean; items: BundleItem[]; }
interface MenuItem { id: number; name: string; category: string; is_active: boolean; }

interface BundleForm {
  name: string; description: string; price: string; photo_url: string; is_active: boolean;
  items: { item_id: number; item_name: string; def_quality: number }[];
}

const emptyForm: BundleForm = { name: '', description: '', price: '', photo_url: '', is_active: true, items: [] };

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

  // Item adder state
  const [addItemId, setAddItemId] = useState('');
  const [addItemQty, setAddItemQty] = useState('1');

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
      name: b.name, description: b.description || '', price: String(b.price),
      photo_url: b.photo_url || '', is_active: b.is_active,
      items: b.items.map(i => ({ item_id: i.item_id, item_name: i.item_name || `Item #${i.item_id}`, def_quality: i.def_quality })),
    });
    setDialogOpen(true);
  };

  const addItemToForm = () => {
    const id = Number(addItemId);
    if (!id || form.items.some(i => i.item_id === id)) return;
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    setForm(f => ({ ...f, items: [...f.items, { item_id: id, item_name: item.name, def_quality: Math.max(1, Number(addItemQty) || 1) }] }));
    setAddItemId(''); setAddItemQty('1');
  };

  const removeItemFromForm = (itemId: number) => setForm(f => ({ ...f, items: f.items.filter(i => i.item_id !== itemId) }));
  const updateItemQty = (itemId: number, qty: number) => setForm(f => ({ ...f, items: f.items.map(i => i.item_id === itemId ? { ...i, def_quality: Math.max(1, qty) } : i) }));

  const handleSave = async () => {
    if (!form.name || !form.price || Number(form.price) < 0) {
      toast({ title: 'Validation', description: 'Name and price (≥0) are required', variant: 'destructive' });
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
        if ((form.photo_url || '') !== (editingBundle.photo_url || '')) body.photo_url = form.photo_url || undefined;
        if (form.is_active !== editingBundle.is_active) body.is_active = form.is_active;
        if (Object.keys(body).length) await api.patch(`/api/v1/menu/bundles/${editingBundle.id}`, body);

        // Sync items: remove old, add new
        const oldIds = new Set(editingBundle.items.map(i => i.item_id));
        const newIds = new Set(form.items.map(i => i.item_id));
        for (const old of editingBundle.items) {
          if (!newIds.has(old.item_id)) await api.delete(`/api/v1/menu/bundles/${editingBundle.id}/items/${old.item_id}`);
        }
        for (const item of form.items) {
          if (!oldIds.has(item.item_id)) await api.post(`/api/v1/menu/bundles/${editingBundle.id}/items`, { item_id: item.item_id, def_quality: item.def_quality });
        }
      } else {
        await api.post('/api/v1/menu/bundles', {
          name: form.name, description: form.description || undefined, price: Number(form.price),
          photo_url: form.photo_url || undefined, is_active: form.is_active,
          items: form.items.map(i => ({ item_id: i.item_id, def_quality: i.def_quality })),
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
                <TableHead className="text-right">Price</TableHead>
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
                  <TableCell className="text-center">{b.items?.length ?? 0}</TableCell>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBundle ? 'Edit Bundle' : 'New Bundle'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Price (€) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><Label>Photo URL</Label><Input value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>

            <div className="border-t pt-4 space-y-3">
              <Label className="text-base font-semibold">Bundle Items</Label>
              {form.items.length > 0 && (
                <div className="space-y-2">
                  {form.items.map(item => (
                    <div key={item.item_id} className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
                      <span className="flex-1 text-sm">{item.item_name}</span>
                      <Input type="number" min="1" className="w-20 h-8" value={item.def_quality} onChange={e => updateItemQty(item.item_id, Number(e.target.value))} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemFromForm(item.item_id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select value={addItemId} onValueChange={setAddItemId}>
                    <SelectTrigger><SelectValue placeholder="Select item..." /></SelectTrigger>
                    <SelectContent>
                      {availableItems.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input type="number" min="1" className="w-20" placeholder="Qty" value={addItemQty} onChange={e => setAddItemQty(e.target.value)} />
                <Button variant="outline" size="sm" onClick={addItemToForm} disabled={!addItemId}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingBundle ? 'Update' : 'Create'}</Button>
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
