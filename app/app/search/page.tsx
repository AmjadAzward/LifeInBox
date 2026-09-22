'use client';

import { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { LifeItemCard } from '@/components/app/life-item-card';
import { EmptyState } from '@/components/app/empty-state';
import { Input } from '@/components/ui/input';
import { mockLifeItems } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, STATUS_LABELS, type LifeItemCategory, type LifeItemStatus } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LifeItemCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LifeItemStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mockLifeItems.filter((item) => {
      const matches =
        item.title.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.organization?.toLowerCase().includes(q) ?? false) ||
        (item.referenceNumber?.toLowerCase().includes(q) ?? false) ||
        (item.actionRequired?.toLowerCase().includes(q) ?? false) ||
        CATEGORY_LABELS[item.category].toLowerCase().includes(q);

      if (!matches) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      return true;
    });
  }, [query, categoryFilter, statusFilter]);

  return (
    <div>
      <MobileHeader title="Search" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find anything across your LifeInbox.
          </p>
        </div>

        {/* Search field */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search bills, bookings, subscriptions..."
            className="pl-12 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {query && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
        )}

        {/* Filters */}
        {showFilters && query && (
          <div className="space-y-3 mb-4 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  categoryFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                )}
              >
                All Categories
              </button>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setCategoryFilter(value as LifeItemCategory)
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                    categoryFilter === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  statusFilter === 'ALL'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                )}
              >
                All Statuses
              </button>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value as LifeItemStatus)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                    statusFilter === value
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card border border-border text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {results.length} {results.length === 1 ? 'result' : 'results'} for
              &quot;{query}&quot;
            </p>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((item) => (
                  <LifeItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchIcon className="h-7 w-7" />}
                title="No results found"
                description={`We couldn't find anything matching "${query}". Try a different search term.`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              Start typing to search across your bills, bookings, subscriptions,
              and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
