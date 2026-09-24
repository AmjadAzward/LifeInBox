const { loadEnvConfig }=require('@next/env');const{createClient}=require('@supabase/supabase-js');loadEnvConfig(process.cwd());
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
async function main(){const{data:users,error:uerr}=await db.auth.admin.listUsers({page:1,perPage:50});if(uerr)throw uerr;const user=users.users.find(u=>u.email===process.env.SEED_USER_EMAIL)||users.users[0];if(!user)throw new Error('No user');const checks=[];
  const profile=await db.from('profiles').select('*,user_preferences(*)').eq('id',user.id).single();checks.push(['profile',!profile.error&&profile.data.email===user.email]);
  const items=await db.from('life_items').select('*,attachments(*),reminders(*)').eq('owner_id',user.id);checks.push(['life items',!items.error&&items.data.length>=8]);checks.push(['searchable categories',new Set((items.data||[]).map(i=>i.category)).size>=6]);checks.push(['recurrence',(items.data||[]).some(i=>i.recurring)]);checks.push(['completed status',(items.data||[]).some(i=>i.status==='COMPLETED')]);checks.push(['private attachment',(items.data||[]).some(i=>i.attachments.length)]);checks.push(['reminders',(items.data||[]).reduce((n,i)=>n+i.reminders.length,0)>=6]);
  const notes=await db.from('notifications').select('*').eq('owner_id',user.id);checks.push(['notifications',!notes.error&&notes.data.length>=2]);
  const workspace=await db.from('workspaces').select('*').eq('owner_id',user.id);checks.push(['family workspace',!workspace.error&&workspace.data.length>=1]);
  for(const[name,ok]of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);if(checks.some(([,ok])=>!ok))process.exit(1);
}
main().catch(e=>{console.error('Verification failed:',e.message);process.exit(1)});
