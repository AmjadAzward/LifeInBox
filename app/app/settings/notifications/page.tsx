'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, Sun, CalendarDays, Clock } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState({ pushEnabled: true, emailEnabled: true, morningSummary: true, weeklySummary: false, defaultNotificationTime: '08:00', timezone: 'UTC' });
  const [pushStatus, setPushStatus] = useState('');

  const manageBrowserPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push notifications are not supported in this browser.');
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('Push notifications are not configured yet.');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notification permission was not granted.');
      const registration = await navigator.serviceWorker.register('/sw.js');
      const existing = await registration.pushManager.getSubscription();
      const bytes = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(publicKey.length / 4) * 4, '=')), (character) => character.charCodeAt(0));
      const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
      const response = await fetch('/api/push-subscriptions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(subscription.toJSON()) });
      if (!response.ok) throw new Error('Unable to register this browser.');
      setPushStatus('This browser is registered for push notifications.');
    } catch (reason) { setPushStatus(reason instanceof Error ? reason.message : 'Unable to enable push notifications.'); }
  };

  const unregisterBrowser = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await fetch('/api/push-subscriptions', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
      await subscription.unsubscribe();
    }
    setPushStatus('This browser is no longer registered.');
  };

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => { const next={ ...p, [key]: !p[key] }; save(next); return next; });
  };
  const save = (next: typeof prefs) => fetch('/api/preferences',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({push_enabled:next.pushEnabled,email_enabled:next.emailEnabled,morning_summary:next.morningSummary,weekly_summary:next.weeklySummary,default_notification_time:next.defaultNotificationTime,timezone:next.timezone})});
  useEffect(()=>{fetch('/api/me').then(r=>r.json()).then(({data})=>{const p=data?.user_preferences?.[0]||data?.user_preferences;if(p)setPrefs({pushEnabled:p.push_enabled,emailEnabled:p.email_enabled,morningSummary:p.morning_summary,weeklySummary:p.weekly_summary,defaultNotificationTime:p.default_notification_time,timezone:p.timezone});});},[]);

  return (
    <div>
      <MobileHeader
        title="Notification Preferences"
        showBack
        backHref="/app/settings"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">
            Notification Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how and when you want to be reminded.
          </p>
        </div>

        {/* Channels */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Channels</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get reminders on your device
                </p>
              </div>
              <Switch
                id="push"
                checked={prefs.pushEnabled}
                onCheckedChange={() => toggle('pushEnabled')}
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="email">Email Reminders</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive reminders by email
                </p>
              </div>
              <Switch
                id="email"
                checked={prefs.emailEnabled}
                onCheckedChange={() => toggle('emailEnabled')}
              />
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Browser permission</h2>
          <p className="mt-1 text-xs text-muted-foreground">Register this browser to receive push reminders when LifeInbox is closed.</p>
          <div className="mt-3 flex flex-wrap gap-2"><Button type="button" onClick={manageBrowserPush}>Enable on this browser</Button><Button type="button" variant="outline" onClick={unregisterBrowser}>Remove this browser</Button></div>
          {pushStatus && <p className="mt-2 text-xs text-muted-foreground">{pushStatus}</p>}
        </div>

        {/* Summaries */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Summaries</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Sun className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="morning">Morning Summary</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily overview of what needs attention
                </p>
              </div>
              <Switch
                id="morning"
                checked={prefs.morningSummary}
                onCheckedChange={() => toggle('morningSummary')}
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="weekly">Weekly Summary</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Weekly digest of upcoming items
                </p>
              </div>
              <Switch
                id="weekly"
                checked={prefs.weeklySummary}
                onCheckedChange={() => toggle('weeklySummary')}
              />
            </div>
          </div>
        </div>

        {/* Default time */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <Label htmlFor="defaultTime">Default Reminder Time</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When reminders should be sent by default
              </p>
            </div>
          </div>
          <Input
            id="defaultTime"
            type="time"
            value={prefs.defaultNotificationTime}
            onChange={(e) =>
              setPrefs((p) => { const next={...p,defaultNotificationTime:e.target.value}; save(next); return next; })
            }
          />
        </div>

        {/* Timezone */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Label>Timezone</Label>
          <p className="text-xs text-muted-foreground">
            All reminders are scheduled in your timezone.
          </p>
          <Select value={prefs.timezone} onValueChange={(v) => setPrefs((p) => { const next={...p,timezone:v}; save(next); return next; })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                'Asia/Colombo',
                'Asia/Kolkata',
                'Asia/Dubai',
                'Asia/Singapore',
                'Europe/London',
                'America/New_York',
                'America/Los_Angeles',
                'Australia/Sydney',
                'UTC',
              ].map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
