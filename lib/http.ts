import { NextResponse } from 'next/server';

export function apiError(error: unknown) {
  console.error('[LifeInbox API]', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = message === 'UNAUTHORIZED' ? 401 : message === 'NOT_FOUND' ? 404 : message.includes('malware was detected') ? 422 : message.includes('Malware scanner is unavailable') ? 503 : 500;
  return NextResponse.json({ error: status === 500 ? 'Request failed' : message }, { status });
}
