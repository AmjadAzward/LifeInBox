'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Pencil,
  AlertTriangle,
  Bell,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  MapPin,
  Hash,
  User as UserIcon,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_LABELS, type LifeItemCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FieldConfig {
  key: string;
  label: string;
  icon: typeof Calendar;
  type: 'text' | 'date' | 'number' | 'textarea';
  value: string;
  confidence: number;
}

const initialFields: FieldConfig[] = [
  { key: 'title', label: 'Title', icon: FileText, type: 'text', value: 'CEB Electricity Bill', confidence: 0.95 },
  { key: 'organization', label: 'Organization', icon: Building2, type: 'text', value: 'Ceylon Electricity Board', confidence: 0.95 },
  { key: 'amount', label: 'Amount', icon: CreditCard, type: 'number', value: '8450', confidence: 0.95 },
  { key: 'dueDate', label: 'Due Date', icon: Calendar, type: 'date', value: '2026-09-28', confidence: 0.7 },
  { key: 'referenceNumber', label: 'Reference Number', icon: Hash, type: 'text', value: '12345678', confidence: 0.9 },
  { key: 'actionRequired', label: 'Action Required', icon: CheckCircle2, type: 'text', value: 'Pay electricity bill', confidence: 0.85 },
];

const suggestedReminders = [
  { id: 'r1', label: '25 September 2026', description: '3 days before due date' },
  { id: 'r2', label: '28 September 2026', description: 'Due date' },
];

const lowConfidenceThreshold = 0.8;

export default function ConfirmPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<FieldConfig[]>(initialFields);
  const [category, setCategory] = useState<LifeItemCategory>('BILL');
  const [currency, setCurrency] = useState('LKR');
  const [reminders, setReminders] = useState(suggestedReminders);
  const [confirmed, setConfirmed] = useState(false);

  const updateField = (key: string, value: string) => {
    setFields((fs) => fs.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      router.push('/app/my-life/li-1');
    }, 2000);
  };

  if (confirmed) {
    return (
      <div>
        <MobileHeader title="" showBack={false} showBell={false} />
        <div className="flex flex-col items-center justify-center py-20 px-4 animate-scale-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Got it. We&apos;ll remember this for you.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
            We&apos;ve saved this and set up your reminders. You can edit or
            delete it anytime from My Life.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MobileHeader
        title={editing ? 'Edit Details' : 'Confirm Details'}
        showBack
        backHref="/app/remember"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">
              AI Extraction Complete
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Here&apos;s what I found
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the details below. Fields with low confidence are highlighted
            in amber — please verify them.
          </p>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Label>Category</Label>
          {editing ? (
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as LifeItemCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {fields.map((field, idx) => {
            const Icon = field.icon;
            const isLowConfidence = field.confidence < lowConfidenceThreshold;

            return (
              <div
                key={field.key}
                className={cn(
                  'flex items-start gap-3 p-4',
                  idx > 0 && 'border-t border-border'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Label className="text-xs text-muted-foreground">
                      {field.label}
                    </Label>
                    {isLowConfidence && !editing && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        Low confidence
                      </span>
                    )}
                  </div>

                  {editing ? (
                    field.type === 'textarea' ? (
                      <Textarea
                        value={field.value}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => updateField(field.key, e.target.value)}
                      />
                    )
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {field.type === 'date' && field.value
                        ? new Date(field.value + 'T00:00:00').toLocaleDateString(
                            'en-US',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )
                        : field.key === 'amount'
                        ? `${currency} ${Number(field.value).toLocaleString()}`
                        : field.value || '—'}
                    </p>
                  )}

                  {isLowConfidence && !editing && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <p className="text-xs text-warning">
                        I think this is the {field.label.toLowerCase()}. Please
                        confirm.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Currency (only when editing) */}
        {editing && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'AED', 'SGD'].map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reminders */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Reminders
            </h3>
          </div>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {r.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.description}
                  </p>
                </div>
                {editing && (
                  <button
                    onClick={() =>
                      setReminders((rs) => rs.filter((x) => x.id !== r.id))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Plus className="h-4 w-4" />
                Add reminder
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-20 lg:bottom-4 bg-background pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setEditing(!editing)}
          >
            {editing ? (
              'Preview'
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={editing}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm & Remember
          </Button>
        </div>
      </div>
    </div>
  );
}
