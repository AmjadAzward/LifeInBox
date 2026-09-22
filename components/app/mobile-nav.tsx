'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, Plus, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/my-life', label: 'My Life', icon: ListChecks },
  { href: '/app/remember', label: 'Remember', icon: Plus, center: true },
  { href: '/app/calendar', label: 'Calendar', icon: Calendar },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active =
            item.href === '/app'
              ? pathname === '/app'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/30">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium text-accent mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
