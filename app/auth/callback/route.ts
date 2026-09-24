import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/app';
  if (code) {
    const { error } = await createServerSupabase().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/app', request.url));
  }
  return NextResponse.redirect(new URL('/login?error=auth_callback', request.url));
}
