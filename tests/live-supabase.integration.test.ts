import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

function loadLocalEnvironment(){
  try{for(const line of readFileSync(path.join(process.cwd(),'.env.local'),'utf8').split(/\r?\n/)){const match=line.match(/^([^#=]+)=(.*)$/);if(match&&!process.env[match[1].trim()])process.env[match[1].trim()]=match[2].trim().replace(/^['"]|['"]$/g,'');}}catch{}
}
loadLocalEnvironment();
const enabled=process.env.RUN_LIVE_TESTS==='1';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'',anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'',service=process.env.SUPABASE_SERVICE_ROLE_KEY||'';

describe.skipIf(!enabled)('live Supabase authentication, CRUD, RLS, family, and reminder integration',()=>{
  let admin:SupabaseClient,first:SupabaseClient,second:SupabaseClient,firstUser:User,secondUser:User,itemId='',workspaceId='';
  const password='Live-'+crypto.randomUUID()+'-aA1!';
  beforeAll(async()=>{
    if(!url||!anon||!service)throw new Error('Live test environment variables are missing.');
    admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const suffix=crypto.randomUUID();
    const one=await admin.auth.admin.createUser({email:'lifeinbox-live-1-'+suffix+'@example.com',password,email_confirm:true,user_metadata:{full_name:'Live Test One'}});
    const two=await admin.auth.admin.createUser({email:'lifeinbox-live-2-'+suffix+'@example.com',password,email_confirm:true,user_metadata:{full_name:'Live Test Two'}});
    if(one.error||two.error||!one.data.user||!two.data.user)throw one.error||two.error||new Error('Temporary users could not be created.');
    firstUser=one.data.user;secondUser=two.data.user;
    first=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    second=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    expect((await first.auth.signInWithPassword({email:firstUser.email!,password})).error).toBeNull();
    expect((await second.auth.signInWithPassword({email:secondUser.email!,password})).error).toBeNull();
  },30_000);
  afterAll(async()=>{if(admin){if(workspaceId)await admin.from('workspaces').delete().eq('id',workspaceId);if(itemId)await admin.from('life_items').delete().eq('id',itemId);if(firstUser)await admin.auth.admin.deleteUser(firstUser.id);if(secondUser)await admin.auth.admin.deleteUser(secondUser.id);}},30_000);

  it('authenticates valid credentials and rejects invalid credentials',async()=>{
    expect((await first.auth.getUser()).data.user?.id).toBe(firstUser.id);
    const bad=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    expect((await bad.auth.signInWithPassword({email:firstUser.email!,password:'incorrect-password'})).error).toBeTruthy();
  });
  it('enforces owner CRUD isolation',async()=>{
    const inserted=await first.from('life_items').insert({owner_id:firstUser.id,title:'Live RLS item',category:'BILL',status:'UPCOMING',currency:'LKR'}).select().single();
    expect(inserted.error).toBeNull();itemId=inserted.data.id;
    expect((await first.from('life_items').update({title:'Live RLS item updated'}).eq('id',itemId).select().single()).data?.title).toBe('Live RLS item updated');
    expect((await second.from('life_items').select('id').eq('id',itemId)).data).toEqual([]);
    expect((await second.from('life_items').update({title:'Forbidden'}).eq('id',itemId).select()).data).toEqual([]);
  });
  it('enforces reminder ownership',async()=>{
    const own=await first.from('reminders').insert({life_item_id:itemId,remind_at:new Date(Date.now()+3600000).toISOString(),channel:'PUSH'}).select().single();
    expect(own.error).toBeNull();
    expect((await second.from('reminders').select('id').eq('id',own.data.id)).data).toEqual([]);
  });
  it('grants shared workspace access only after membership',async()=>{
    const workspace=await first.from('workspaces').insert({name:'Live Family',owner_id:firstUser.id}).select().single();
    expect(workspace.error).toBeNull();workspaceId=workspace.data.id;
    await first.from('workspace_members').insert({workspace_id:workspaceId,user_id:firstUser.id,role:'OWNER'});
    await first.from('life_items').update({workspace_id:workspaceId}).eq('id',itemId);
    expect((await second.from('life_items').select('id').eq('id',itemId)).data).toEqual([]);
    expect((await first.from('workspace_invites').insert({workspace_id:workspaceId,email:secondUser.email,role:'MEMBER',created_by:firstUser.id}).select().single()).error).toBeNull();
    expect((await second.from('workspace_invites').select('id').eq('workspace_id',workspaceId)).data).toEqual([]);
    expect((await admin.from('workspace_members').insert({workspace_id:workspaceId,user_id:secondUser.id,role:'MEMBER'})).error).toBeNull();
    expect((await second.from('life_items').select('id').eq('id',itemId).single()).data?.id).toBe(itemId);
  });
  it('allows the owner to delete its item',async()=>{
    expect((await first.from('life_items').delete().eq('id',itemId)).error).toBeNull();
    expect((await first.from('life_items').select('id').eq('id',itemId)).data).toEqual([]);itemId='';
  });
});
