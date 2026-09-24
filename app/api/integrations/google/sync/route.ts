import { NextResponse } from 'next/server';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { GOOGLE_CALENDAR_PROVIDER, googleAccessToken, googleRequest } from '@/lib/google-calendar';
import { apiError } from '@/lib/http';

export const runtime = 'nodejs';

function eventDate(item: any) { return item.event_date || item.due_date || item.expiry_date; }
function googleEvent(item: any) {
  const date = eventDate(item);
  const time = item.event_time || item.due_time || item.expiry_time;
  const common = { summary: item.title, description: item.description || undefined, location: item.location || undefined, extendedProperties: { private: { lifeinboxItemId: item.id } } };
  if (time) {
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { ...common, start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } };
  }
  const next = new Date(`${date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  return { ...common, start: { date }, end: { date: next.toISOString().slice(0, 10) } };
}

export async function POST() {
  try {
    const { user } = await requireUser();
    const db = createAdminSupabase();
    const { token, connection } = await googleAccessToken(user.id);
    const [{ data: items, error: itemsError }, { data: links, error: linksError }] = await Promise.all([
      db.from('life_items').select('id,title,description,location,due_date,event_date,expiry_date,due_time,event_time,expiry_time,status,updated_at').eq('owner_id', user.id).is('deleted_at', null).not('status', 'in', '(ARCHIVED,COMPLETED)'),
      db.from('calendar_sync_links').select('*').eq('owner_id', user.id).eq('provider', GOOGLE_CALENDAR_PROVIDER),
    ]);
    if (itemsError) throw itemsError; if (linksError) throw linksError;
    const byItem = new Map((links || []).map((link: any) => [link.life_item_id, link]));
    let created = 0, updated = 0, skipped = 0;
    for (const item of items || []) {
      if (!eventDate(item)) { skipped++; continue; }
      const link: any = byItem.get(item.id);
      if (!link) {
        const event = await googleRequest(token, `/calendars/${encodeURIComponent(connection.calendar_id || 'primary')}/events`, { method: 'POST', body: JSON.stringify(googleEvent(item)) });
        const { error } = await db.from('calendar_sync_links').insert({ owner_id: user.id, life_item_id: item.id, provider: GOOGLE_CALENDAR_PROVIDER, external_event_id: event.id, external_etag: event.etag, last_synced_at: new Date().toISOString() });
        if (error) throw error; created++;
      } else if (new Date(item.updated_at).getTime() > new Date(link.last_synced_at).getTime()) {
        const event = await googleRequest(token, `/calendars/${encodeURIComponent(connection.calendar_id || 'primary')}/events/${encodeURIComponent(link.external_event_id)}`, { method: 'PATCH', body: JSON.stringify(googleEvent(item)) });
        await db.from('calendar_sync_links').update({ external_etag: event.etag, last_synced_at: new Date().toISOString() }).eq('id', link.id); updated++;
      } else skipped++;
    }
    await db.from('integration_connections').update({ updated_at: new Date().toISOString() }).eq('owner_id', user.id).eq('provider', GOOGLE_CALENDAR_PROVIDER);
    return NextResponse.json({ ok: true, created, updated, skipped });
  } catch (error) { return apiError(error); }
}
