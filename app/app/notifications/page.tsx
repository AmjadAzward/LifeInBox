'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { mockNotifications, mockLifeItems } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div>
      <MobileHeader title="Notifications" showBack backHref="/app" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
                : 'You\'re all caught up.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Mobile mark all read */}
        {unreadCount > 0 && (
          <div className="lg:hidden mb-3">
            <Button variant="outline" onClick={markAllRead} size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </div>
        )}

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => {
              const lifeItem = n.lifeItemId
                ? mockLifeItems.find((i) => i.id === n.lifeItemId)
                : null;

              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
                    n.read
                      ? 'bg-card border-border'
                      : 'bg-primary/5 border-primary/20'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      n.read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm',
                          n.read
                            ? 'font-normal text-foreground'
                            : 'font-semibold text-foreground'
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </span>
                      {lifeItem && (
                        <Link
                          href={`/app/my-life/${lifeItem.id}`}
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View item
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<BellOff className="h-7 w-7" />}
            title="No notifications"
            description="You'll see reminders and updates here when they come in."
          />
        )}
      </div>
    </div>
  );
}
