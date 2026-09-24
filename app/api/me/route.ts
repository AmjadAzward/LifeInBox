import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
const profile = z.object({ full_name: z.string().min(1).max(200), country: z.string().max(100), timezone: z.string().max(100) });
export async function GET() { try { const { supabase, user } = await requireUser(); const { data, error } = await supabase.from('profiles').select('*, user_preferences(*)').eq('id', user.id).single(); if (error) throw error; return NextResponse.json({ data }); } catch(e) { return apiError(e); } }
export async function PATCH(request: NextRequest) { try { const { supabase, user } = await requireUser(); const input = profile.partial().parse(await request.json()); const { data, error } = await supabase.from('profiles').update(input).eq('id', user.id).select().single(); if (error) throw error; return NextResponse.json({ data }); } catch(e) { return apiError(e); } }
