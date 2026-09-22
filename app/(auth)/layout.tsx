import { Inbox } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
            <Inbox className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-primary-foreground">
            LifeInbox
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-primary-foreground leading-tight">
            Send it. Forget it.
            <br />
            We&apos;ll remember.
          </h1>
          <p className="text-primary-foreground/70 mt-4 leading-relaxed">
            LifeInbox remembers your bills, appointments, subscriptions, travel,
            warranties and document expiry dates — so you never miss what
            matters.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
            <div className="h-1 w-1 rounded-full bg-accent" />
            Upload a photo or screenshot — we extract the details
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
            <div className="h-1 w-1 rounded-full bg-accent" />
            Confirm what we found — we set the reminders
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
            <div className="h-1 w-1 rounded-full bg-accent" />
            Relax. We&apos;ll remind you when it matters
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Inbox className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LifeInbox</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
