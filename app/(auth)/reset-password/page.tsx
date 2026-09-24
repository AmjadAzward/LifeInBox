'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); if (password.length < 8) return setMessage('Password must be at least 8 characters.'); setLoading(true); const { error } = await createClient().auth.updateUser({ password }); setLoading(false); if (error) return setMessage(error.message); router.push('/app'); router.refresh(); }
  return <form onSubmit={submit} className="space-y-5"><div><h1 className="text-2xl font-bold">Choose a new password</h1><p className="text-sm text-muted-foreground mt-1">Use at least eight characters.</p></div><div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>{message && <p className="text-sm text-destructive">{message}</p>}<Button className="w-full" disabled={loading}>{loading ? 'Saving…' : 'Save password'}</Button></form>;
}
