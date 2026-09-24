'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AcceptInvitationPage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const accept = async () => {
    setLoading(true);
    const response = await fetch(`/api/family/invites/${token}/accept`, { method: 'POST' });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || 'This invitation is invalid, expired, or belongs to another email address.'); setLoading(false); return; }
    router.replace('/app/family');
  };
  return <main className="grid min-h-screen place-items-center bg-background p-4"><div className="w-full max-w-md rounded-xl border bg-card p-6 text-center"><h1 className="text-2xl font-bold">Family invitation</h1><p className="mt-2 text-sm text-muted-foreground">Accept this invitation to share LifeInbox items with your family.</p>{message && <p className="mt-4 text-sm text-destructive">{message}</p>}<Button className="mt-6 w-full" disabled={loading} onClick={accept}>{loading ? 'Accepting...' : 'Accept invitation'}</Button></div></main>;
}
