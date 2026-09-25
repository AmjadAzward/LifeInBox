import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { syncGoogleCalendar } from '@/lib/google-calendar-sync';
import { apiError } from '@/lib/http';
export const runtime='nodejs';
export async function POST(request:Request){try{const body=await request.json().catch(()=>({}));const conflictPolicy=body.conflictPolicy==='local'||body.conflictPolicy==='google'?body.conflictPolicy:null;const{user}=await requireUser();return NextResponse.json(await syncGoogleCalendar(user.id,conflictPolicy));}catch(error){return apiError(error);}}
