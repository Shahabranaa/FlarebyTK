---
name: Managed Postgres UUID defaults
description: Why gen_random_uuid() DB defaults can silently be absent on managed Postgres and how to avoid NOT NULL violations.
---
Rule: generate UUIDs (tracking tokens etc.) in application code (`crypto.randomUUID()`), never rely on a `DEFAULT gen_random_uuid()` column default.

**Why:** On the user's managed Postgres (Neon via Vercel), the schema bootstrap's best-effort `CREATE EXTENSION pgcrypto` can fail and the table can end up without a working default — inserts then fail with a 23502 NOT NULL violation on `tracking_token`, which happened in production on 2026-07-07.

**How to apply:** Any new table with a UUID column in this project should get its value from app code in the INSERT.
