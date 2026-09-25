import {describe,expect,it} from 'vitest';
import {fallbackExtraction} from '@/lib/local-ocr';
describe('local OCR mapping',()=>{it('creates a reviewable low-confidence draft',()=>{const result=fallbackExtraction('\nElectricity Bill\nAmount 1200');expect(result.title).toBe('Electricity Bill');expect(result.category).toBe('GENERAL_REMINDER');expect(result.confidence).toBeLessThan(.5);expect(result.description).toContain('Amount 1200');});});
