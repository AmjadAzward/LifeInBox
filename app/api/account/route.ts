import { NextResponse } from 'next/server';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
export async function DELETE(){try{const {user}=await requireUser();const db=createAdminSupabase();const {data:files}=await db.from('attachments').select('storage_path').eq('owner_id',user.id);if(files?.length)await db.storage.from('documents').remove(files.map(f=>f.storage_path));const {error}=await db.auth.admin.deleteUser(user.id);if(error)throw error;return new NextResponse(null,{status:204});}catch(e){return apiError(e);}}
