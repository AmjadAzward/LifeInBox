'use client';
import { useCallback, useEffect, useState } from 'react';
import type { LifeItem } from '@/lib/types';
import { toLifeItem } from '@/lib/api-types';

let itemCache: LifeItem[] = [];
let cacheTime = 0;
let allItemsRequest: Promise<LifeItem[]> | null = null;
const itemRequests = new Map<string, Promise<LifeItem>>();
const CACHE_TTL = 60_000;

async function fetchAllItems(force = false) {
  if (!force && itemCache.length && Date.now() - cacheTime < CACHE_TTL) return itemCache;
  if (allItemsRequest) return allItemsRequest;
  allItemsRequest = fetch('/api/life-items', { cache: 'no-store' }).then(async (response) => {
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load items.');
    itemCache = (result.data || []).map(toLifeItem);
    cacheTime = Date.now();
    return itemCache;
  }).finally(() => { allItemsRequest = null; });
  return allItemsRequest;
}

async function fetchOneItem(id: string) {
  const pending = itemRequests.get(id);
  if (pending) return pending;
  const request = fetch(`/api/life-items/${id}`, { cache: 'no-store' }).then(async (response) => {
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load item.');
    const item = toLifeItem(result.data);
    const index = itemCache.findIndex((cached) => cached.id === id);
    if (index >= 0) itemCache[index] = item;
    else itemCache.unshift(item);
    return item;
  }).finally(() => { itemRequests.delete(id); });
  itemRequests.set(id, request);
  return request;
}

export function useLifeItems() {
  const [items, setItems] = useState<LifeItem[]>(itemCache);
  const [loading, setLoading] = useState(itemCache.length === 0);
  const [error, setError] = useState('');
  const load = useCallback(async (force = false) => {
    if (!itemCache.length) setLoading(true);
    try { setItems(await fetchAllItems(force)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load items.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(false); }, [load]);
  const refresh = useCallback(() => load(true), [load]);
  return { items, loading, error, refresh };
}

export function useLifeItem(id: string) {
  const cached = itemCache.find((entry) => entry.id === id) || null;
  const [item, setItem] = useState<LifeItem | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const load = useCallback(async (showLoading: boolean) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try { setItem(await fetchOneItem(id)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load item.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => {
    const cachedItem = itemCache.find((entry) => entry.id === id);
    if (cachedItem) { setItem(cachedItem); setLoading(false); load(false); }
    else load(true);
  }, [id, load]);
  const refresh = useCallback(() => load(false), [load]);
  return { item, loading, error, refresh };
}
