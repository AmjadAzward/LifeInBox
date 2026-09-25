import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { scanUpload } from '@/lib/malware-scan';

const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf']);
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const limited=rateLimit(`upload:${user.id}`,20,60_000); if(limited)return limited;
    const form = await request.formData();
    const file = form.get('file');
    const lifeItemId = form.get('lifeItemId');
    if (!(file instanceof File) || !allowed.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Invalid file. Use JPG, PNG, WEBP or PDF up to 10 MB.' }, { status: 400 });
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    await scanUpload(fileBytes);
    const bytes = fileBytes.slice(0, Math.min(fileBytes.length, 1024 * 1024));
    if (file.type === 'application/pdf') {
      const signature = new TextDecoder('latin1').decode(bytes);
      if (!signature.startsWith('%PDF-')) return NextResponse.json({ error:'This file is not a valid PDF.' }, { status:400 });
      if (signature.includes('/Encrypt')) return NextResponse.json({ error:'Password-protected PDFs are not supported.' }, { status:400 });
    }
    const suspicious = new TextDecoder('latin1').decode(bytes.slice(0, 4096)).toLowerCase();
    if (suspicious.includes('<script') || suspicious.includes('javascript:')) return NextResponse.json({ error:'The file contains unsupported active content.' }, { status:400 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase.from('attachments').insert({ owner_id: user.id, life_item_id: typeof lifeItemId === 'string' && lifeItemId ? lifeItemId : null, file_name: file.name, storage_path: path, file_type: file.type === 'application/pdf' ? 'PDF' : 'IMAGE', mime_type: file.type, file_size: file.size }).select().single();
    if (error) { await supabase.storage.from('documents').remove([path]); throw error; }
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
