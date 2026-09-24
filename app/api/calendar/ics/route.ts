import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

function escape(value: string) { return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
function icsDate(value: string) { return value.replace(/-/g, ''); }

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase.from('life_items').select('id,title,description,location,due_date,event_date,expiry_date,updated_at').eq('owner_id', user.id).not('status','eq','ARCHIVED');
    if (error) throw error;
    const events = (data || []).flatMap((item) => {
      const date = item.event_date || item.due_date || item.expiry_date;
      if (!date) return [];
      const next = new Date(`${date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
      return [`BEGIN:VEVENT\r\nUID:${item.id}@lifeinbox\r\nDTSTAMP:${new Date(item.updated_at).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}\r\nDTSTART;VALUE=DATE:${icsDate(date)}\r\nDTEND;VALUE=DATE:${icsDate(next.toISOString().slice(0,10))}\r\nSUMMARY:${escape(item.title)}\r\nDESCRIPTION:${escape(item.description || '')}\r\nLOCATION:${escape(item.location || '')}\r\nEND:VEVENT`];
    });
    const body = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LifeInbox//Calendar//EN\r\nCALSCALE:GREGORIAN\r\n${events.join('\r\n')}\r\nEND:VCALENDAR\r\n`;
    return new NextResponse(body, { headers: { 'content-type':'text/calendar; charset=utf-8', 'content-disposition':'attachment; filename="lifeinbox.ics"' } });
  } catch (error) { return apiError(error); }
}
