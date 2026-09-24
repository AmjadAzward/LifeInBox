import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
import { writeAudit } from '@/lib/audit';

const schema = z.object({ ids:z.array(z.string().uuid()).min(1).max(100), action:z.enum(['complete','archive','restore','delete']) });
export async function PATCH(request:NextRequest) {
  try {
    const { user } = await requireUser(); const db=createAdminSupabase(); const {ids,action}=schema.parse(await request.json());
    const now=new Date().toISOString();
    const changes = action==='complete' ? {status:'COMPLETED',completed_at:now} : action==='archive' ? {status:'ARCHIVED',archived_at:now} : action==='delete' ? {deleted_at:now} : {status:'UPCOMING',completed_at:null,archived_at:null,deleted_at:null};
    const {data,error}=await db.from('life_items').update(changes).in('id',ids).eq('owner_id',user.id).select('id'); if(error)throw error;
    await writeAudit(db,user.id,`BULK_${action.toUpperCase()}`,'life_item',null,{ids:(data||[]).map((item)=>item.id)});
    return NextResponse.json({updated:data?.length||0});
  } catch(error){return apiError(error);}
}
