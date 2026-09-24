import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema=z.object({workspaceId:z.string().uuid(),email:z.string().email(),role:z.enum(['ADMIN','MEMBER']).default('MEMBER')});
export async function GET(){try{const{supabase,user}=await requireUser();const{data,error}=await supabase.from('workspace_invites').select('*,workspaces(name)').eq('created_by',user.id).is('accepted_at',null).order('created_at',{ascending:false});if(error)throw error;return NextResponse.json({data});}catch(error){return apiError(error);}}
export async function POST(request:NextRequest){
  try{
    const{supabase,user}=await requireUser(); const limited=rateLimit(`invite:${user.id}`,10,60_000); if(limited)return limited;
    const v=schema.parse(await request.json()); const{data:workspace}=await supabase.from('workspaces').select('id,name').eq('id',v.workspaceId).eq('owner_id',user.id).single(); if(!workspace)throw new Error('NOT_FOUND');
    const{data,error}=await supabase.from('workspace_invites').insert({workspace_id:v.workspaceId,email:v.email,role:v.role,created_by:user.id}).select().single(); if(error)throw error;
    if(process.env.RESEND_API_KEY)await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.REMINDER_FROM_EMAIL!,to:v.email,subject:`Join ${workspace.name} on LifeInbox`,text:`You were invited to a LifeInbox family. Accept: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${data.token}`});
    return NextResponse.json({data},{status:201});
  }catch(e){return apiError(e);}
}
