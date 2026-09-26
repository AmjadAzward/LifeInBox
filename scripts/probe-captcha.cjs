const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');
const environment = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) environment[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}
const client = createClient(environment.NEXT_PUBLIC_SUPABASE_URL, environment.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
client.auth.resetPasswordForEmail(
  `lifeinbox-captcha-probe-${Date.now()}@example.invalid`,
  { captchaToken: 'XXXX.DUMMY.TOKEN.XXXX', redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password' },
).then(({ error }) => {
  if (error) console.log(`SUPABASE_REJECTED status=${error.status} code=${error.code || 'none'} message=${error.message}`);
  else console.log('SUPABASE_ACCEPTED');
});
