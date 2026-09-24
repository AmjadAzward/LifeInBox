'use client';

import { useRef, useState } from 'react';
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
import { useLifeItem } from '@/hooks/use-life-items';
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
  const { item, loading, error, refresh } = useLifeItem(id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (loading) return <div><MobileHeader title="Loading" showBack backHref="/app/my-life" /><p className="p-8 text-sm text-muted-foreground">Loading item…</p></div>;
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

  const handleAction = async (action: string) => {
    const apiAction = action === 'archived' ? 'archive' : action === 'reopened' ? 'restore' : 'complete';
    const response = await fetch(`/api/life-items/${id}`, { method: 'PATCH', headers: {'content-type':'application/json'}, body: JSON.stringify({ action: apiAction }) });
    if (!response.ok) return setActionTaken('error');
    setActionTaken(action); await refresh(); setTimeout(() => setActionTaken(null), 3000);
  };
  const undoAction = async () => {
    if(deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    const action = actionTaken === 'deleted' ? 'undelete' : 'restore';
    const response = await fetch(`/api/life-items/${id}`, { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({action}) });
    if(response.ok){setActionTaken(null);await refresh();}
  };

  const uploadAttachment = async (file?: File) => {
    if (!file) return;
    setUploading(true); setActionTaken(null);
    const body = new FormData(); body.append('file', file); body.append('lifeItemId', id);
    const response = await fetch('/api/uploads', { method: 'POST', body });
    setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '';
    if (!response.ok) return setActionTaken('error');
    await refresh();
  };

  const deleteAttachment = async (attachmentId: string) => {
    const response = await fetch(`/api/uploads/${attachmentId}/download`, { method: 'DELETE' });
    if (!response.ok) return setActionTaken('error');
    await refresh();
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
              {actionTaken === 'deleted' && 'Item deleted.'}
              {actionTaken === 'error' && 'The action could not be completed.'}
            </p>
            {actionTaken!=='error'&&<Button size="sm" variant="outline" className="ml-auto" onClick={undoAction}>Undo</Button>}
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
            <Button variant="outline" onClick={() => handleAction('reopened')}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reopen
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/app/my-life/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Details
            </Link>
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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <input ref={fileInputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => uploadAttachment(event.target.files?.[0])} />
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Documents</h2>
              </div>
              <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="mr-2 h-4 w-4" />{uploading ? 'Uploading...' : 'Add document'}
              </Button>
            </div>
          {item.attachments.length > 0 ? (
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
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild><a href={`/api/uploads/${att.id}/download`} target="_blank" rel="noreferrer" aria-label={`Open ${att.fileName}`}><Download className="h-4 w-4" /></a></Button>
                    <Button variant="ghost" size="sm" aria-label={`Delete ${att.fileName}`} onClick={() => deleteAttachment(att.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="p-4 text-sm text-muted-foreground">No documents attached.</p>}
        </div>

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
                    onClick={async () => { const response = await fetch(`/api/life-items/${id}`, { method: 'DELETE' }); if (response.ok) { setShowDeleteDialog(false); setActionTaken('deleted'); deleteTimerRef.current=setTimeout(() => router.push('/app/my-life'), 6000); } }}
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
