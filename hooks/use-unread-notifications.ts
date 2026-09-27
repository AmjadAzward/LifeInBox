'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const NOTIFICATIONS_CHANGED_EVENT = 'lifeinbox:notifications-changed';

let cachedCount = 0;
let cachedAt = 0;
let pendingRequest: Promise<number> | null = null;

async function loadUnreadCount(force = false) {
  if (!force && Date.now() - cachedAt < 15_000) return cachedCount;
  if (pendingRequest) return pendingRequest;
  pendingRequest = fetch('/api/notifications/unread-count', { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) throw new Error('Unable to load notifications.');
      const result = await response.json();
      cachedCount = result.count || 0;
      cachedAt = Date.now();
      return cachedCount;
    })
    .finally(() => { pendingRequest = null; });
  return pendingRequest;
}

export function notifyNotificationChange() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const refresh = useCallback(async (force = false) => {
    try { setUnreadCount(await loadUnreadCount(force)); } catch {}
  }, []);
  useEffect(() => {
    refresh(false);
    const refreshNow = () => { refresh(true); };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshNow);
    window.addEventListener('focus', refreshNow);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshNow);
      window.removeEventListener('focus', refreshNow);
    };
  }, [refresh]);
  useEffect(()=>{
    const supabase=createClient();
    let channel:ReturnType<typeof supabase.channel>|undefined;
    let cancelled=false;
    supabase.auth.getSession().then(({data})=>{
      const user = data.session?.user;
      if(cancelled||!user)return;
      channel=supabase
        .channel(`notifications:${user.id}:${crypto.randomUUID()}`)
        .on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`owner_id=eq.${user.id}`},()=>refresh(true))
        .subscribe();
    });
    return()=>{
      cancelled=true;
      if(channel)void supabase.removeChannel(channel);
    };
  },[refresh]);
  return { unreadCount, refresh };
}
