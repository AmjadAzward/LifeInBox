'use client';

import { Clock, Bell } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { CATEGORY_LABELS, type LifeItemCategory } from '@/lib/types';

const defaults: {
  category: LifeItemCategory;
  rules: string;
}[] = [
  { category: 'BILL', rules: '3 days before + due date' },
  { category: 'APPOINTMENT', rules: '1 day before + 2 hours before' },
  { category: 'TRAVEL', rules: '1 day before + 3 hours before' },
  { category: 'SUBSCRIPTION', rules: '3 days before' },
  { category: 'INSURANCE', rules: '30 days + 7 days + 1 day before' },
  { category: 'DOCUMENT_EXPIRY', rules: '6 months + 3 months + 1 month before' },
  { category: 'WARRANTY', rules: '30 days + 7 days before' },
  { category: 'RETURN', rules: '3 days + 1 day before' },
  { category: 'RESERVATION', rules: '1 day + 2 hours before' },
];

export default function ReminderDefaultsPage() {
  return (
    <div>
      <MobileHeader
        title="Reminder Defaults"
        showBack
        backHref="/app/settings"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Reminder Defaults</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Default reminder rules for each category. You can override these
            on individual items.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Per-Category Rules
            </h2>
          </div>
          <div className="divide-y divide-border">
            {defaults.map((d) => (
              <div
                key={d.category}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {CATEGORY_LABELS[d.category]}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {d.rules}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Custom per-category editing is coming soon.
        </p>
      </div>
    </div>
  );
}
