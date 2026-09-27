const fs = require('node:fs');
const environment = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) environment[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}
fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: environment.GOOGLE_CALENDAR_CLIENT_ID,
    client_secret: environment.GOOGLE_CALENDAR_CLIENT_SECRET,
    code: 'invalid-diagnostic-code',
    grant_type: 'authorization_code',
    redirect_uri: 'https://tlomzcazeejbwpmjpfrb.supabase.co/auth/v1/callback',
  }),
}).then(async (response) => {
  const result = await response.json();
  console.log('PAIR_RESULT=' + (result.error || response.status));
  console.log('PAIR_DESCRIPTION=' + (result.error_description || 'none'));
});
