import { describe, expect, it } from 'vitest';
import { lifeItemInput } from '@/lib/validation';
describe('life item validation',()=>{
  it('accepts a valid minimal item',()=>{expect(lifeItemInput.parse({title:'Power bill',category:'BILL'})).toMatchObject({currency:'LKR',status:'UPCOMING'});});
  it('rejects invalid confidence and dates',()=>{expect(()=>lifeItemInput.parse({title:'X',category:'BILL',ai_confidence:2,due_date:'tomorrow'})).toThrow();});
});
