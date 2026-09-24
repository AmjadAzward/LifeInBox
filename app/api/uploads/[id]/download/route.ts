import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const { data: attachment, error } = await supabase.from('attachments').select('storage_path').eq('id', params.id).eq('owner_id', user.id).single();
    if (error || !attachment) throw new Error('NOT_FOUND');
    const { data, error: signedError } = await supabase.storage.from('documents').createSignedUrl(attachment.storage_path, 60);
    if (signedError) throw signedError;
    return NextResponse.redirect(data.signedUrl);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('storage_path')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single();
    if (error || !attachment) throw new Error('NOT_FOUND');
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([attachment.storage_path]);
    if (storageError) throw storageError;
    const { error: deleteError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id);
    if (deleteError) throw deleteError;
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
