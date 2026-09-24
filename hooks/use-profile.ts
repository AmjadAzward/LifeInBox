'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  country: string;
  timezone: string;
  image_url: string | null;
  user_preferences?: any;
}

let profileCache: ProfileData | null = null;
let profileCacheTime = 0;
let profileRequest: Promise<ProfileData> | null = null;

async function sessionProfile(): Promise<ProfileData | null> {
  try {
    const { data } = await createClient().auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      email: user.email || '',
      country: user.user_metadata?.country || '',
      timezone: user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      image_url: null,
    };
  } catch { return null; }
}

async function remoteProfile(force = false) {
  if (!force && profileCache && Date.now() - profileCacheTime < 60_000) return profileCache;
  if (profileRequest) return profileRequest;
  profileRequest = fetch('/api/me', { cache: 'no-store' }).then(async (response) => {
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load profile.');
    profileCache = result.data;
    profileCacheTime = Date.now();
    return profileCache!;
  }).finally(() => { profileRequest = null; });
  return profileRequest;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(profileCache);
  const [loading, setLoading] = useState(!profileCache);
  const [error, setError] = useState('');
  const load = useCallback(async (force = false) => {
    if (!profileCache) setLoading(true);
    try {
      if (!profileCache) {
        const local = await sessionProfile();
        if (local) { profileCache = local; setProfile(local); setLoading(false); }
      }
      setProfile(await remoteProfile(force)); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load profile.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(false); }, [load]);
  const refresh = useCallback(() => load(true), [load]);
  return { profile, loading, error, refresh };
}
