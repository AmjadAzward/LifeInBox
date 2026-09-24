import { NextRequest, NextResponse } from 'next/server';
import { requireUser, createAdminSupabase } from '@/lib/supabase/server';
import { GOOGLE_CALENDAR_PROVIDER, googleConfig } from '@/lib/google-calendar';
import { encryptSecret } from '@/lib/integration-crypto';

export const runtime = 'nodejs';

function settingsUrl(request: NextRequest, value: string) {
  return new URL(`/app/settings/integrations?google=${encodeURIComponent(value)}`, request.url);
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');
  const expectedState = request.cookies.get('google_oauth_state')?.value;
  const verifier = request.cookies.get('google_oauth_verifier')?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) return NextResponse.redirect(settingsUrl(request, 'invalid_state'));
  try {
    const { user } = await requireUser();
    const config = googleConfig();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: 'authorization_code', code_verifier: verifier }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) throw new Error('Google token exchange failed.');
    const db = createAdminSupabase();
    const { data: existing } = await db.from('integration_connections').select('encrypted_refresh_token').eq('owner_id', user.id).eq('provider', GOOGLE_CALENDAR_PROVIDER).maybeSingle();
    const { error } = await db.from('integration_connections').upsert({
      owner_id: user.id, provider: GOOGLE_CALENDAR_PROVIDER,
      encrypted_access_token: encryptSecret(tokens.access_token),
      encrypted_refresh_token: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : existing?.encrypted_refresh_token || null,
      expires_at: new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(),
      calendar_id: 'primary', updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id,provider' });
    if (error) throw error;
    const response = NextResponse.redirect(settingsUrl(request, 'connected'));
    response.cookies.delete('google_oauth_state'); response.cookies.delete('google_oauth_verifier');
    return response;
  } catch (error) {
    console.error('[Google OAuth callback]', error);
    return NextResponse.redirect(settingsUrl(request, 'failed'));
  }
}
