import {describe,expect,it} from 'vitest';
import {lifeItemInput} from '@/lib/validation';
describe('life item input security',()=>{it('rejects invalid reminder timestamps',()=>{expect(()=>lifeItemInput.parse({title:'Test',category:'GENERAL_REMINDER',reminders:[{remind_at:'not-a-date',channel:'BOTH'}]})).toThrow();});it('rejects oversized titles',()=>{expect(()=>lifeItemInput.parse({title:'x'.repeat(501),category:'GENERAL_REMINDER',reminders:[]})).toThrow();});});
