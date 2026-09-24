import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
const schema = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) });
export async function POST(request: NextRequest) {
  try { const { supabase, user } = await requireUser(); const v = schema.parse(await request.json()); const { error } = await supabase.from('push_subscriptions').upsert({ owner_id: user.id, endpoint: v.endpoint, p256dh: v.keys.p256dh, auth: v.keys.auth }, { onConflict: 'endpoint' }); if (error) throw error; return NextResponse.json({ ok: true }); } catch (e) { return apiError(e); }
}
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { endpoint } = z.object({ endpoint: z.string().url() }).parse(await request.json());
    const { error } = await supabase.from('push_subscriptions').delete().eq('owner_id', user.id).eq('endpoint', endpoint);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (e) { return apiError(e); }
}
