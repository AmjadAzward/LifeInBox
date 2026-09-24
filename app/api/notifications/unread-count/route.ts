import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { count, error } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('read', false);
    if (error) throw error;
    return NextResponse.json({ count: count || 0 }, { headers: { 'cache-control': 'private, no-store' } });
  } catch (error) { return apiError(error); }
}
