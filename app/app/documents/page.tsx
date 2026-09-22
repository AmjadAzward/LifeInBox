'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, Download, Trash2, ChevronRight } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { EmptyState } from '@/components/app/empty-state';
import { mockLifeItems } from '@/lib/mock-data';
import { formatDate, formatFileSize } from '@/lib/format';
import { cn } from '@/lib/utils';

const filters = ['All', 'Bills', 'Travel', 'Warranties', 'Insurance', 'Identity', 'Other'];

export default function DocumentsPage() {
  const [filter, setFilter] = useState('All');

  const attachments = useMemo(() => {
    const all = mockLifeItems.flatMap((item) =>
      item.attachments.map((att) => ({
        ...att,
        lifeItem: item,
      }))
    );
    return all;
  }, []);

  return (
    <div>
      <MobileHeader title="Documents" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All files you&apos;ve uploaded to LifeInbox.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 mb-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all"
              >
                {/* Thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {att.fileType === 'IMAGE' ? (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {att.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {att.fileType} · {formatFileSize(att.fileSize)} ·{' '}
                    {formatDate(att.createdAt, 'd MMM yyyy')}
                  </p>
                  <Link
                    href={`/app/my-life/${att.lifeItem.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    {att.lifeItem.title}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No documents yet"
            description="Documents you upload will appear here. Start by remembering something with a file."
          />
        )}
      </div>
    </div>
  );
}
