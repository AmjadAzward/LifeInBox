const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');
loadEnvConfig(process.cwd());
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const ids = {
  bill:'10000000-0000-4000-8000-000000000001', appointment:'10000000-0000-4000-8000-000000000002', travel:'10000000-0000-4000-8000-000000000003', subscription:'10000000-0000-4000-8000-000000000004', insurance:'10000000-0000-4000-8000-000000000005', document:'10000000-0000-4000-8000-000000000006', completed:'10000000-0000-4000-8000-000000000007', returnItem:'10000000-0000-4000-8000-000000000008'
};

async function main(){
  const { data: users, error: usersError } = await db.auth.admin.listUsers({ page:1, perPage:50 });
  if(usersError) throw usersError;
  const user = users.users.find(u => u.email === process.env.SEED_USER_EMAIL) || users.users[0];
  if(!user) throw new Error('No Supabase user exists. Register first.');
  const now = new Date().toISOString();
  const items = [
    {id:ids.bill,title:'CEB Electricity Bill',category:'BILL',description:'Sample monthly electricity bill',organization:'Ceylon Electricity Board',amount:8450,currency:'LKR',issue_date:'2026-09-20',due_date:'2026-09-28',reference_number:'SAMPLE-CEB-001',action_required:'Pay electricity bill',status:'NEEDS_ATTENTION',recurring:true,recurrence_rule:'MONTHLY',ai_generated:true,ai_confidence:.95,confirmed:true},
    {id:ids.appointment,title:'Dental Appointment',category:'APPOINTMENT',description:'Sample dental check-up',organization:'Smile Dental Clinic',person_name:'Dr. Perera',amount:3500,currency:'LKR',event_date:'2026-09-29',location:'Colombo 03',action_required:'Attend appointment',status:'UPCOMING',recurring:false,ai_generated:false,ai_confidence:1,confirmed:true},
    {id:ids.travel,title:'Emirates Flight EK649',category:'TRAVEL',description:'Sample flight from Colombo to Dubai',organization:'Emirates',currency:'LKR',event_date:'2026-10-04',reference_number:'EK649-SAMPLE',location:'CMB to DXB',action_required:'Check in 24 hours before departure',status:'UPCOMING',recurring:false,ai_generated:true,ai_confidence:.92,confirmed:true},
    {id:ids.subscription,title:'Netflix Subscription',category:'SUBSCRIPTION',description:'Sample monthly renewal',organization:'Netflix',amount:2990,currency:'LKR',due_date:'2026-10-18',action_required:'Review subscription',status:'UPCOMING',recurring:true,recurrence_rule:'MONTHLY',ai_generated:false,ai_confidence:1,confirmed:true},
    {id:ids.insurance,title:'Vehicle Insurance',category:'INSURANCE',description:'Sample annual insurance renewal',organization:'Sri Lanka Insurance',amount:89000,currency:'LKR',expiry_date:'2026-12-15',reference_number:'SAMPLE-SLI-001',action_required:'Renew vehicle insurance',status:'UPCOMING',recurring:true,recurrence_rule:'YEARLY',ai_generated:false,ai_confidence:1,confirmed:true},
    {id:ids.document,title:'Passport Renewal',category:'DOCUMENT_EXPIRY',description:'Sample passport expiry reminder',organization:'Department of Immigration',currency:'LKR',expiry_date:'2027-03-10',reference_number:'SAMPLE-PASSPORT',action_required:'Renew passport',status:'UPCOMING',recurring:false,ai_generated:false,ai_confidence:1,confirmed:true},
    {id:ids.completed,title:'Water Bill - NWSDB',category:'BILL',description:'Sample completed water bill',organization:'National Water Supply & Drainage Board',amount:1200,currency:'LKR',due_date:'2026-08-30',reference_number:'SAMPLE-WATER-001',action_required:'Pay water bill',status:'COMPLETED',recurring:true,recurrence_rule:'MONTHLY',ai_generated:false,ai_confidence:1,confirmed:true,completed_at:'2026-08-30T14:00:00Z'},
    {id:ids.returnItem,title:'Amazon Return',category:'RETURN',description:'Sample product return deadline',organization:'Amazon',currency:'USD',due_date:'2026-09-30',reference_number:'SAMPLE-RETURN-001',action_required:'Ship return package',status:'DUE_TODAY',recurring:false,ai_generated:false,ai_confidence:1,confirmed:true},
  ].map(i=>({...i,owner_id:user.id,updated_at:now}));
  const { error:itemError }=await db.from('life_items').upsert(items,{onConflict:'id'}); if(itemError)throw itemError;
  await db.from('reminders').delete().in('life_item_id',Object.values(ids));
  const reminders=[
    {life_item_id:ids.bill,remind_at:'2026-09-25T08:00:00+05:30',channel:'BOTH',status:'PENDING'},
    {life_item_id:ids.bill,remind_at:'2026-09-28T08:00:00+05:30',channel:'BOTH',status:'PENDING'},
    {life_item_id:ids.appointment,remind_at:'2026-09-28T08:00:00+05:30',channel:'EMAIL',status:'PENDING'},
    {life_item_id:ids.travel,remind_at:'2026-10-03T08:00:00+05:30',channel:'PUSH',status:'PENDING'},
    {life_item_id:ids.insurance,remind_at:'2026-11-15T08:00:00+05:30',channel:'BOTH',status:'PENDING'},
    {life_item_id:ids.document,remind_at:'2026-12-10T08:00:00+05:30',channel:'BOTH',status:'PENDING'},
  ];
  const {error:reminderError}=await db.from('reminders').insert(reminders);if(reminderError)throw reminderError;
  await db.from('notifications').delete().eq('owner_id',user.id).like('title','Sample:%');
  const {error:notificationError}=await db.from('notifications').insert([
    {owner_id:user.id,life_item_id:ids.bill,title:'Sample: Electricity bill due soon',message:'Your CEB bill is due on 28 September.',type:'REMINDER',read:false},
    {owner_id:user.id,life_item_id:ids.appointment,title:'Sample: Appointment reminder',message:'Dental appointment on 29 September.',type:'REMINDER',read:true},
  ]);if(notificationError)throw notificationError;
  const path=`${user.id}/sample-electricity-bill.pdf`;
  const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
  const {error:uploadError}=await db.storage.from('documents').upload(path,pdf,{contentType:'application/pdf',upsert:true});if(uploadError)throw uploadError;
  await db.from('attachments').delete().eq('owner_id',user.id).eq('storage_path',path);
  const {error:attachmentError}=await db.from('attachments').insert({life_item_id:ids.bill,owner_id:user.id,file_name:'sample-electricity-bill.pdf',storage_path:path,file_type:'PDF',mime_type:'application/pdf',file_size:pdf.length});if(attachmentError)throw attachmentError;
  const {data:existingWorkspace,error:workspaceReadError}=await db.from('workspaces').select('*').eq('owner_id',user.id).eq('name','My Family').maybeSingle();if(workspaceReadError)throw workspaceReadError;
  let workspace=existingWorkspace;
  if(!workspace){const result=await db.from('workspaces').insert({name:'My Family',owner_id:user.id}).select().single();if(result.error)throw result.error;workspace=result.data;}
  const {error:memberError}=await db.from('workspace_members').upsert({workspace_id:workspace.id,user_id:user.id,role:'OWNER'});if(memberError)throw memberError;
  console.log(`Seeded 8 life items, 6 reminders, 2 notifications, and 1 private document for ${user.email}.`);
}
main().catch(e=>{console.error('Seed failed:',e.message);process.exit(1)});
