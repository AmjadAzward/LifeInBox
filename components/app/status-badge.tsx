import { cn } from '@/lib/utils';
import { STATUS_LABELS, type LifeItemStatus } from '@/lib/types';
import { getStatusColor } from '@/lib/format';

interface StatusBadgeProps {
  status: LifeItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        getStatusColor(status)
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
