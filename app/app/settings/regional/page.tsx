'use client';

import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const defaults = { language:'en', locale:'en-LK', currency:'LKR', date_format:'dd/MM/yyyy', time_format:'24h' };
export default function RegionalSettingsPage() {
  const [values,setValues]=useState(defaults); const [saved,setSaved]=useState(false);
  useEffect(()=>{fetch('/api/preferences').then((r)=>r.json()).then(({data})=>data&&setValues((current)=>({...current,...data})));},[]);
  const field=(key:keyof typeof defaults,value:string)=>setValues((current)=>({...current,[key]:value}));
  const save=async()=>{const response=await fetch('/api/preferences',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(values)});setSaved(response.ok);};
  const controls:[keyof typeof defaults,string,string[]][]=[['language','Language',['en','si','ta']],['locale','Locale',['en-LK','si-LK','ta-LK','en-US','en-GB']],['currency','Default currency',['LKR','USD','GBP','EUR','AUD','INR','SGD','AED']],['date_format','Date format',['dd/MM/yyyy','MM/dd/yyyy','yyyy-MM-dd']],['time_format','Time format',['24h','12h']]];
  return <div><MobileHeader title="Language & Region" showBack backHref="/app/settings"/><div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8"><div><h1 className="text-2xl font-bold">Language and region</h1><p className="mt-1 text-sm text-muted-foreground">Set defaults used for dates, times, and money.</p></div><div className="space-y-4 rounded-xl border bg-card p-4">{controls.map(([key,label,options])=><div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><select id={key} className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={values[key]} onChange={(e)=>field(key,e.target.value)}>{options.map((option)=><option key={option} value={option}>{option}</option>)}</select></div>)}</div><div className="flex items-center gap-3"><Button onClick={save}>Save preferences</Button>{saved&&<span className="text-sm text-success">Saved.</span>}</div></div></div>;
}
