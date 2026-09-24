import { z } from 'zod';

export const categories = ['BILL','APPOINTMENT','TRAVEL','SUBSCRIPTION','INSURANCE','WARRANTY','DOCUMENT_EXPIRY','RESERVATION','RETURN','DELIVERY','VEHICLE','MEMBERSHIP','MEDICATION','BORROWING','GENERAL_REMINDER'] as const;
export const statuses = ['UPCOMING','NEEDS_ATTENTION','DUE_TODAY','OVERDUE','COMPLETED','EXPIRED','ARCHIVED'] as const;

export const lifeItemInput = z.object({
  title: z.string().trim().min(1).max(200),
  workspace_id: z.string().uuid().nullable().optional(),
  category: z.enum(categories),
  description: z.string().max(5000).nullable().optional(),
  organization: z.string().max(200).nullable().optional(),
  person_name: z.string().max(200).nullable().optional(),
  amount: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).default('LKR'),
  issue_date: z.string().date().nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  event_date: z.string().date().nullable().optional(),
  expiry_date: z.string().date().nullable().optional(),
  due_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  event_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  expiry_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  reference_number: z.string().max(200).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  action_required: z.string().max(500).nullable().optional(),
  status: z.enum(statuses).default('UPCOMING'),
  recurring: z.boolean().default(false),
  recurrence_rule: z.string().max(100).nullable().optional(),
  ai_generated: z.boolean().default(false),
  ai_confidence: z.number().min(0).max(1).default(1),
  confirmed: z.boolean().default(true),
  reminders: z.array(z.object({ remind_at: z.string().datetime(), channel: z.enum(['PUSH','EMAIL','BOTH']) })).default([]),
});

export const lifeItemPatch = lifeItemInput.partial().extend({
  action: z.enum(['complete', 'archive', 'restore', 'delete', 'undelete']).optional(),
});
