'use client';

import Link from 'next/link';
import { Plus, AlertCircle, CalendarClock, Inbox } from 'lucide-react';
import { useLifeItems } from '@/hooks/use-life-items';
import { useProfile } from '@/hooks/use-profile';
import { LifeItemCard } from '@/components/app/life-item-card';
import { SummaryCard } from '@/components/app/summary-card';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { items: mockLifeItems, loading, error } = useLifeItems();
  const { profile } = useProfile();
  const needsAttention = mockLifeItems.filter(
    (item) =>
      item.status === 'NEEDS_ATTENTION' ||
      item.status === 'DUE_TODAY' ||
      item.status === 'OVERDUE'
  );
  const upcoming = mockLifeItems.filter(
    (item) => item.status === 'UPCOMING'
  );
  const allItems = mockLifeItems.filter(
    (item) => item.status !== 'ARCHIVED'
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <MobileHeader title="LifeInbox" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground">Loading your LifeInbox…</p>}
        {/* Greeting */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what needs your attention.
          </p>
        </div>

        <div className="space-y-4">
        {/* Primary CTA */}
        <Link href="/app/remember" className="block">
          <div className="group flex items-center justify-between rounded-xl bg-primary p-5 hover:bg-primary/95 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">
                  Remember Something
                </p>
                <p className="text-sm text-primary-foreground/70">
                  Upload a bill, booking, or document - we&apos;ll handle the rest
                </p>
              </div>
            </div>
            <Plus className="h-5 w-5 text-primary-foreground/50 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
          </div>
        </Link>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard
            label="Needs Attention"
            value={needsAttention.length}
            variant="warning"
          />
          <SummaryCard
            label="Coming Soon"
            value={upcoming.length}
            variant="primary"
          />
          <SummaryCard
            label="All Items"
            value={allItems.length}
            variant="default"
          />
        </div>
        </div>

        {/* Needs Attention */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h2 className="text-base font-semibold text-foreground">
              Needs Attention
            </h2>
          </div>
          {needsAttention.length > 0 ? (
            <div className="space-y-3">
              {needsAttention.map((item) => (
                <LifeItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up. Nothing needs your attention right now.
              </p>
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Upcoming</h2>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((item) => (
                <LifeItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming items. Use the button above to add one.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
