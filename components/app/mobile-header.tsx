'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showBell?: boolean;
  backHref?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  showBell = true,
  backHref,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadNotifications();

  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref || '/app'}
            className="flex items-center justify-center h-9 w-9 -ml-2 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
        )}
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>
      {showBell && (
        <Link
          href="/app/notifications"
          className={cn(
            'relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted'
          )}
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}
