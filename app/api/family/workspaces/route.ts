import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data: workspaces, error } = await supabase.from('workspaces').select('*').order('created_at');
    if (error) throw error;
    const ids = (workspaces || []).map((workspace) => workspace.id);
    const { data: members, error: memberError } = ids.length
      ? await supabase.from('workspace_members').select('workspace_id,user_id,role,joined_at,profiles(full_name,email,image_url)').in('workspace_id', ids)
      : { data: [], error: null };
    if (memberError) throw memberError;
    return NextResponse.json({ data: (workspaces || []).map((workspace) => ({ ...workspace, is_owner: workspace.owner_id === user.id, members: (members || []).filter((member: any) => member.workspace_id === workspace.id) })) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { name } = z.object({ name: z.string().trim().min(1).max(100) }).parse(await request.json());
    const { data, error } = await supabase.from('workspaces').insert({ name, owner_id: user.id }).select().single();
    if (error) throw error;
    const { error: memberError } = await supabase.from('workspace_members').insert({ workspace_id: data.id, user_id: user.id, role: 'OWNER' });
    if (memberError) throw memberError;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
