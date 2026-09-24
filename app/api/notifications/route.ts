import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
export async function GET() {
  try { const { supabase, user } = await requireUser(); const { data, error } = await supabase.from('notifications').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }); if (error) throw error; return NextResponse.json({ data }, { headers: { 'cache-control': 'private, no-store' } }); } catch (e) { return apiError(e); }
}
export async function PATCH(request: NextRequest) {
  try { const { supabase, user } = await requireUser(); const body = await request.json(); let q = supabase.from('notifications').update({ read: true }).eq('owner_id', user.id); if (!body.all) q = q.eq('id', body.id); const { error } = await q; if (error) throw error; return NextResponse.json({ ok: true }); } catch (e) { return apiError(e); }
}
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Notification id is required.' }, { status: 400 });
    const { error } = await supabase.from('notifications').delete().eq('id', id).eq('owner_id', user.id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (e) { return apiError(e); }
}
