import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EXTRACTION_MODEL: z.string().default('gpt-4o-mini'),
  RESEND_API_KEY: z.string().optional(),
  REMINDER_FROM_EMAIL: z.string().default('LifeInbox <reminders@example.com>'),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:support@example.com'),
  CRON_SECRET: z.string().optional(),
});

export function serverEnv() {
  return schema.parse(process.env);
}

export function publicEnv() {
  return schema.pick({
    NEXT_PUBLIC_SUPABASE_URL: true,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
    NEXT_PUBLIC_APP_URL: true,
  }).parse(process.env);
}
