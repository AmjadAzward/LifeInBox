'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: { render: (container: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
  }
}

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const configuredSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const siteKey = process.env.NODE_ENV === 'development'
    ? '1x00000000000000000000AA'
    : configuredSiteKey;
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey || !ready || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      theme: 'auto',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });
    return () => { if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); widgetId.current = undefined; };
  }, [onToken, ready, siteKey]);

  if (!siteKey) return null;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={()=>setReady(true)}/><div ref={container} className="flex min-h-[65px] justify-center" role="group" aria-label="Security verification"/></>;
}
