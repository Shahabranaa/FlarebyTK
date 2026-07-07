---
name: Vercel Hobby plan limits
description: Deployment gotchas when the user deploys this project to Vercel on the free Hobby plan
---

- Rule: `vercel.json` cron schedules must be daily or less frequent on the Hobby plan. A sub-daily schedule (e.g. `* * * * *`) makes the **entire deployment fail**, silently leaving the live site on the old version.
- **Why:** July 2026 — flarebytk.com stayed stale despite GitHub being up to date; the per-minute cron in vercel.json caused every deploy to be rejected, breaking the new "accept order" flow in production.
- **How to apply:** keep the remind cron at a daily schedule; for per-minute reminders suggest Vercel Pro or an external cron (cron-job.org) with a CRON_SECRET bearer header.
- Also: pnpm-only version protocols (`catalog:`, `workspace:*`) in an artifact's package.json break users running plain `npm install` on a downloaded folder (needed for EAS builds) — pin concrete versions in standalone-usable artifacts.
