'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, Plus, Save, Trash2 } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categories } from '@/lib/validation';
import { CATEGORY_LABELS, type ReminderChannel } from '@/lib/types';
import { parseRecurrence, recurrenceRule, type RecurrenceFrequency } from '@/lib/recurrence';

type ReminderDraft = { remind_at: string; channel: ReminderChannel };
type FormState = Record<string, string | boolean>;

const emptyForm: FormState = {
  title: '', category: 'GENERAL_REMINDER', description: '', organization: '', person_name: '',
  amount: '', currency: 'LKR', issue_date: '', due_date: '', event_date: '', expiry_date: '',
  reference_number: '', location: '', action_required: '', recurring: false, recurrence_rule: '',
  workspace_id: '',
  due_time: '', event_time: '', expiry_time: '',
};

export default function EditLifeItemPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [reminders, setReminders] = useState<ReminderDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState<{id:string;name:string}[]>([]);

  useEffect(() => {
    fetch('/api/family/workspaces').then((response)=>response.json()).then((result)=>setWorkspaces(result.data||[])).catch(()=>undefined);
    fetch(`/api/life-items/${id}`, { cache: 'no-store' }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load item.');
      const item = result.data;
      setForm({
        title: item.title || '', category: item.category, description: item.description || '',
        organization: item.organization || '', person_name: item.person_name || '', amount: item.amount ?? '',
        currency: item.currency || 'LKR', issue_date: item.issue_date || '', due_date: item.due_date || '',
        event_date: item.event_date || '', expiry_date: item.expiry_date || '',
        reference_number: item.reference_number || '', location: item.location || '',
        action_required: item.action_required || '', recurring: Boolean(item.recurring),
        recurrence_rule: item.recurrence_rule || '',
        workspace_id: item.workspace_id || '',
        due_time:item.due_time?.slice(0,5)||'', event_time:item.event_time?.slice(0,5)||'', expiry_time:item.expiry_time?.slice(0,5)||'',
      });
      setReminders((item.reminders || []).filter((r: any) => r.status === 'PENDING').map((r: any) => ({
        remind_at: new Date(r.remind_at).toISOString().slice(0, 16), channel: r.channel,
      })));
    }).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, [id]);

  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const nullable = ['workspace_id','description','organization','person_name','issue_date','due_date','event_date','expiry_date','due_time','event_time','expiry_time','reference_number','location','action_required','recurrence_rule'];
    const body: any = { ...form, amount: form.amount === '' ? null : Number(form.amount), reminders: reminders.map((r) => ({ ...r, remind_at: new Date(r.remind_at).toISOString() })) };
    nullable.forEach((key) => { if (body[key] === '') body[key] = null; });
    if (!body.recurring) body.recurrence_rule = null;
    try {
      const response = await fetch(`/api/life-items/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const result = response.status === 204 ? {} : await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save item.');
      router.push(`/app/my-life/${id}`); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save item.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div><MobileHeader title="Edit item" showBack backHref={`/app/my-life/${id}`} /><p className="p-8 text-sm text-muted-foreground">Loading item...</p></div>;

  const fields = [
    ['organization','Organization','text'], ['person_name','Person','text'], ['amount','Amount','number'],
    ['currency','Currency','text'], ['issue_date','Issue date','date'], ['due_date','Due date','date'],
    ['due_time','Due time','time'], ['event_date','Event date','date'], ['event_time','Event time','time'], ['expiry_date','Expiry date','date'], ['expiry_time','Expiry time','time'],
    ['reference_number','Reference number','text'], ['location','Location','text'], ['action_required','Action required','text'],
  ];
  const recurrence = parseRecurrence(String(form.recurrence_rule || 'FREQ=MONTHLY;INTERVAL=1'));

  return <div>
    <MobileHeader title="Edit item" showBack backHref={`/app/my-life/${id}`} />
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div><h1 className="text-2xl font-bold">Edit item</h1><p className="mt-1 text-sm text-muted-foreground">Update details, recurrence, and reminders.</p></div>
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <section className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="title">Title</Label><Input id="title" required value={String(form.title)} onChange={(e) => update('title', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="category">Category</Label><select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.category)} onChange={(e) => update('category', e.target.value)}>{categories.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="workspace_id">Share with family</Label><select id="workspace_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.workspace_id)} onChange={(e) => update('workspace_id', e.target.value)}><option value="">Private</option>{workspaces.map((workspace)=><option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select></div>
        {fields.map(([name,label,type]) => <div className="space-y-2" key={name}><Label htmlFor={name}>{label}</Label><Input id={name} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined} value={String(form[name])} onChange={(e) => update(name, e.target.value)} /></div>)}
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={String(form.description)} onChange={(e) => update('description', e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.recurring)} onChange={(e) => update('recurring', e.target.checked)} /> Recurring item</label>
        {form.recurring && <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="recurrence_frequency">Repeat</Label><select id="recurrence_frequency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={recurrence.frequency} onChange={(e)=>update('recurrence_rule',recurrenceRule(e.target.value as RecurrenceFrequency,recurrence.interval,{weekdays:recurrence.weekdays,lastDay:recurrence.lastDay,until:recurrence.until}))}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select></div><div className="space-y-2"><Label htmlFor="recurrence_interval">Every</Label><Input id="recurrence_interval" type="number" min="1" max="99" value={recurrence.interval} onChange={(e)=>update('recurrence_rule',recurrenceRule(recurrence.frequency,Number(e.target.value)||1,{weekdays:recurrence.weekdays,lastDay:recurrence.lastDay,until:recurrence.until}))}/></div>{recurrence.frequency==='WEEKLY'&&<div className="space-y-2 sm:col-span-2"><Label>Weekdays</Label><div className="flex flex-wrap gap-2">{['MO','TU','WE','TH','FR','SA','SU'].map(day=><label key={day} className="flex items-center gap-1 rounded border px-2 py-1 text-sm"><input type="checkbox" checked={recurrence.weekdays.includes(day)} onChange={()=>{const days=recurrence.weekdays.includes(day)?recurrence.weekdays.filter(d=>d!==day):[...recurrence.weekdays,day];update('recurrence_rule',recurrenceRule(recurrence.frequency,recurrence.interval,{weekdays:days,until:recurrence.until}));}}/>{day}</label>)}</div></div>}{recurrence.frequency==='MONTHLY'&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={recurrence.lastDay} onChange={(e)=>update('recurrence_rule',recurrenceRule(recurrence.frequency,recurrence.interval,{lastDay:e.target.checked,until:recurrence.until}))}/>Use the last day of each month</label>}<div className="space-y-2"><Label htmlFor="recurrence_until">End date</Label><Input id="recurrence_until" type="date" value={recurrence.until} onChange={(e)=>update('recurrence_rule',recurrenceRule(recurrence.frequency,recurrence.interval,{weekdays:recurrence.weekdays,lastDay:recurrence.lastDay,until:e.target.value}))}/></div></div>}
      </section>
      <section className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4"><div className="flex items-center gap-2"><Bell className="h-4 w-4"/><h2 className="font-semibold">Reminders</h2></div><Button type="button" variant="outline" size="sm" onClick={() => setReminders((list) => [...list, { remind_at: '', channel: 'BOTH' }])}><Plus className="mr-1 h-4 w-4"/>Add reminder</Button></div>
        <div className="space-y-3 p-4">{reminders.length === 0 && <p className="text-sm text-muted-foreground">No reminders configured.</p>}{reminders.map((reminder, index) => <div key={index} className="flex flex-wrap items-center gap-2"><Input aria-label={`Reminder ${index + 1} date and time`} required type="datetime-local" className="min-w-56 flex-1" value={reminder.remind_at} onChange={(e) => setReminders((list) => list.map((r,i) => i === index ? {...r, remind_at:e.target.value} : r))}/><select aria-label={`Reminder ${index + 1} channel`} className="h-10 rounded-md border bg-background px-3 text-sm" value={reminder.channel} onChange={(e) => setReminders((list) => list.map((r,i) => i === index ? {...r, channel:e.target.value as ReminderChannel} : r))}><option value="BOTH">Push and email</option><option value="PUSH">Push</option><option value="EMAIL">Email</option></select><Button type="button" variant="ghost" size="icon" aria-label="Delete reminder" onClick={() => setReminders((list) => list.filter((_,i) => i !== index))}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
      </section>
      <div className="flex gap-2"><Button disabled={saving} type="submit"><Save className="mr-2 h-4 w-4"/>{saving ? 'Saving...' : 'Save changes'}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
    </form>
  </div>;
}
