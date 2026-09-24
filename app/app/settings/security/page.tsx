'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function SecurityPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const updatePassword = async (event: FormEvent) => {
    event.preventDefault(); setMessage('');
    if (password.length < 8) return setMessage('Use at least 8 characters.');
    if (password !== confirm) return setMessage('Passwords do not match.');
    const { error } = await createClient().auth.updateUser({ password });
    if (error) return setMessage(error.message);
    setPassword(''); setConfirm(''); setMessage('Password updated.');
  };
  const signOutOthers = async () => {
    const { error } = await createClient().auth.signOut({ scope: 'others' });
    setMessage(error ? error.message : 'Other sessions have been signed out.');
  };
  return <div><MobileHeader title="Security" showBack backHref="/app/settings"/><div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8"><div><h1 className="text-2xl font-bold">Password and sessions</h1><p className="mt-1 text-sm text-muted-foreground">Protect your account and revoke access from other devices.</p></div>{message&&<p role="status" className="rounded-lg bg-muted p-3 text-sm">{message}</p>}<form onSubmit={updatePassword} className="space-y-4 rounded-xl border bg-card p-4"><div className="flex items-center gap-2"><KeyRound className="h-4 w-4"/><h2 className="font-semibold">Change password</h2></div><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}/></div><Button type="submit">Update password</Button></form><div className="rounded-xl border bg-card p-4"><div className="flex items-center gap-2"><LogOut className="h-4 w-4"/><h2 className="font-semibold">Other devices</h2></div><p className="mt-2 text-sm text-muted-foreground">Revoke refresh tokens for every session except this browser.</p><Button className="mt-4" variant="outline" onClick={signOutOthers}>Sign out other devices</Button></div></div></div>;
}
