'use client';

import { useState } from 'react';
import { Bell, Mail, Sun, CalendarDays, Clock } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockUserPreference } from '@/lib/mock-data';

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(mockUserPreference);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

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
              setPrefs((p) => ({ ...p, defaultNotificationTime: e.target.value }))
            }
          />
        </div>

        {/* Timezone */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Label>Timezone</Label>
          <p className="text-xs text-muted-foreground">
            All reminders are scheduled in your timezone.
          </p>
          <Select value={prefs.timezone} onValueChange={(v) => setPrefs((p) => ({ ...p, timezone: v }))}>
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
