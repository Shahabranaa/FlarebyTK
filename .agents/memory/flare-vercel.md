---
name: Flare-by-TK deployment model
description: Why flare-by-tk is a Next.js app inside a react-vite artifact shell and why api-server no longer owns /api
---

- `artifacts/flare-by-tk` is a **standalone Next.js 15 App Router app** (raw `pg`, Tailwind v4) that the user deploys to **Vercel** (Root Directory = `artifacts/flare-by-tk`, env: `DATABASE_URL` + `ADMIN_PASSWORD`). Do not suggest Replit publish for it.
  - **Why:** user's spec explicitly required Vercel hosting with only those two env vars and no ORM/auth libraries.
- The artifact was created via the react-vite template then converted; its `integratedSkills` block must stay in artifact.toml (verifyAndReplaceArtifactToml rejects edits that remove it).
- The template `api-server` artifact was moved from proxy path `/api` to `/_shared-api` so Next.js's own `/api/*` routes are reachable through the preview proxy. If a future app needs the shared Express API, it is at `/_shared-api`.
- Dev admin password is `admin123`, set in the flare artifact.toml `[services.env]` — dev-only; user sets the real one on Vercel.
- Seeding: `POST /api/setup?key=<ADMIN_PASSWORD>` (add `&force=true` to re-seed).
