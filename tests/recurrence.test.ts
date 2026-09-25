import { describe, expect, it } from 'vitest';
import { nextRecurrenceDate, parseRecurrence, recurrenceRule } from '@/lib/recurrence';

describe('recurrence rules',()=>{
  it('supports legacy rules',()=>expect(parseRecurrence('MONTHLY')).toMatchObject({frequency:'MONTHLY',interval:1}));
  it('builds interval rules',()=>expect(recurrenceRule('WEEKLY',2)).toBe('FREQ=WEEKLY;INTERVAL=2'));
  it('advances daily intervals',()=>expect(nextRecurrenceDate('2026-09-25','FREQ=DAILY;INTERVAL=3')).toBe('2026-09-28'));
  it('advances weekly intervals',()=>expect(nextRecurrenceDate('2026-09-25','FREQ=WEEKLY;INTERVAL=2')).toBe('2026-10-09'));
  it('clamps unsafe intervals',()=>expect(parseRecurrence('FREQ=YEARLY;INTERVAL=999')).toMatchObject({frequency:'YEARLY',interval:99}));
  it('supports last day of month',()=>expect(nextRecurrenceDate('2026-01-31','FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=-1')).toBe('2026-02-28'));
  it('stops after the end date',()=>expect(nextRecurrenceDate('2026-09-25','FREQ=DAILY;INTERVAL=1;UNTIL=2026-09-25')).toBeNull());
});
