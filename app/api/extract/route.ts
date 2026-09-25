import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
import { categories } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { extractLocalText, fallbackExtraction } from '@/lib/local-ocr';

const requestSchema = z.object({ text: z.string().max(30000).optional(), attachmentId: z.string().uuid().optional() }).refine((v) => v.text || v.attachmentId);
const extractionSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string' }, category: { type: 'string', enum: categories }, description: { type: ['string','null'] },
    organization: { type: ['string','null'] }, person_name: { type: ['string','null'] }, amount: { type: ['number','null'] },
    currency: { type: 'string' }, issue_date: { type: ['string','null'] }, due_date: { type: ['string','null'] },
    event_date: { type: ['string','null'] }, expiry_date: { type: ['string','null'] }, reference_number: { type: ['string','null'] },
    location: { type: ['string','null'] }, action_required: { type: ['string','null'] }, confidence: { type: 'number' },
    field_confidence: { type: 'object', additionalProperties: { type: 'number' } },
    suggested_reminders: { type: 'array', items: { type: 'string' } }
  },
  required: ['title','category','description','organization','person_name','amount','currency','issue_date','due_date','event_date','expiry_date','reference_number','location','action_required','confidence','field_confidence','suggested_reminders']
} as const;

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const limited=rateLimit(`extract:${user.id}`,10,60_000); if(limited)return limited;
    const input = requestSchema.parse(await request.json());
    const content: any[] = [{ type: 'input_text', text: `Extract life-management details. Dates must be YYYY-MM-DD, currency ISO-4217, reminders ISO-8601 with timezone. Do not invent missing facts.\n\n${input.text || ''}` }];
    let localText = input.text || '';
    if (input.attachmentId) {
      const { data: attachment, error } = await supabase.from('attachments').select('*').eq('id', input.attachmentId).eq('owner_id', user.id).single();
      if (error || !attachment) throw new Error('NOT_FOUND');
      const { data: blob, error: downloadError } = await supabase.storage.from('documents').download(attachment.storage_path);
      if (downloadError) throw downloadError;
      const fileBytes = new Uint8Array(await blob.arrayBuffer());
      const base64 = Buffer.from(fileBytes).toString('base64');
      try { localText = await extractLocalText(fileBytes, attachment.mime_type); } catch (ocrError) { if (!process.env.OPENAI_API_KEY) throw ocrError; }
      content.push(attachment.file_type === 'PDF'
        ? { type: 'input_file', filename: attachment.file_name, file_data: `data:${attachment.mime_type};base64,${base64}` }
        : { type: 'input_image', image_url: `data:${attachment.mime_type};base64,${base64}`, detail: 'high' });
    }
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ data: fallbackExtraction(localText), localOcr: true });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await openai.responses.create({
        model: process.env.OPENAI_EXTRACTION_MODEL || 'gpt-4o-mini',
        input: [{ role: 'user', content }],
        text: { format: { type: 'json_schema', name: 'life_item_extraction', strict: true, schema: extractionSchema } },
      } as any);
      return NextResponse.json({ data: JSON.parse(response.output_text) });
    } catch (aiError) {
      if (localText.trim()) return NextResponse.json({ data: fallbackExtraction(localText), localOcr: true, warning: 'AI extraction failed; local OCR was used.' });
      throw aiError;
    }
  } catch (error) { return apiError(error); }
}
