import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";
import { Platform } from "react-native";

const alarmSource = require("@/assets/sounds/order_alarm.mp3");

/**
 * Loops the order-alarm ringtone while `active` is true (and not muted),
 * and keeps the screen awake so the phone keeps ringing until the
 * order is accepted — DoorDash style.
 */
export function useOrderAlarm(active: boolean, muted: boolean): void {
  const player = useAudioPlayer(alarmSource);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionModeAndroid: "duckOthers",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const shouldRing = active && !muted;
    try {
      player.loop = true;
      if (shouldRing) {
        player.volume = 1;
        player.play();
      } else {
        player.pause();
        player.seekTo(0);
      }
    } catch {
      // Audio not available (e.g. web autoplay restrictions) — ignore.
    }
    if (Platform.OS !== "web") {
      if (shouldRing) {
        activateKeepAwakeAsync("order-alarm").catch(() => {});
      } else {
        deactivateKeepAwake("order-alarm").catch(() => {});
      }
    }
    return () => {
      try {
        player.pause();
      } catch {}
    };
  }, [active, muted, player]);
}
