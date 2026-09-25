import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const [destination] = process.argv.slice(2);
const url = process.env.SUPABASE_BACKUP_URL;
const serviceKey = process.env.SUPABASE_BACKUP_SERVICE_KEY;
if (!destination || !url || !serviceKey) throw new Error('Storage backup configuration is incomplete.');

const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = client.storage.from('documents');
const root = path.resolve(destination);
let downloaded = 0;

async function walk(prefix = '') {
  let offset = 0;
  while (true) {
    const { data, error } = await bucket.list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    for (const entry of data ?? []) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id == null) {
        await walk(objectPath);
        continue;
      }
      const output = path.resolve(root, ...objectPath.split('/'));
      if (output !== root && !output.startsWith(`${root}${path.sep}`)) throw new Error('Unsafe object path rejected.');
      const { data: blob, error: downloadError } = await bucket.download(objectPath);
      if (downloadError) throw new Error(`Storage object download failed (${downloadError.statusCode ?? 'unknown status'}).`);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, Buffer.from(await blob.arrayBuffer()));
      downloaded++;
    }
    if ((data?.length ?? 0) < 100) break;
    offset += data.length;
  }
}

await walk();
console.log(`Downloaded ${downloaded} private Storage object(s).`);
