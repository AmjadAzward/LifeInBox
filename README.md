# LifeInbox

LifeInbox turns images, PDFs, emails, and typed notes into structured life items with dates, actions, private documents, and scheduled reminders.

## Stack

- Next.js 13, React, TypeScript, Tailwind and Radix UI
- Supabase Auth, Postgres, row-level security and private Storage
- OpenAI structured extraction for images, PDFs and text
- Resend email and standards-based Web Push
- Vitest

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and supply the service credentials.
3. Create a Supabase project and apply `supabase/migrations/202609230001_initial.sql` in its SQL editor or with the Supabase CLI.
4. Enable Google in Supabase Auth and add `/auth/callback` to the allowed redirect URLs.
6. Schedule `POST /api/cron/reminders` with `Authorization: Bearer <CRON_SECRET>` at least once per minute.
7. Run `npm run dev`.

The application intentionally returns a clear `503` for optional AI operations when the key is absent. Supabase variables are required for authenticated application routes.

## Verification

Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` before deployment.

## Security model

Every user-owned table has row-level security. Documents are stored in a private bucket beneath the authenticated user ID and are served through short-lived signed URLs. Privileged account deletion and reminder delivery use the service-role key only on the server.
