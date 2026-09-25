import { NextRequest, NextResponse } from 'next/server';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { lifeItemInput } from '@/lib/validation';
import { apiError } from '@/lib/http';
import { zonedDateTimeToUtc } from '@/lib/date-time';

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const supabase = createAdminSupabase();
    const status = request.nextUrl.searchParams.get('status');
    const category = request.nextUrl.searchParams.get('category');
    const search = request.nextUrl.searchParams.get('q');
    let query = supabase.from('life_items').select('*, attachments(*), reminders(*)').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) query = query.textSearch('search_vector', search, { type: 'websearch' });
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const supabase = createAdminSupabase();
    const raw = await request.json();
    const attachmentIds = Array.isArray(raw.attachmentIds) ? raw.attachmentIds.filter((id: unknown) => typeof id === 'string') : [];
    const input = lifeItemInput.parse(raw);
    let { reminders, ...item } = input;
    if (!reminders.length) {
      const { data: preference } = await supabase.from('user_preferences').select('reminder_defaults,default_notification_time,timezone').eq('user_id', user.id).single();
      const offsets = preference?.reminder_defaults?.[item.category] as number[] | undefined;
      const date = item.due_date || item.event_date || item.expiry_date;
      if (date && offsets?.length) {
        const base = zonedDateTimeToUtc(date, preference?.default_notification_time || '08:00', preference?.timezone || 'UTC');
        reminders = offsets.map((minutes) => ({ remind_at: new Date(base.getTime() - minutes * 60_000).toISOString(), channel: 'BOTH' as const }));
      }
    }
    const { data, error } = await supabase.from('life_items').insert({ ...item, owner_id: user.id }).select().single();
    if (error) throw error;
    if (reminders.length) {
      const { error: reminderError } = await supabase.from('reminders').insert(reminders.map((r) => ({ ...r, life_item_id: data.id })));
      if (reminderError) throw reminderError;
    }
    if (attachmentIds.length) await supabase.from('attachments').update({ life_item_id: data.id }).in('id', attachmentIds).eq('owner_id', user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
