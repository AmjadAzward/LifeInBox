'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, CalendarClock, Lightbulb, CheckCircle } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: FileSearch,
    title: 'Reading your document...',
    description: 'Looking at the content and identifying what type of document this is.',
  },
  {
    icon: CalendarClock,
    title: 'Finding important dates...',
    description: 'Extracting due dates, event dates, and expiry dates.',
  },
  {
    icon: Lightbulb,
    title: 'Understanding what needs to happen...',
    description: 'Identifying actions you might need to take and setting up reminder suggestions.',
  },
  {
    icon: CheckCircle,
    title: 'Almost there...',
    description: 'Preparing the details for your review.',
  },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(stepInterval);
          return s;
        }
        return s + 1;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(p + 2, 100);
      });
    }, 60);

    const redirectTimer = setTimeout(() => {
      router.push('/app/confirm');
    }, 6500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div>
      <MobileHeader title="Processing" showBack={false} showBell={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          {/* Progress circle */}
          <div className="relative h-24 w-24 mb-8">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="4"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                className="transition-all duration-100 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {progress}%
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="w-full space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3.5 transition-opacity',
                    i <= currentStep
                      ? 'opacity-100'
                      : 'opacity-30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isDone
                        ? 'bg-success/10 text-success'
                        : isActive
                        ? 'bg-primary/10 text-primary animate-pulse-soft'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isActive || isDone
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    {(isActive || isDone) && (
                      <p className="text-xs text-muted-foreground mt-0.5 animate-fade-in">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
