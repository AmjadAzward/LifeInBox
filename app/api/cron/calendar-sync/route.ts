import { NextRequest,NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { GOOGLE_CALENDAR_PROVIDER } from '@/lib/google-calendar';
import { syncGoogleCalendar } from '@/lib/google-calendar-sync';
export const runtime='nodejs';
export async function POST(request:NextRequest){
  if(!process.env.CRON_SECRET||request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=createAdminSupabase(),{data,error}=await db.from('integration_connections').select('owner_id').eq('provider',GOOGLE_CALENDAR_PROVIDER);if(error)throw error;
  const results=[];for(const connection of data||[]){try{results.push({ownerId:connection.owner_id,...await syncGoogleCalendar(connection.owner_id)});}catch(error){results.push({ownerId:connection.owner_id,error:error instanceof Error?error.message:'Calendar synchronization failed.'});}}
  return NextResponse.json({processed:results.length,results});
}
