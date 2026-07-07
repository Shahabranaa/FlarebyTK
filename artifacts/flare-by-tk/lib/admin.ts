import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "admin-session";

/**
 * Derives a session token from ADMIN_PASSWORD using HMAC-SHA256 so the raw
 * password is never stored in the cookie. Stateless — no extra env vars or
 * auth libraries needed.
 */
export function sessionToken(): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return null;
  return createHmac("sha256", adminPassword)
    .update("flare-admin-session-v1")
    .digest("hex");
}

export function isAdmin(request: NextRequest): boolean {
  const expected = sessionToken();
  if (!expected) return false;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!cookie || cookie.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
  } catch {
    return false;
  }
}
