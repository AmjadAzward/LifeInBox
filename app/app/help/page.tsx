'use client';

import Link from 'next/link';
import { HelpCircle, Mail, FileText, ChevronRight } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';

const faqs = [
  {
    q: 'How do I add something to LifeInbox?',
    a: 'Tap the Remember Something button and choose how you want to add it — upload an image or PDF, take a photo, paste text, or type the details. We\'ll extract the important information and ask you to confirm before saving.',
  },
  {
    q: 'How do reminders work?',
    a: 'When you confirm a life item, we automatically create reminders based on the category and important dates. You\'ll receive notifications via push or email (depending on your preferences) at the right time.',
  },
  {
    q: 'Can I edit or delete a life item?',
    a: 'Yes. Go to My Life, tap any item to open its details, and use the Edit or Delete actions. You can also archive items you no longer need.',
  },
  {
    q: 'Are my documents private?',
    a: 'Yes. Your uploaded documents are stored privately and only you can access them. Files are never shared with other users.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Go to Settings > Privacy & Data and tap "Download My Data" to request an export of all your LifeInbox content.',
  },
  {
    q: 'What file types can I upload?',
    a: 'You can upload JPG, JPEG, PNG, WEBP images and PDF files. Maximum file size is 10 MB.',
  },
];

export default function HelpPage() {
  return (
    <div>
      <MobileHeader title="Help & Support" showBack backHref="/app/settings" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find answers and get support.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Need help?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Email us at{' '}
                <span className="text-primary">support@lifeinbox.app</span> and
                we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Frequently Asked Questions
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className={idx > 0 ? 'border-t border-border' : ''}
              >
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-muted/50 transition-colors list-none">
                  <span className="text-sm font-medium text-foreground">
                    {faq.q}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Quick Links
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Link
              href="/app/settings/notifications"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <HelpCircle className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Notification settings
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </Link>
            <Link
              href="/app/settings/privacy"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors border-t border-border"
            >
              <FileText className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Privacy & data controls
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
