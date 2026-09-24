import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {requireUser} from '@/lib/supabase/server';
import {apiError} from '@/lib/http';
const schema=z.object({attachmentId:z.string().uuid().nullable().optional(),extraction:z.record(z.unknown()),corrections:z.record(z.unknown()).optional(),helpful:z.boolean()});
export async function POST(request:NextRequest){try{const{supabase,user}=await requireUser();const input=schema.parse(await request.json());const{error}=await supabase.from('extraction_feedback').insert({owner_id:user.id,attachment_id:input.attachmentId||null,extraction:input.extraction,corrections:input.corrections||null,helpful:input.helpful});if(error)throw error;return NextResponse.json({ok:true},{status:201});}catch(error){return apiError(error);}}
export async function GET(){try{const{supabase,user}=await requireUser();const{data,error}=await supabase.from('extraction_feedback').select('*').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(50);if(error)throw error;return NextResponse.json({data});}catch(error){return apiError(error);}}
