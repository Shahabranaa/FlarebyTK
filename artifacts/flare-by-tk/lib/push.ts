import { sql } from "./db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Sends a high-priority push notification to every registered admin device.
 * Best-effort: failures are logged, never thrown, so order placement is
 * never blocked by push issues. Invalid/expired tokens are pruned.
 */
export async function sendPushToAdminDevices(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const rows = await sql<{ token: string }>(
      `SELECT token FROM device_tokens`,
    );
    if (rows.length === 0) return;

    const messages = rows.map((r) => ({
      to: r.token,
      title,
      body,
      data: data ?? {},
      sound: "default",
      priority: "high",
      channelId: "orders",
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    if (!res.ok) {
      console.error("Expo push send failed", res.status, await res.text());
      return;
    }
    const result = (await res.json()) as {
      data?: { status: string; details?: { error?: string } }[];
    };
    const tickets = result.data ?? [];
    const dead: string[] = [];
    tickets.forEach((ticket, i) => {
      if (
        ticket.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered" &&
        rows[i]
      ) {
        dead.push(rows[i].token);
      }
    });
    if (dead.length > 0) {
      await sql(`DELETE FROM device_tokens WHERE token = ANY($1::text[])`, [
        dead,
      ]);
    }
  } catch (err) {
    console.error("sendPushToAdminDevices failed", err);
  }
}
