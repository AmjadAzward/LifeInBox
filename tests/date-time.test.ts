import { describe, expect, it } from 'vitest';
import { zonedDateTimeToUtc } from '@/lib/date-time';

describe('timezone conversion',()=>{
  it('keeps UTC unchanged',()=>expect(zonedDateTimeToUtc('2026-09-25','08:00','UTC').toISOString()).toBe('2026-09-25T08:00:00.000Z'));
  it('converts Sri Lanka local time to UTC',()=>expect(zonedDateTimeToUtc('2026-09-25','08:00','Asia/Colombo').toISOString()).toBe('2026-09-25T02:30:00.000Z'));
  it('accounts for daylight saving time',()=>expect(zonedDateTimeToUtc('2026-07-01','08:00','America/New_York').toISOString()).toBe('2026-07-01T12:00:00.000Z'));
});
