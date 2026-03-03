import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  photoUrl?: string;
  is_active: boolean;
}

interface ItemForm {
  name: string;
  category: string;
  price: string;
  description: string;
  photoUrl: string;
  is_active: boolean;
}

const emptyForm: ItemForm = { name: '', category: '', price: '', description: '', photoUrl: '', is_active: true };
const categories = ['starter', 'main', 'dessert', 'drink'];

export default function AdminItems() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<MenuItem[]>(`/api/v1/menu/items?search=${encodeURIComponent(search)}&skip=0&limit=100`);
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load items', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = categoryFilter === 'all' ? items : items.filter(i => i.category === categoryFilter);

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description || '', photoUrl: item.photoUrl || '', is_active: item.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price || Number(form.price) <= 0) {
      toast({ title: 'Validation', description: 'Name, category, and price (>0) are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name: form.name, category: form.category, price: Number(form.price), description: form.description || undefined, photoUrl: form.photoUrl || undefined, is_active: form.is_active };
      if (editingItem) {
        const changed: Record<string, unknown> = {};
        for (const key of Object.keys(body)) {
          if (body[key] !== (editingItem as unknown as Record<string, unknown>)[key]) changed[key] = body[key];
        }
        if (Object.keys(changed).length) await api.patch(`/api/v1/menu/items/${editingItem.id}`, changed);
      } else {
        await api.post('/api/v1/menu/items', body);
      }
      toast({ title: 'Success', description: editingItem ? 'Item updated' : 'Item created' });
      setDialogOpen(false);
      fetchItems();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/v1/menu/items/${deleteTarget.id}`);
      toast({ title: 'Success', description: 'Item deleted' });
      setDeleteTarget(null);
      fetchItems();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-serif font-semibold">Menu Items</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Item</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No items found</TableCell></TableRow>
              ) : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell className="text-right">€{item.price.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Item' : 'New Item'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Category *</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Price (€) *</Label><Input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Photo URL</Label><Input value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the item. This action can be undone by an admin.</AlertDialogDescription>
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
