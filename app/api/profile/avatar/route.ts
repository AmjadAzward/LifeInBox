import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data: profile, error } = await supabase.from('profiles').select('image_url').eq('id', user.id).single();
    if (error || !profile?.image_url) throw new Error('NOT_FOUND');
    const { data, error: signError } = await supabase.storage.from('documents').createSignedUrl(profile.image_url, 300);
    if (signError) throw signError;
    return NextResponse.redirect(data.signedUrl, { headers: { 'cache-control': 'private, max-age=240' } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const form = await request.formData();
    const file = form.get('avatar');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image first.' }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension) return NextResponse.json({ error: 'Use a JPG, PNG, or WEBP image.' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Photo must be 5 MB or smaller.' }, { status: 400 });

    const { data: previous } = await supabase.from('profiles').select('image_url').eq('id', user.id).single();
    const path = `${user.id}/avatars/profile-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { error: updateError } = await supabase.from('profiles').update({ image_url: path, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (updateError) { await supabase.storage.from('documents').remove([path]); throw updateError; }
    if (previous?.image_url && previous.image_url !== path) await supabase.storage.from('documents').remove([previous.image_url]);
    return NextResponse.json({ imageUrl: `/api/profile/avatar?v=${Date.now()}` });
  } catch (error) { return apiError(error); }
}

export async function DELETE() {
  try {
    const { supabase, user } = await requireUser();
    const { data: profile } = await supabase.from('profiles').select('image_url').eq('id', user.id).single();
    if (profile?.image_url) await supabase.storage.from('documents').remove([profile.image_url]);
    const { error } = await supabase.from('profiles').update({ image_url: null, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
