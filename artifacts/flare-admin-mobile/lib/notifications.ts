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

/**
 * Requests notification permission and returns the Expo push token,
 * or null when push is unavailable (web, simulator, Expo Go, denied).
 */
export async function getPushTokenAsync(): Promise<string | null> {
  if (Platform.OS === "web" || !Device.isDevice) return null;
  try {
    await ensureOrdersChannel();
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } })
        ?.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return token.data;
  } catch {
    // Expo Go on Android no longer supports remote push — the APK build does.
    return null;
  }
}
