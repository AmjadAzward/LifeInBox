'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ListChecks,
  Calendar,
  FileText,
  Search,
  Settings,
  HelpCircle,
  User,
  Inbox,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockNotifications } from '@/lib/mock-data';

const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/my-life', label: 'My Life', icon: ListChecks },
  { href: '/app/calendar', label: 'Calendar', icon: Calendar },
  { href: '/app/documents', label: 'Documents', icon: FileText },
  { href: '/app/search', label: 'Search', icon: Search },
  { href: '/app/settings', label: 'Settings', icon: Settings },
  { href: '/app/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-card z-30">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Inbox className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground leading-tight">LifeInbox</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Remember everything
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === '/app'
              ? pathname === '/app'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-0.5">
        <Link
          href="/app/notifications"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/app/notifications'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <div className="relative">
            <Bell className="h-[18px] w-[18px] shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          Notifications
        </Link>
        <Link
          href="/app/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/app/profile'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <User className="h-[18px] w-[18px] shrink-0" />
          Profile
        </Link>
      </div>
    </aside>
  );
}
