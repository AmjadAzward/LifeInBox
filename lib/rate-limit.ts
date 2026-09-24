import { NextResponse } from 'next/server';

const buckets = new Map<string,{count:number;resetAt:number}>();
export function rateLimit(key:string, limit:number, windowMs:number) {
  const now=Date.now(); const current=buckets.get(key);
  if(!current||current.resetAt<=now){buckets.set(key,{count:1,resetAt:now+windowMs});return null;}
  if(current.count>=limit)return NextResponse.json({error:'Too many requests. Please try again later.'},{status:429,headers:{'retry-after':String(Math.ceil((current.resetAt-now)/1000))}});
  current.count+=1; return null;
}
