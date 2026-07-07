import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Registers an Expo push token for the admin mobile app. */
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (
      !token ||
      token.length > 512 ||
      !/^Expo(nent)?PushToken\[.+\]$/.test(token)
    ) {
      return NextResponse.json(
        { error: "A valid Expo push token is required" },
        { status: 400 },
      );
    }
    await sql(
      `INSERT INTO device_tokens (token) VALUES ($1)
       ON CONFLICT (token) DO UPDATE SET last_seen_at = NOW()`,
      [token],
    );
    return NextResponse.json({ registered: true });
  } catch (err) {
    console.error("POST /api/devices failed", err);
    return NextResponse.json(
      { error: "Failed to register device" },
      { status: 500 },
    );
  }
}
