import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Pencil, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, setTokenAndFetchUser, token } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });

  const startEdit = () => {
    if (!user) return;
    setForm({ full_name: user.full_name, email: user.email, phone: user.phone });
    setEditing(true);
    setError('');
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;
    setError('');
    // Only send changed fields
    const body: Record<string, string> = {};
    if (form.full_name !== user.full_name) body.full_name = form.full_name;
    if (form.email !== user.email) body.email = form.email;
    if (form.phone !== user.phone) body.phone = form.phone;

    if (Object.keys(body).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await api.patch('/api/v1/users/me', body);
      // Re-fetch user to update AuthContext
      if (token) await setTokenAndFetchUser(token);
      toast({ title: 'Profile updated successfully' });
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-luxury pt-28 pb-16 px-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-semibold text-primary mb-8">My Profile</h1>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl font-serif">{user.full_name}</CardTitle>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" onClick={startEdit}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
              )}

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="btn-navy">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Full Name</p>
                    <p className="text-foreground">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
