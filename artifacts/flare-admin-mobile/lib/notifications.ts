import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureOrdersChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("orders", {
    name: "New Orders",
    importance: Notifications.AndroidImportance.MAX,
    sound: "order_alarm.wav",
    vibrationPattern: [0, 600, 400, 600, 400, 600],
    lightColor: "#ff6b1a",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableVibrate: true,
  });
}

export type PushSetupResult =
  | { ok: true; token: string }
  | { ok: false; reason: "unsupported" | "permission-denied" | "no-firebase" };

/**
 * Requests notification permission and returns the Expo push token,
 * or a reason why push is unavailable (web, simulator, Expo Go, denied,
 * missing Firebase credentials in the APK build).
 */
export async function setupPushAsync(): Promise<PushSetupResult> {
  if (Platform.OS === "web" || !Device.isDevice) {
    return { ok: false, reason: "unsupported" };
  }
  try {
    await ensureOrdersChannel();
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") {
      return { ok: false, reason: "permission-denied" };
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } })
        ?.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return { ok: true, token: token.data };
  } catch {
    // Typical causes: Expo Go on Android (no remote push support) or an
    // APK built without Firebase (google-services.json / FCM key missing).
    return { ok: false, reason: "no-firebase" };
  }
}
