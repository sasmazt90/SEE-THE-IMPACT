# SEE THE IMPACT

Independent Next.js deployment for seetheimpact.info.

## Background media

Homepage backgrounds are served from local public assets, not Tempo or Supabase Storage:

- `/videos/City-Clean.mp4`
- `/videos/City-Polluted.mp4`
- `/videos/Earth-Clean.mp4`
- `/videos/Earth-Polluted.mp4`
- `/videos/Underwater-Clean.mp4`
- `/videos/Underwater-Polluted.mp4`

Dynamic mode plays the concepts in this order: City, Earth, Underwater. The left side shows the clean video and the right side shows the polluted video. Mouse movement controls the before/after split.

Score/result mode uses static image splits from `/images` so the clean width equals the analyzed score percentage.

## Environment

Copy `.env.example` to `.env.local` for local development and configure the same variables in Vercel:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

Do not commit real secret values.

## Supabase

The required table schema is in:

`supabase/migrations/20260601_see_the_impact_tables.sql`

Apply it to the See The Impact Supabase project before enabling sponsored placements and contact form storage.
