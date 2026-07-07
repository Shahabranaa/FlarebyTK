import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendPushToAdminDevices } from "@/lib/push";

export const dynamic = "force-dynamic";

const MIN_INTERVAL_MS = 50_000;

/**
 * Re-sends a push notification while any order is still in "new" status,
 * so admin phones keep ringing until someone accepts the order.
 * Triggered by Vercel Cron (see vercel.json).
 *
 * Auth: when CRON_SECRET is set, Vercel sends `Authorization: Bearer
 * ${CRON_SECRET}` and it is strictly required. Without it, we only accept
 * requests carrying Vercel's cron user-agent, and a DB-backed minimum
 * interval gate caps sends at ~1/minute so the route cannot be abused
 * for push spam.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    const ua = request.headers.get("user-agent") ?? "";
    if (!ua.toLowerCase().startsWith("vercel-cron")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Rate-limit gate (atomic upsert): only proceed if the last reminder
    // was sent more than MIN_INTERVAL_MS ago.
    const gate = await sql<{ value: string }>(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ('last_remind_at', NOW()::text, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = NOW()::text, updated_at = NOW()
       WHERE settings.updated_at < NOW() - ($1 || ' milliseconds')::interval
       RETURNING value`,
      [String(MIN_INTERVAL_MS)],
    );
    if (gate.length === 0) {
      return NextResponse.json({ skipped: "rate-limited" });
    }

    const pending = await sql<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM orders WHERE status = 'new'`,
    );
    const count = Number(pending[0]?.count ?? 0);
    if (count > 0) {
      await sendPushToAdminDevices(
        "Unaccepted Orders!",
        `${count} order${count === 1 ? "" : "s"} still waiting to be accepted`,
        { reminder: true },
      );
    }
    return NextResponse.json({ pending: count });
  } catch (err) {
    console.error("GET /api/cron/remind failed", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
