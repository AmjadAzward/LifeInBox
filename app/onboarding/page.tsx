'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox, Upload, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Inbox,
    title: 'Welcome to LifeInbox',
    description:
      'The place to send everything you need to remember - bills, bookings, appointments, warranties and more. We\'ll keep track so you don\'t have to.',
  },
  {
    icon: Upload,
    title: 'Just upload or paste',
    description:
      'Snap a photo of a bill, upload a PDF booking, or paste text from an email. LifeInbox reads the important details and organizes them for you.',
  },
  {
    icon: CheckCircle,
    title: 'Confirm and relax',
    description:
      'Review what we found, make any corrections, and hit confirm. We\'ll set up smart reminders so you never miss a due date or appointment.',
  },
  {
    icon: Bell,
    title: 'We\'ll remind you',
    description:
      'Get reminded at the right time through push notifications or email. Mark items as paid or completed when done. That\'s it - simple, calm, reliable.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (isLast) {
      router.push('/app');
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-12">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Inbox className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">LifeInbox</span>
        </div>

        {/* Step content */}
        <div key={step} className="animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary mx-auto mb-6">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{current.title}</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          {!isLast ? (
            <button
              onClick={() => router.push('/app')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          ) : (
            <span />
          )}
          <Button onClick={handleNext} className="min-w-[140px]">
            {isLast ? 'Get started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
