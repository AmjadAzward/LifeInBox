import {
  format,
  parseISO,
  differenceInDays,
  isToday,
  isPast,
  isValid,
} from 'date-fns';
import type { LifeItem, LifeItemStatus } from './types';

export function formatDate(
  dateStr: string | null,
  fmt: string = 'd MMMM yyyy'
): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    return format(d, fmt);
  } catch {
    return '—';
  }
}

export function formatDateShort(dateStr: string | null): string {
  return formatDate(dateStr, 'd MMM yyyy');
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'd MMMM yyyy \'at\' h:mm a');
  } catch {
    return '—';
  }
}

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'h:mm a');
  } catch {
    return '—';
  }
}

export function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 / 1024)).toFixed(1)} MB`;
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return null;
    return differenceInDays(d, new Date());
  } catch {
    return null;
  }
}

export function getRelativeDateLabel(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    if (isToday(d)) return 'Today';
    const days = differenceInDays(d, new Date());
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0 && days <= 7) return `In ${days} days`;
    if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
    return format(d, 'd MMM yyyy');
  } catch {
    return '—';
  }
}

export function getPrimaryDate(item: LifeItem): string | null {
  return item.dueDate || item.eventDate || item.expiryDate || null;
}

export function getStatusColor(status: LifeItemStatus): string {
  switch (status) {
    case 'NEEDS_ATTENTION':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'DUE_TODAY':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'OVERDUE':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'COMPLETED':
      return 'text-success bg-success/10 border-success/20';
    case 'EXPIRED':
      return 'text-muted-foreground bg-muted border-border';
    case 'ARCHIVED':
      return 'text-muted-foreground bg-muted border-border';
    case 'UPCOMING':
    default:
      return 'text-primary bg-primary/5 border-primary/15';
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}
