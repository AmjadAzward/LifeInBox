import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import webpush from 'web-push';
import { createAdminSupabase } from '@/lib/supabase/server';
import { nextRecurrenceDate } from '@/lib/recurrence';

function dateOnly(value: Date) { return value.toISOString().slice(0, 10); }

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = createAdminSupabase();
  const abandonedBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: abandoned } = await db.from('attachments').select('id,storage_path').is('life_item_id',null).lt('created_at',abandonedBefore);
  if (abandoned?.length) {
    await db.storage.from('documents').remove(abandoned.map((item)=>item.storage_path));
    await db.from('attachments').delete().in('id',abandoned.map((item)=>item.id));
  }
  const today = dateOnly(new Date());
  const soon = new Date(); soon.setUTCDate(soon.getUTCDate() + 7);
  const { data: activeItems } = await db.from('life_items').select('id,due_date,event_date,expiry_date,status').not('status', 'in', '(COMPLETED,ARCHIVED)');
  for (const item of activeItems || []) {
    const primary = item.due_date || item.event_date || item.expiry_date;
    if (!primary) continue;
    let status = primary < today ? (item.expiry_date === primary ? 'EXPIRED' : 'OVERDUE') : primary === today ? 'DUE_TODAY' : primary <= dateOnly(soon) ? 'NEEDS_ATTENTION' : 'UPCOMING';
    if (status !== item.status) await db.from('life_items').update({ status, updated_at: new Date().toISOString() }).eq('id', item.id);
  }

  const { data: recurringItems } = await db.from('life_items').select('*').eq('recurring', true).eq('status', 'COMPLETED').not('recurrence_rule', 'is', null);
  for (const item of recurringItems || []) {
    const primaryKey = item.due_date ? 'due_date' : item.event_date ? 'event_date' : item.expiry_date ? 'expiry_date' : null;
    if (!primaryKey || !item[primaryKey]) continue;
    const nextDate = nextRecurrenceDate(item[primaryKey], item.recurrence_rule);
    if (!nextDate) continue;
    const { id, created_at, updated_at, completed_at, archived_at, search_vector, ...copy } = item;
    const { data: duplicate } = await db.from('life_items').select('id').eq('owner_id', item.owner_id).eq('title', item.title).eq(primaryKey, nextDate).maybeSingle();
    if (!duplicate) await db.from('life_items').insert({ ...copy, [primaryKey]: nextDate, status: 'UPCOMING', completed_at: null, archived_at: null });
  }
  const dayKey=today; const isMonday=new Date().getUTCDay()===1;
  const {data:summaryUsers}=await db.from('user_preferences').select('*,profiles!inner(id,email,full_name)').or(`morning_summary.eq.true,weekly_summary.eq.true`);
  for(const preference of summaryUsers||[]){
    const profile:any=preference.profiles; const weekly=isMonday&&preference.weekly_summary; if(!preference.morning_summary&&!weekly)continue;
    const title=weekly?`Weekly summary - ${dayKey}`:`Morning summary - ${dayKey}`;
    const{data:exists}=await db.from('notifications').select('id').eq('owner_id',profile.id).eq('title',title).maybeSingle();if(exists)continue;
    const horizon=new Date();horizon.setUTCDate(horizon.getUTCDate()+(weekly?7:1));
    const{data:items}=await db.from('life_items').select('title,due_date,event_date,expiry_date').eq('owner_id',profile.id).is('deleted_at',null).not('status','in','(COMPLETED,ARCHIVED)').or(`due_date.lte.${dateOnly(horizon)},event_date.lte.${dateOnly(horizon)},expiry_date.lte.${dateOnly(horizon)}`).limit(20);
    const message=items?.length?items.map((entry:any)=>entry.title).join(', '):'Nothing needs your attention.';
    await db.from('notifications').insert({owner_id:profile.id,title,message,type:'SYSTEM'});
    if(preference.email_enabled&&process.env.RESEND_API_KEY&&process.env.REMINDER_FROM_EMAIL)await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.REMINDER_FROM_EMAIL,to:profile.email,subject:`LifeInbox ${weekly?'weekly':'morning'} summary`,text:message});
  }
  const { data: reminders, error } = await db.from('reminders').select('*, life_items!inner(*, profiles!inner(*), user_preferences!inner(*))').eq('status', 'PENDING').lte('remind_at', new Date().toISOString()).limit(100);
  if (error) throw error;
  let sent = 0;
  for (const reminder of reminders || []) {
    const item: any = reminder.life_items;
    const message = `${item.title}${item.action_required ? ` - ${item.action_required}` : ''}`;
    try {
      if ((reminder.channel === 'EMAIL' || reminder.channel === 'BOTH') && item.user_preferences.email_enabled && process.env.RESEND_API_KEY) {
        await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.REMINDER_FROM_EMAIL!, to: item.profiles.email, subject: `LifeInbox reminder: ${item.title}`, text: message });
      }
      if ((reminder.channel === 'PUSH' || reminder.channel === 'BOTH') && item.user_preferences.push_enabled && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
        const { data: subs } = await db.from('push_subscriptions').select('*').eq('owner_id', item.owner_id);
        await Promise.all((subs || []).map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: item.title, body: message, url: `/app/my-life/${item.id}` })).catch(() => null)));
      }
      await db.from('notifications').insert({ owner_id: item.owner_id, life_item_id: item.id, title: item.title, message, type: 'REMINDER' });
      await db.from('notification_deliveries').insert({owner_id:item.owner_id,reminder_id:reminder.id,channel:reminder.channel,status:'SENT'});
      await db.from('reminders').update({ status: 'SENT', sent_at: new Date().toISOString(), attempts: reminder.attempts + 1 }).eq('id', reminder.id); sent++;
    } catch (e) { const failure=e instanceof Error?e.message.slice(0,500):'Unknown error';await db.from('reminders').update({ status: 'FAILED', failed_at: new Date().toISOString(), attempts: reminder.attempts + 1, last_error:failure }).eq('id', reminder.id);await db.from('notification_deliveries').insert({owner_id:item.owner_id,reminder_id:reminder.id,channel:reminder.channel,status:'FAILED',error:failure}); }
  }
  return NextResponse.json({ processed: reminders?.length || 0, sent, statusesChecked: activeItems?.length || 0, recurringChecked: recurringItems?.length || 0, abandonedUploadsRemoved: abandoned?.length || 0, summariesChecked:summaryUsers?.length||0 });
}
