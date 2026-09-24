import type { SupabaseClient } from '@supabase/supabase-js';

export async function writeAudit(db: SupabaseClient, ownerId: string, action: string, entityType: string, entityId?: string | null, metadata: Record<string, unknown> = {}) {
  const { error } = await db.from('audit_logs').insert({ owner_id: ownerId, action, entity_type: entityType, entity_id: entityId || null, metadata });
  if (error && !String(error.message).includes('audit_logs')) console.error('[LifeInbox audit]', error.message);
}
