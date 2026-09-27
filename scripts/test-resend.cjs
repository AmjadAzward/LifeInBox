const fs=require('node:fs');
const {Resend}=require('resend');
const environment={};
for(const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const match=line.match(/^([^#=]+)=(.*)$/);if(match)environment[match[1].trim()]=match[2].trim().replace(/^['"]|['"]$/g,'');}
if(!environment.RESEND_API_KEY)throw new Error('RESEND_API_KEY is missing from .env.local.');
if(!environment.RESEND_TEST_TO_EMAIL)throw new Error('RESEND_TEST_TO_EMAIL is missing from .env.local.');
new Resend(environment.RESEND_API_KEY).emails.send({
  from:environment.REMINDER_FROM_EMAIL||'LifeInbox <onboarding@resend.dev>',
  to:environment.RESEND_TEST_TO_EMAIL,
  subject:'LifeInbox email test',
  text:'LifeInbox reminder email delivery is configured correctly.',
}).then(({data,error})=>{if(error)throw new Error(error.message);console.log('RESEND_TEST_ACCEPTED id='+data.id);});
