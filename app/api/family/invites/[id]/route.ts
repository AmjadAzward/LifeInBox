import { NextRequest,NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

export async function DELETE(_:NextRequest,{params}:{params:{id:string}}){try{const{supabase,user}=await requireUser();const{error}=await supabase.from('workspace_invites').delete().eq('id',params.id).eq('created_by',user.id).is('accepted_at',null);if(error)throw error;return new NextResponse(null,{status:204});}catch(error){return apiError(error);}}
export async function POST(_:NextRequest,{params}:{params:{id:string}}){try{const{supabase,user}=await requireUser();const{data,error}=await supabase.from('workspace_invites').select('*,workspaces(name)').eq('id',params.id).eq('created_by',user.id).is('accepted_at',null).single();if(error||!data)throw new Error('NOT_FOUND');if(process.env.RESEND_API_KEY)await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.REMINDER_FROM_EMAIL!,to:data.email,subject:`Join ${data.workspaces.name} on LifeInbox`,text:`Accept your invitation: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${data.token}`});return NextResponse.json({ok:true});}catch(error){return apiError(error);}}
