'use client';

import Link from 'next/link';
import {
  User as UserIcon,
  Bell,
  Clock,
  Shield,
  HelpCircle,
  ChevronRight,
  Globe,
  Calendar,
  Moon,
  Users,
  KeyRound,
  Languages,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { useProfile } from '@/hooks/use-profile';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading, error } = useProfile();
  const preferences = Array.isArray(profile?.user_preferences) ? profile?.user_preferences[0] : profile?.user_preferences;
  const sections = [
    {title:'Appearance',items:[{href:'/app/settings/appearance',icon:Moon,label:'Theme',value:'Light, dark, or system'}]},
    {title:'Language & Region',items:[{href:'/app/settings/regional',icon:Languages,label:'Regional preferences',value:'Language, currency, date, and time'}]},
    {title:'Account',items:[
      {href:'/app/profile',icon:UserIcon,label:'Profile',value:profile?.full_name || 'Loading…'},
      {href:'/app/settings/security',icon:KeyRound,label:'Password & Security',value:'Password and active sessions'},
      {href:'/app/settings/integrations',icon:Calendar,label:'Connected Apps',value:'Google Calendar and more'},
      {href:'/app/family',icon:Users,label:'Family',value:'Workspaces, invitations, and members'},
      {href:'/app/settings/notifications',icon:Bell,label:'Notification Preferences',value:preferences?.push_enabled ? 'Push & Email enabled' : 'Email only'},
      {href:'/app/settings/reminder-defaults',icon:Clock,label:'Reminder Defaults',value:'Per-category rules'}]},
    {title:'Data & Privacy',items:[
      {href:'/app/settings/privacy',icon:Shield,label:'Privacy & Data',value:'Download, delete, manage'}]},
    {title:'Support',items:[{href:'/app/help',icon:HelpCircle,label:'Help & Support',value:null}]},
  ];
  return (
    <div>
      <MobileHeader title="Settings" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        {error && <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, preferences, and data.
          </p>
        </div>

        {/* Account summary */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground font-semibold">
              {profile?.image_url ? <div role="img" aria-label="Profile photo" className="h-full w-full bg-cover bg-center" style={{backgroundImage:'url(/api/profile/avatar)'}} /> : profile?.full_name?.charAt(0).toUpperCase() || '…'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {loading ? 'Loading…' : profile?.full_name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {profile?.country || 'Not set'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {profile?.timezone || 'UTC'}
            </span>
          </div>
        </div>

        {/* Settings sections */}
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                      idx > 0 ? 'border-t border-border' : ''
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      {item.value && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.value}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          type="button"
          onClick={async () => { await createClient().auth.signOut(); router.replace('/login'); router.refresh(); }}
          className="block w-full text-center text-sm text-destructive hover:underline py-3"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
