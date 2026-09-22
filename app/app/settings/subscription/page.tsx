'use client';

import { Check, Sparkles } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: 'LKR 0',
    period: 'forever',
    current: true,
    features: [
      'Up to 25 life items',
      'Email reminders',
      '5 MB file uploads',
      'Basic calendar view',
      '1 user',
    ],
  },
  {
    name: 'Plus',
    price: 'LKR 1,500',
    period: 'per month',
    current: false,
    popular: true,
    features: [
      'Unlimited life items',
      'Push & email reminders',
      '10 MB file uploads',
      'Calendar + agenda views',
      'Recurring items',
      'Priority support',
    ],
  },
  {
    name: 'Family',
    price: 'LKR 2,900',
    period: 'per month',
    current: false,
    features: [
      'Everything in Plus',
      'Up to 5 users',
      'Shared life items',
      '50 MB file uploads',
      'Advanced search',
    ],
  },
];

export default function SubscriptionPage() {
  return (
    <div>
      <MobileHeader title="Subscription" showBack backHref="/app/settings" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the plan that works for you.
          </p>
        </div>

        {/* Current plan badge */}
        <div className="rounded-xl bg-primary p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70">
              Current plan
            </p>
            <p className="text-lg font-bold text-primary-foreground mt-0.5">
              Free
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-accent" />
        </div>

        {/* Plans */}
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'rounded-xl border bg-card p-5 flex flex-col',
                plan.popular
                  ? 'border-accent shadow-sm'
                  : 'border-border'
              )}
            >
              {plan.popular && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent mb-2">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  /{plan.period}
                </span>
              </div>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.current ? 'outline' : 'default'}
                className="mt-5 w-full"
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Subscription management is coming soon. You&apos;ll be able to upgrade
          or downgrade at any time.
        </p>
      </div>
    </div>
  );
}
