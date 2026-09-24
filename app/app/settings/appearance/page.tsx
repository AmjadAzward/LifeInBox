'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { cn } from '@/lib/utils';

const options = [
  { value: 'light', label: 'Light', description: 'Always use the light theme', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Always use the dark theme', icon: Moon },
  { value: 'system', label: 'System', description: 'Match your device setting', icon: Laptop },
];

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); fetch('/api/preferences').then((r)=>r.json()).then(({data})=>{if(data?.theme)setTheme(data.theme);}).catch(()=>undefined); }, [setTheme]);
  const chooseTheme = (value: string) => { setTheme(value); fetch('/api/preferences',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({theme:value})}); };

  return (
    <div>
      <MobileHeader title="Appearance" showBack backHref="/app/settings" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose how LifeInbox looks on this device.</p>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {options.map((option, index) => {
            const Icon = option.icon;
            const selected = mounted && theme === option.value;
            return <button key={option.value} type="button" onClick={() => chooseTheme(option.value)} className={cn('w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/50 transition-colors', index > 0 && 'border-t border-border')}>
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}><Icon className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block text-sm font-medium text-foreground">{option.label}</span><span className="block text-xs text-muted-foreground mt-0.5">{option.description}</span></span>
              {selected && <Check className="h-5 w-5 text-primary" />}
            </button>;
          })}
        </div>
      </div>
    </div>
  );
}
