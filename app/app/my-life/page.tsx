'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { LifeItemCard } from '@/components/app/life-item-card';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { mockLifeItems } from '@/lib/mock-data';
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type LifeItemCategory,
  type LifeItemStatus,
} from '@/lib/types';
import { Inbox } from 'lucide-react';

const statusFilters: { value: LifeItemStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NEEDS_ATTENTION', label: 'Needs Attention' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const categoryFilters: { value: LifeItemCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BILL', label: 'Bills' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'APPOINTMENT', label: 'Appointments' },
  { value: 'SUBSCRIPTION', label: 'Subscriptions' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'WARRANTY', label: 'Warranties' },
  { value: 'DOCUMENT_EXPIRY', label: 'Documents' },
];

export default function MyLifePage() {
  const [statusFilter, setStatusFilter] = useState<LifeItemStatus | 'ALL'>(
    'ALL'
  );
  const [categoryFilter, setCategoryFilter] = useState<
    LifeItemCategory | 'ALL'
  >('ALL');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return mockLifeItems.filter((item) => {
      if (statusFilter === 'ALL') {
        if (item.status === 'ARCHIVED') return false;
      } else if (item.status !== statusFilter) return false;

      if (categoryFilter !== 'ALL' && item.category !== categoryFilter)
        return false;

      if (search) {
        const q = search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          (item.organization?.toLowerCase().includes(q) ?? false) ||
          (item.description?.toLowerCase().includes(q) ?? false) ||
          (item.referenceNumber?.toLowerCase().includes(q) ?? false);
        if (!matches) return false;
      }

      return true;
    });
  }, [statusFilter, categoryFilter, search]);

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    search.length > 0;

  const clearFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSearch('');
  };

  return (
    <div>
      <MobileHeader title="My Life" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Life</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you&apos;ve asked us to remember.
          </p>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your items..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 mb-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 mb-4 animate-fade-in">
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  categoryFilter === f.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          </div>
        )}

        {/* Items */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <LifeItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Inbox className="h-7 w-7" />}
            title="No items found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or search.'
                : 'Start by remembering something — upload a bill, booking, or document.'
            }
            action={
              !hasActiveFilters && (
                <Button onClick={() => (window.location.href = '/app/remember')}>
                  Remember Something
                </Button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
