import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
const prefs = z.object({ push_enabled:z.boolean(), email_enabled:z.boolean(), morning_summary:z.boolean(), weekly_summary:z.boolean(), default_notification_time:z.string().regex(/^\d\d:\d\d/), timezone:z.string().max(100), theme:z.enum(['light','dark','system']), language:z.string().min(2).max(10), locale:z.string().min(2).max(20), currency:z.string().length(3), date_format:z.enum(['dd/MM/yyyy','MM/dd/yyyy','yyyy-MM-dd']), time_format:z.enum(['12h','24h']), reminder_defaults:z.record(z.array(z.number().int().nonnegative().max(525600)).max(5)) }).partial();
export async function GET() { try { const { supabase, user } = await requireUser(); const {data,error}=await supabase.from('user_preferences').select('*').eq('user_id',user.id).single(); if(error) throw error; return NextResponse.json({data}); } catch(e){return apiError(e);} }
export async function PATCH(request: NextRequest) { try { const { supabase, user } = await requireUser(); const input=prefs.parse(await request.json()); const {data,error}=await supabase.from('user_preferences').update(input).eq('user_id',user.id).select().single(); if(error) throw error; return NextResponse.json({data}); } catch(e){return apiError(e);} }
