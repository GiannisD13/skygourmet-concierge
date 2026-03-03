import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Shield, ShieldOff, Trash2, Loader2 } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  created_at?: string;
}

type ConfirmAction = { type: 'admin'; user: User; makeAdmin: boolean } | { type: 'delete'; user: User };

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<User[]>('/api/v1/users/?skip=0&limit=100');
      setUsers(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'admin') {
        await api.patch(`/api/v1/users/${confirm.user.id}/admin?is_admin=${confirm.makeAdmin}`);
        toast({ title: 'Success', description: `${confirm.user.full_name} ${confirm.makeAdmin ? 'is now admin' : 'admin removed'}` });
      } else {
        await api.delete(`/api/v1/users/${confirm.user.id}`);
        toast({ title: 'Success', description: 'User deleted' });
      }
      setConfirm(null);
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Action failed', variant: 'destructive' });
    }
  };

  const confirmTitle = confirm
    ? confirm.type === 'admin'
      ? confirm.makeAdmin ? `Make "${confirm.user.full_name}" an admin?` : `Remove admin from "${confirm.user.full_name}"?`
      : `Delete "${confirm.user.full_name}"?`
    : '';

  const confirmDesc = confirm
    ? confirm.type === 'delete' ? 'This is permanent and cannot be undone.' : 'This will change their access level.'
    : '';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold">Users</h2>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
              ) : users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || '—'}</TableCell>
                  <TableCell><Badge variant={u.is_admin ? 'default' : 'secondary'}>{u.is_admin ? 'Admin' : 'User'}</Badge></TableCell>
                  <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title={u.is_admin ? 'Remove Admin' : 'Make Admin'} onClick={() => setConfirm({ type: 'admin', user: u, makeAdmin: !u.is_admin })}>
                      {u.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirm({ type: 'delete', user: u })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={confirm?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
