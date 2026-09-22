import Link from 'next/link';
import { Calendar, MapPin, Building2, Clock } from 'lucide-react';
import type { LifeItem } from '@/lib/types';
import { CategoryBadge } from './category-badge';
import { StatusBadge } from './status-badge';
import {
  formatCurrency,
  formatDate,
  getPrimaryDate,
  getRelativeDateLabel,
} from '@/lib/format';
import { CATEGORY_ICONS } from '@/lib/category-icons';
import { cn } from '@/lib/utils';

interface LifeItemCardProps {
  item: LifeItem;
  href?: string;
}

export function LifeItemCard({ item, href }: LifeItemCardProps) {
  const linkHref = href || `/app/my-life/${item.id}`;
  const primaryDate = getPrimaryDate(item);
  const Icon = CATEGORY_ICONS[item.category];

  return (
    <Link
      href={linkHref}
      className="block bg-card rounded-xl border border-border p-4 hover:border-primary/20 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {item.title}
              </h3>
              {item.organization && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.organization}
                </p>
              )}
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            <CategoryBadge category={item.category} />
          </div>

          <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
            {item.amount !== null && (
              <span className="font-medium text-foreground">
                {formatCurrency(item.amount, item.currency)}
              </span>
            )}
            {primaryDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(primaryDate, 'd MMM yyyy')}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
            )}
          </div>

          {primaryDate && item.status !== 'COMPLETED' && item.status !== 'ARCHIVED' && (
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getRelativeDateLabel(primaryDate)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
