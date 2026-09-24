import { NextRequest, NextResponse } from 'next/server';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { lifeItemPatch } from '@/lib/validation';
import { apiError } from '@/lib/http';
import { writeAudit } from '@/lib/audit';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireUser(); const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('life_items').select('*, attachments(*), reminders(*)').eq('id', params.id).eq('owner_id', user.id).single();
    if (error || !data) throw new Error('NOT_FOUND');
    return NextResponse.json({ data });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireUser(); const supabase = createAdminSupabase();
    const input = lifeItemPatch.parse(await request.json());
    const { action, reminders, ...changes } = input;
    if (action === 'complete') Object.assign(changes, { status: 'COMPLETED', completed_at: new Date().toISOString() });
    if (action === 'archive') Object.assign(changes, { status: 'ARCHIVED', archived_at: new Date().toISOString() });
    if (action === 'restore') Object.assign(changes, { status: 'UPCOMING', archived_at: null, completed_at: null });
    if (action === 'delete') Object.assign(changes, { deleted_at: new Date().toISOString() });
    if (action === 'undelete') Object.assign(changes, { deleted_at: null });
    const { data, error } = await supabase.from('life_items').update(changes).eq('id', params.id).eq('owner_id', user.id).select().single();
    if (error) throw error;
    if (reminders) {
      await supabase.from('reminders').delete().eq('life_item_id', params.id);
      if (reminders.length) await supabase.from('reminders').insert(reminders.map((r) => ({ ...r, life_item_id: params.id })));
    }
    await writeAudit(supabase, user.id, action || 'UPDATE', 'life_item', params.id, { fields: Object.keys(changes) });
    return NextResponse.json({ data });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireUser(); const supabase = createAdminSupabase();
    const { error } = await supabase.from('life_items').update({ deleted_at: new Date().toISOString() }).eq('id', params.id).eq('owner_id', user.id);
    if (error) throw error;
    await writeAudit(supabase, user.id, 'DELETE', 'life_item', params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
