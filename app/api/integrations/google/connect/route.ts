import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { GOOGLE_CALENDAR_SCOPES, googleConfig } from '@/lib/google-calendar';
import { pkceChallenge } from '@/lib/integration-crypto';
import { apiError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireUser();
    const config = googleConfig();
    const state = randomBytes(24).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: 'code', scope: GOOGLE_CALENDAR_SCOPES, access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state, code_challenge: pkceChallenge(verifier), code_challenge_method: 'S256' }).toString();
    const response = NextResponse.redirect(url);
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/integrations/google', maxAge: 600 };
    response.cookies.set('google_oauth_state', state, options);
    response.cookies.set('google_oauth_verifier', verifier, options);
    return response;
  } catch (error) { return apiError(error); }
}
