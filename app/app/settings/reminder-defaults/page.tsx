'use client';

import { useEffect, useState } from 'react';
import { Clock, Bell, Save } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORY_LABELS, type LifeItemCategory } from '@/lib/types';

const presetDefaults: {
  category: LifeItemCategory;
  rules: string;
}[] = [
  { category: 'BILL', rules: '4320, 0' },
  { category: 'APPOINTMENT', rules: '1440, 120' },
  { category: 'TRAVEL', rules: '1440, 180' },
  { category: 'SUBSCRIPTION', rules: '4320' },
  { category: 'INSURANCE', rules: '43200, 10080, 1440' },
  { category: 'DOCUMENT_EXPIRY', rules: '262800, 131400, 43800' },
  { category: 'WARRANTY', rules: '43200, 10080' },
  { category: 'RETURN', rules: '4320, 1440' },
  { category: 'RESERVATION', rules: '1440, 120' },
];

export default function ReminderDefaultsPage() {
  const [rules,setRules]=useState<Record<string,string>>(()=>Object.fromEntries(presetDefaults.map((entry)=>[entry.category,entry.rules])));
  const [saved,setSaved]=useState(false);
  useEffect(()=>{fetch('/api/preferences').then((r)=>r.json()).then(({data})=>{if(data?.reminder_defaults){const next={...rules};Object.entries(data.reminder_defaults).forEach(([category,minutes])=>{next[category]=(minutes as number[]).join(', ');});setRules(next);}});},[]);
  const save=async()=>{const reminder_defaults=Object.fromEntries(Object.entries(rules).map(([category,value])=>[category,value.split(',').map(Number).filter((n)=>Number.isInteger(n)&&n>=0)]));const response=await fetch('/api/preferences',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({reminder_defaults})});setSaved(response.ok);};
  return (
    <div>
      <MobileHeader
        title="Reminder Defaults"
        showBack
        backHref="/app/settings"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Reminder Defaults</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Default reminder rules for each category. You can override these
            on individual items.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Per-Category Rules
            </h2>
          </div>
          <div className="divide-y divide-border">
            {presetDefaults.map((d) => (
              <div
                key={d.category}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {CATEGORY_LABELS[d.category]}
                  </p>
                </div>
                <div className="w-52"><Input aria-label={`${CATEGORY_LABELS[d.category]} reminder minutes`} value={rules[d.category]||''} onChange={(event)=>setRules((current)=>({...current,[d.category]:event.target.value}))}/><p className="mt-1 text-[11px] text-muted-foreground">Minutes before, separated by commas</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3"><Button onClick={save}><Save className="mr-2 h-4 w-4"/>Save defaults</Button>{saved&&<span className="text-sm text-success">Saved.</span>}</div>
      </div>
    </div>
  );
}
