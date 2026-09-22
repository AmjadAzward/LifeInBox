import { cn } from '@/lib/utils';

interface SummaryCardProps {
  label: string;
  value: number;
  variant: 'default' | 'warning' | 'success' | 'primary';
}

export function SummaryCard({ label, value, variant }: SummaryCardProps) {
  const styles = {
    default: 'bg-card',
    warning: 'bg-card',
    success: 'bg-card',
    primary: 'bg-card',
  };

  const valueColors = {
    default: 'text-foreground',
    warning: 'text-warning',
    success: 'text-success',
    primary: 'text-primary',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border p-4 transition-shadow hover:shadow-sm',
        styles[variant]
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', valueColors[variant])}>
        {value}
      </p>
    </div>
  );
}
