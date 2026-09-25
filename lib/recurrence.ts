export type RecurrenceFrequency = 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY';

export function parseRecurrence(rule: string) {
  const normalized = rule.toUpperCase().trim();
  const frequency = ((normalized.match(/(?:^|;)FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/)?.[1] || normalized.match(/DAILY|WEEKLY|MONTHLY|YEARLY/)?.[0] || 'MONTHLY')) as RecurrenceFrequency;
  const interval = Math.max(1, Math.min(99, Number(normalized.match(/(?:^|;)INTERVAL=(\d+)/)?.[1] || 1)));
  return { frequency, interval };
}

export function recurrenceRule(frequency: RecurrenceFrequency, interval: number) {
  return `FREQ=${frequency};INTERVAL=${Math.max(1, Math.min(99, Math.floor(interval)))}`;
}

export function nextRecurrenceDate(value: string, rule: string) {
  const date = new Date(`${value}T12:00:00Z`);
  const {frequency,interval}=parseRecurrence(rule);
  if(frequency==='DAILY')date.setUTCDate(date.getUTCDate()+interval);
  else if(frequency==='WEEKLY')date.setUTCDate(date.getUTCDate()+7*interval);
  else if(frequency==='YEARLY')date.setUTCFullYear(date.getUTCFullYear()+interval);
  else date.setUTCMonth(date.getUTCMonth()+interval);
  return date.toISOString().slice(0,10);
}
