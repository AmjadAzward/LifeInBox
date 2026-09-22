'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building2,
  CreditCard,
  MapPin,
  Hash,
  User as UserIcon,
  FileText,
  Download,
  Archive,
  Trash2,
  CheckCircle2,
  Pencil,
  Bell,
  RotateCcw,
  Paperclip,
  Clock,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { CategoryBadge } from '@/components/app/category-badge';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { mockLifeItems } from '@/lib/mock-data';
import { CATEGORY_ICONS } from '@/lib/category-icons';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  getRelativeDateLabel,
  getPrimaryDate,
} from '@/lib/format';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function LifeItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const item = mockLifeItems.find((i) => i.id === id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  if (!item) {
    return (
      <div>
        <MobileHeader title="Item not found" showBack backHref="/app/my-life" />
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This item could not be found.
          </p>
          <Link href="/app/my-life">
            <Button variant="outline" className="mt-4">
              Back to My Life
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[item.category];
  const primaryDate = getPrimaryDate(item);

  const handleAction = (action: string) => {
    setActionTaken(action);
    setTimeout(() => setActionTaken(null), 3000);
  };

  const detailRows = [
    { icon: Building2, label: 'Organization', value: item.organization },
    { icon: UserIcon, label: 'Person', value: item.personName },
    { icon: CreditCard, label: 'Amount', value: item.amount !== null ? formatCurrency(item.amount, item.currency) : null },
    { icon: Calendar, label: 'Issue Date', value: item.issueDate ? formatDate(item.issueDate) : null },
    { icon: Calendar, label: 'Due Date', value: item.dueDate ? formatDate(item.dueDate) : null },
    { icon: Calendar, label: 'Event Date', value: item.eventDate ? formatDate(item.eventDate) : null },
    { icon: Calendar, label: 'Expiry Date', value: item.expiryDate ? formatDate(item.expiryDate) : null },
    { icon: Hash, label: 'Reference Number', value: item.referenceNumber },
    { icon: MapPin, label: 'Location', value: item.location },
    { icon: CheckCircle2, label: 'Action Required', value: item.actionRequired },
  ].filter((r) => r.value);

  return (
    <div>
      <MobileHeader
        title="Item Details"
        showBack
        backHref="/app/my-life"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/app/my-life"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            My Life
          </Link>
        </div>

        {/* Title card */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{item.title}</h1>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <CategoryBadge category={item.category} size="md" />
                <StatusBadge status={item.status} />
                {item.recurring && (
                  <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-2 py-0.5 text-[11px] font-medium">
                    Recurring
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary date highlight */}
          {primaryDate && item.status !== 'COMPLETED' && item.status !== 'ARCHIVED' && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm text-primary font-medium">
                {getRelativeDateLabel(primaryDate)} ·{' '}
                {formatDate(primaryDate, 'd MMMM yyyy')}
              </p>
            </div>
          )}
        </div>

        {/* Action feedback */}
        {actionTaken && (
          <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm text-success">
              {actionTaken === 'paid' && 'Marked as paid.'}
              {actionTaken === 'completed' && 'Marked as completed.'}
              {actionTaken === 'renewed' && 'Marked as renewed.'}
              {actionTaken === 'archived' && 'Item archived.'}
            </p>
          </div>
        )}

        {/* Primary actions */}
        <div className="flex flex-wrap gap-2">
          {item.status !== 'COMPLETED' && (
            <Button
              onClick={() =>
                handleAction(
                  item.category === 'BILL' ? 'paid' : 'completed'
                )
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {item.category === 'BILL'
                ? 'Mark as Paid'
                : item.category === 'SUBSCRIPTION'
                ? 'Mark as Renewed'
                : 'Mark as Completed'}
            </Button>
          )}
          {item.status === 'COMPLETED' && (
            <Button variant="outline" onClick={() => handleAction('completed')}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reopen
            </Button>
          )}
          <Button variant="outline" onClick={() => handleAction('archived')}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </div>

        {/* Details */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Details</h2>
          </div>
          <div className="divide-y divide-border">
            {detailRows.map((row, idx) => {
              const RowIcon = row.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <RowIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {row.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reminders */}
        {item.reminders.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Reminders</h2>
            </div>
            <div className="divide-y divide-border">
              {item.reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(r.remindAt, 'd MMMM yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(r.remindAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      r.status === 'SENT'
                        ? 'bg-success/10 text-success'
                        : r.status === 'FAILED'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {item.attachments.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Original Document
              </h2>
            </div>
            <div className="divide-y divide-border">
              {item.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {att.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {att.fileType} · {formatFileSize(att.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              More Actions
            </h2>
          </div>
          <div className="divide-y divide-border">
            <button
              onClick={() => handleAction('archived')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Archive Item</span>
            </button>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-left">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Delete Item</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{item.title}&quot; and all
                    its reminders. The original document will also be removed.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => router.push('/app/my-life')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
