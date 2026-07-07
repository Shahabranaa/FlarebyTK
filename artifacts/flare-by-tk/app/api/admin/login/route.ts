import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionToken } from "@/lib/admin";

export const dynamic = "force-dynamic";

function passwordMatches(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 },
    );
  }
  const body = await request.json().catch(() => null);
  const password = (body as Record<string, unknown>)?.password;
  if (typeof password !== "string" || !passwordMatches(password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = sessionToken();
  if (!token) {
    return NextResponse.json({ error: "Session error" }, { status: 500 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
