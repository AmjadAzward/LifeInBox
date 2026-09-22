'use client';

import Link from 'next/link';
import {
  User as UserIcon,
  Bell,
  Clock,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Mail,
  Globe,
  Calendar,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { mockUser, mockUserPreference } from '@/lib/mock-data';

const sections = [
  {
    title: 'Account',
    items: [
      {
        href: '/app/profile',
        icon: UserIcon,
        label: 'Profile',
        value: mockUser.fullName,
      },
      {
        href: '/app/settings/notifications',
        icon: Bell,
        label: 'Notification Preferences',
        value: mockUserPreference.pushEnabled
          ? 'Push & Email enabled'
          : 'Email only',
      },
      {
        href: '/app/settings/reminder-defaults',
        icon: Clock,
        label: 'Reminder Defaults',
        value: 'Per-category rules',
      },
    ],
  },
  {
    title: 'Data & Privacy',
    items: [
      {
        href: '/app/settings/privacy',
        icon: Shield,
        label: 'Privacy & Data',
        value: 'Download, delete, manage',
      },
      {
        href: '/app/settings/subscription',
        icon: CreditCard,
        label: 'Subscription',
        value: 'Free plan',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        href: '/app/help',
        icon: HelpCircle,
        label: 'Help & Support',
        value: null,
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      <MobileHeader title="Settings" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, preferences, and data.
          </p>
        </div>

        {/* Account summary */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {mockUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {mockUser.fullName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {mockUser.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {mockUser.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {mockUser.timezone}
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

        {/* Connected Apps */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Connected Apps
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {[
              { name: 'Gmail', status: 'Coming later' },
              { name: 'Outlook', status: 'Coming later' },
              { name: 'Google Calendar', status: 'Coming later' },
              { name: 'Apple Calendar', status: 'Coming later' },
            ].map((app, idx) => (
              <div
                key={app.name}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  idx > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {app.name}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <Link
          href="/login"
          className="block text-center text-sm text-destructive hover:underline py-3"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
