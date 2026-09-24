import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
export async function GET() {
  try { const {supabase,user}=await requireUser(); const [profile,items,notifications,workspaces]=await Promise.all([
    supabase.from('profiles').select('*, user_preferences(*)').eq('id',user.id).single(),
    supabase.from('life_items').select('*, attachments(*), reminders(*)').eq('owner_id',user.id),
    supabase.from('notifications').select('*').eq('owner_id',user.id),
    supabase.from('workspace_members').select('*, workspaces(*)').eq('user_id',user.id),
  ]); const body=JSON.stringify({exported_at:new Date().toISOString(),profile:profile.data,life_items:items.data,notifications:notifications.data,workspaces:workspaces.data},null,2);
    return new NextResponse(body,{headers:{'content-type':'application/json','content-disposition':`attachment; filename="lifeinbox-export-${new Date().toISOString().slice(0,10)}.json"`}});
  } catch(e){return apiError(e);}
}
