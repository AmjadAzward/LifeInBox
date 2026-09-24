import { createAdminSupabase } from '@/lib/supabase/server';
import { decryptSecret, encryptSecret } from '@/lib/integration-crypto';

export const GOOGLE_CALENDAR_PROVIDER = 'GOOGLE_CALENDAR';
export const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
].join(' ');

export function googleConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Google Calendar environment variables are missing.');
  return { clientId, clientSecret, redirectUri };
}

export async function googleAccessToken(ownerId: string) {
  const db = createAdminSupabase();
  const { data: connection, error } = await db.from('integration_connections').select('*').eq('owner_id', ownerId).eq('provider', GOOGLE_CALENDAR_PROVIDER).single();
  if (error || !connection?.encrypted_access_token) throw new Error('Google Calendar is not connected.');
  if (!connection.expires_at || new Date(connection.expires_at).getTime() > Date.now() + 60_000) {
    return { token: decryptSecret(connection.encrypted_access_token), connection };
  }
  if (!connection.encrypted_refresh_token) throw new Error('Google Calendar authorization has expired. Please reconnect it.');
  const config = googleConfig();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, refresh_token: decryptSecret(connection.encrypted_refresh_token), grant_type: 'refresh_token' }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error('Unable to refresh Google Calendar authorization.');
  const expiresAt = new Date(Date.now() + Number(result.expires_in || 3600) * 1000).toISOString();
  await db.from('integration_connections').update({ encrypted_access_token: encryptSecret(result.access_token), expires_at: expiresAt, updated_at: new Date().toISOString() }).eq('id', connection.id);
  return { token: result.access_token as string, connection: { ...connection, expires_at: expiresAt } };
}

export async function googleRequest(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Calendar request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return response.status === 204 ? null : response.json();
}
