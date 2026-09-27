const fs = require('node:fs');
const webpush = require('web-push');

const file = '.env.local';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const values = Object.fromEntries(lines.map((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  return match ? [match[1].trim(), match[2].trim()] : [null, null];
}).filter(([key]) => key));

if (values.NEXT_PUBLIC_VAPID_PUBLIC_KEY && values.VAPID_PRIVATE_KEY) {
  console.log('VAPID keys are already configured; no changes made.');
  process.exit(0);
}

const keys = webpush.generateVAPIDKeys();
const updates = {
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: keys.publicKey,
  VAPID_PRIVATE_KEY: keys.privateKey,
  VAPID_SUBJECT: values.VAPID_SUBJECT || 'mailto:support@lifeinbox.local',
};

for (const [name, value] of Object.entries(updates)) {
  const index = lines.findIndex((line) => line.startsWith(name + '='));
  if (index >= 0) lines[index] = name + '=' + value;
  else lines.push(name + '=' + value);
}
fs.writeFileSync(file, lines.join('\n'), { encoding: 'utf8', mode: 0o600 });
console.log('Generated and saved VAPID keys in .env.local (values hidden).');
