export type RecurrenceFrequency = 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY';

export function parseRecurrence(rule: string) {
  const normalized = rule.toUpperCase().trim();
  const frequency = ((normalized.match(/(?:^|;)FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/)?.[1] || normalized.match(/DAILY|WEEKLY|MONTHLY|YEARLY/)?.[0] || 'MONTHLY')) as RecurrenceFrequency;
  const interval = Math.max(1, Math.min(99, Number(normalized.match(/(?:^|;)INTERVAL=(\d+)/)?.[1] || 1)));
  const weekdays=(normalized.match(/(?:^|;)BYDAY=([A-Z,]+)/)?.[1]||'').split(',').filter(Boolean);
  const lastDay=normalized.includes('BYMONTHDAY=-1');
  const until=normalized.match(/(?:^|;)UNTIL=(\d{4}-\d{2}-\d{2})/)?.[1]||'';
  return { frequency, interval, weekdays, lastDay, until };
}

export function recurrenceRule(frequency: RecurrenceFrequency, interval: number, options:{weekdays?:string[];lastDay?:boolean;until?:string}={}) {
  const parts=[`FREQ=${frequency}`,`INTERVAL=${Math.max(1,Math.min(99,Math.floor(interval)))}`];
  if(frequency==='WEEKLY'&&options.weekdays?.length)parts.push(`BYDAY=${options.weekdays.join(',')}`);
  if(frequency==='MONTHLY'&&options.lastDay)parts.push('BYMONTHDAY=-1');
  if(options.until)parts.push(`UNTIL=${options.until}`);
  return parts.join(';');
}

export function nextRecurrenceDate(value: string, rule: string) {
  const date = new Date(`${value}T12:00:00Z`);
  const {frequency,interval,weekdays,lastDay,until}=parseRecurrence(rule);
  if(frequency==='DAILY')date.setUTCDate(date.getUTCDate()+interval);
  else if(frequency==='WEEKLY'&&weekdays.length){const map=['SU','MO','TU','WE','TH','FR','SA'];let moved=0;do{date.setUTCDate(date.getUTCDate()+1);moved++;}while((!weekdays.includes(map[date.getUTCDay()])||moved<1)&&moved<7*interval);}
  else if(frequency==='WEEKLY')date.setUTCDate(date.getUTCDate()+7*interval);
  else if(frequency==='YEARLY')date.setUTCFullYear(date.getUTCFullYear()+interval);
  else if(lastDay){date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+interval+1);date.setUTCDate(0);}
  else date.setUTCMonth(date.getUTCMonth()+interval);
  const result=date.toISOString().slice(0,10);return until&&result>until?null:result;
}
