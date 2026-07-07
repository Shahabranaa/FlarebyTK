import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Order, rs, useAuth } from "@/lib/api";
import { useOrderAlarm } from "@/lib/alarm";
import { getPushTokenAsync } from "@/lib/notifications";

type Filter = "new" | "active" | "past";

const ACTIVE_STATUSES = new Set(["accepted", "preparing", "ready"]);

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ready, loggedIn, apiFetch, logout, baseUrl } = useAuth();
  const [filter, setFilter] = useState<Filter>("new");
  const [muted, setMuted] = useState<boolean>(false);

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await apiFetch("/api/orders");
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      return (await res.json()) as Order[];
    },
    enabled: ready && loggedIn,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (!res.ok) throw new Error(`Failed to accept (${res.status})`);
      return res.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      Alert.alert("Error", "Could not accept the order. Try again.");
    },
  });

  // Register this device for push notifications once logged in.
  useEffect(() => {
    if (!ready || !loggedIn) return;
    (async () => {
      const token = await getPushTokenAsync();
      if (!token) return;
      try {
        await apiFetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {
        // Best effort — polling still works without push.
      }
    })();
  }, [ready, loggedIn, apiFetch]);

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const newOrders = useMemo(
    () => orders.filter((o) => o.status === "new"),
    [orders],
  );

  // Ring while any order is waiting to be accepted.
  useOrderAlarm(newOrders.length > 0, muted);

  // Un-mute automatically when a fresh batch of new orders arrives.
  const newCount = newOrders.length;
  useEffect(() => {
    if (newCount === 0) setMuted(false);
  }, [newCount]);

  const filtered = useMemo(() => {
    if (filter === "new") return newOrders;
    if (filter === "active")
      return orders.filter((o) => ACTIVE_STATUSES.has(o.status));
    return orders.filter(
      (o) => o.status === "delivered" || o.status === "cancelled",
    );
  }, [orders, newOrders, filter]);

  if (ready && !loggedIn) return <Redirect href="/" />;

  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: "new", label: "New", count: newOrders.length },
    { key: "active", label: "In Progress" },
    { key: "past", label: "Past" },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + webTop + 10,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="flame" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Orders
          </Text>
        </View>
        <View style={styles.headerRight}>
          {newOrders.length > 0 ? (
            <TouchableOpacity
              testID="button-mute"
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => setMuted((m) => !m)}
            >
              <Ionicons
                name={muted ? "volume-mute" : "volume-high"}
                size={20}
                color={muted ? colors.mutedForeground : colors.primary}
              />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            testID="button-logout"
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() =>
              Alert.alert("Log out", `Disconnect from ${baseUrl}?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log out",
                  style: "destructive",
                  onPress: () => {
                    logout();
                    router.replace("/");
                  },
                },
              ])
            }
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>

      {newOrders.length > 0 ? (
        <View style={[styles.alertBar, { backgroundColor: colors.primary }]}>
          <Ionicons
            name="notifications"
            size={16}
            color={colors.primaryForeground}
          />
          <Text
            style={[styles.alertBarText, { color: colors.primaryForeground }]}
          >
            {newOrders.length} new order{newOrders.length === 1 ? "" : "s"} —
            accept to stop ringing
          </Text>
        </View>
      ) : null}

      <View style={styles.tabs}>
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              testID={`tab-${t.key}`}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={() => setFilter(t.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {t.label}
                {t.count ? ` (${t.count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {ordersQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : ordersQuery.isError ? (
        <View style={styles.center}>
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color={colors.mutedForeground}
          />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Could not load orders
          </Text>
          <TouchableOpacity
            testID="button-retry"
            style={[
              styles.retryButton,
              { backgroundColor: colors.card, borderRadius: colors.radius },
            ]}
            onPress={() => ordersQuery.refetch()}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => String(o.id)}
          scrollEnabled={filtered.length > 0}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + webBottom + 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isRefetching}
              onRefresh={() => ordersQuery.refetch()}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name={filter === "new" ? "checkmark-circle-outline" : "receipt-outline"}
                size={40}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                {filter === "new"
                  ? "No new orders — all caught up"
                  : filter === "active"
                    ? "No orders in progress"
                    : "No past orders"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`card-order-${item.id}`}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    item.status === "new" ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push(`/order/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.orderNo, { color: colors.foreground }]}>
                  #{item.pos_number || item.id} · {item.customer_name}
                </Text>
                <Text
                  style={[styles.timeText, { color: colors.mutedForeground }]}
                >
                  {timeAgo(item.created_at)}
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.accent, borderRadius: 999 },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: colors.accentForeground }]}
                  >
                    {item.order_type === "delivery" ? "Delivery" : "Pickup"}
                  </Text>
                </View>
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                  {item.status}
                </Text>
                <Text style={[styles.totalText, { color: colors.foreground }]}>
                  {rs(item.total_amount)}
                </Text>
              </View>
              <Text
                style={[styles.itemsText, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {(item.items ?? [])
                  .map((i) => `${i.qty}× ${i.name}`)
                  .join(", ")}
              </Text>
              {item.status === "new" ? (
                <TouchableOpacity
                  testID={`button-accept-${item.id}`}
                  style={[
                    styles.acceptButton,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: colors.radius,
                      opacity: acceptMutation.isPending ? 0.7 : 1,
                    },
                  ]}
                  disabled={acceptMutation.isPending}
                  onPress={() => acceptMutation.mutate(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.acceptText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    ACCEPT ORDER
                  </Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  alertBarText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabs: { flexDirection: "row", gap: 8, padding: 16, paddingBottom: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 8 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: { borderWidth: 1.5, padding: 14, marginBottom: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNo: { fontSize: 16, fontFamily: "Inter_700Bold", flexShrink: 1 },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
    flex: 1,
  },
  totalText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  itemsText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 8 },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    marginTop: 12,
  },
  acceptText: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
