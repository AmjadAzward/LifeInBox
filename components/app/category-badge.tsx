import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type LifeItemCategory } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/category-icons';

interface CategoryBadgeProps {
  category: LifeItemCategory;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];
  const Icon = CATEGORY_ICONS[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colors.bg,
        colors.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
