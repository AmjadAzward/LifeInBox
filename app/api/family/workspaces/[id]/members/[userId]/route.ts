import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

async function assertOwner(workspaceId: string) {
  const context = await requireUser();
  const { data } = await context.supabase.from('workspaces').select('id').eq('id', workspaceId).eq('owner_id', context.user.id).single();
  if (!data) throw new Error('NOT_FOUND');
  return context;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const { supabase } = await assertOwner(params.id);
    const { role } = z.object({ role: z.enum(['ADMIN','MEMBER']) }).parse(await request.json());
    const { error } = await supabase.from('workspace_members').update({ role }).eq('workspace_id', params.id).eq('user_id', params.userId).neq('role', 'OWNER');
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const { supabase } = await assertOwner(params.id);
    const { error } = await supabase.from('workspace_members').delete().eq('workspace_id', params.id).eq('user_id', params.userId).neq('role', 'OWNER');
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
