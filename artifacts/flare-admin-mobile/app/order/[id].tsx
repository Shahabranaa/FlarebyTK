import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Order, rs, useAuth } from "@/lib/api";
import {
  DEFAULT_TEMPLATES,
  fillTemplate,
  TEMPLATE_KEYS,
  templateVars,
  waLink,
} from "@/lib/whatsapp";

interface Rider {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
}

const NEXT_STATUS: Record<string, { next: string; label: string }> = {
  new: { next: "accepted", label: "Accept Order" },
  accepted: { next: "preparing", label: "Start Preparing" },
  preparing: { next: "ready", label: "Mark Ready" },
  ready: { next: "delivered", label: "Mark Delivered" },
};

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, loggedIn, apiFetch } = useAuth();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await apiFetch("/api/orders");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return (await res.json()) as Order[];
    },
    enabled: ready && loggedIn,
    refetchInterval: 10000,
  });

  const ridersQuery = useQuery<Rider[]>({
    queryKey: ["riders"],
    queryFn: async () => {
      const res = await apiFetch("/api/riders");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return (await res.json()) as Rider[];
    },
    enabled: ready && loggedIn,
  });

  const settingsQuery = useQuery<Record<string, string>>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await apiFetch("/api/settings");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return (await res.json()) as Record<string, string>;
    },
    enabled: ready && loggedIn,
    staleTime: 60000,
  });

  const [posInput, setPosInput] = React.useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => Alert.alert("Error", "Could not update the order."),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => Alert.alert("Error", "Could not update the order."),
  });

  if (ready && !loggedIn) return <Redirect href="/" />;

  const order = (ordersQuery.data ?? []).find((o) => String(o.id) === id);
  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

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
        <TouchableOpacity
          testID="button-back"
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {order ? `Order #${order.pos_number || order.id}` : "Order"}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {!order ? (
        <View style={styles.center}>
          {ordersQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : (
            <Text style={[styles.mutedText, { color: colors.mutedForeground }]}>
              Order not found
            </Text>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + webBottom + 32,
          }}
        >
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.statusBig, { color: colors.primary }]}>
                {order.status.toUpperCase()}
              </Text>
              <Text style={[styles.totalBig, { color: colors.foreground }]}>
                {rs(order.total_amount)}
              </Text>
            </View>
            <Text style={[styles.mutedText, { color: colors.mutedForeground }]}>
              {order.order_type === "delivery" ? "Delivery" : "Pickup"} ·{" "}
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>

          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              CUSTOMER
            </Text>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {order.customer_name}
            </Text>
            <TouchableOpacity
              testID="button-call-customer"
              style={styles.phoneRow}
              onPress={() => Linking.openURL(`tel:${order.customer_phone}`)}
            >
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={[styles.phoneText, { color: colors.primary }]}>
                {order.customer_phone}
              </Text>
            </TouchableOpacity>
            {order.customer_address ? (
              <Text
                style={[styles.mutedText, { color: colors.mutedForeground }]}
              >
                {order.customer_address}
              </Text>
            ) : null}
            {order.special_instructions ? (
              <Text style={[styles.notesText, { color: colors.warning }]}>
                Note: {order.special_instructions}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              ITEMS
            </Text>
            {(order.items ?? []).map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={[styles.itemQty, { color: colors.primary }]}>
                  {item.qty}×
                </Text>
                <Text
                  style={[styles.itemName, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.mutedForeground }]}>
                  {rs(item.price * item.qty)}
                </Text>
              </View>
            ))}
            {order.discount_amount && Number(order.discount_amount) > 0 ? (
              <View style={styles.itemRow}>
                <Text style={[styles.itemName, { color: colors.success }]}>
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.success }]}>
                  −{rs(order.discount_amount)}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              POS ORDER NUMBER
            </Text>
            <View style={styles.posRow}>
              <TextInput
                testID="input-pos-number"
                style={[
                  styles.posInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                placeholder="e.g. 12345"
                placeholderTextColor={colors.mutedForeground}
                value={posInput ?? order.pos_number ?? ""}
                onChangeText={setPosInput}
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity
                testID="button-save-pos"
                style={[
                  styles.posSaveButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: colors.radius,
                    opacity:
                      updateMutation.isPending ||
                      posInput === null ||
                      posInput.trim() === (order.pos_number ?? "")
                        ? 0.5
                        : 1,
                  },
                ]}
                disabled={
                  updateMutation.isPending ||
                  posInput === null ||
                  posInput.trim() === (order.pos_number ?? "")
                }
                onPress={() =>
                  updateMutation.mutate(
                    { pos_number: posInput?.trim() || null },
                    { onSuccess: () => setPosInput(null) },
                  )
                }
              >
                <Text
                  style={[
                    styles.posSaveText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.mutedText, { color: colors.mutedForeground }]}>
              Enter the number from your POS after placing the order there.
            </Text>
          </View>

          {order.order_type === "delivery" ? (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: colors.mutedForeground }]}
              >
                RIDER
              </Text>
              {(ridersQuery.data ?? []).filter(
                (r) => r.is_active || r.id === order.rider_id,
              ).length === 0 ? (
                <Text
                  style={[styles.mutedText, { color: colors.mutedForeground }]}
                >
                  No riders yet — add riders in the website admin.
                </Text>
              ) : (
                <View style={styles.riderChips}>
                  {(ridersQuery.data ?? [])
                    .filter((r) => r.is_active || r.id === order.rider_id)
                    .map((rider) => {
                      const selected = rider.id === order.rider_id;
                      return (
                        <TouchableOpacity
                          key={rider.id}
                          testID={`chip-rider-${rider.id}`}
                          style={[
                            styles.riderChip,
                            {
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: selected
                                ? colors.primary
                                : "transparent",
                              borderRadius: colors.radius,
                            },
                          ]}
                          disabled={updateMutation.isPending}
                          onPress={() =>
                            updateMutation.mutate({
                              rider_id: selected ? null : rider.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.riderChipText,
                              {
                                color: selected
                                  ? colors.primaryForeground
                                  : colors.foreground,
                              },
                            ]}
                          >
                            {rider.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}
              {order.rider_phone ? (
                <TouchableOpacity
                  testID="button-call-rider"
                  style={styles.phoneRow}
                  onPress={() => Linking.openURL(`tel:${order.rider_phone}`)}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={[styles.phoneText, { color: colors.primary }]}>
                    {order.rider_phone}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {order.status !== "cancelled" ? (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: colors.mutedForeground }]}
              >
                WHATSAPP CUSTOMER
              </Text>
              <TouchableOpacity
                testID="button-wa-confirm"
                style={[
                  styles.waButton,
                  { borderColor: colors.border, borderRadius: colors.radius },
                ]}
                onPress={() => {
                  const template =
                    settingsQuery.data?.[TEMPLATE_KEYS.confirm] ??
                    DEFAULT_TEMPLATES[TEMPLATE_KEYS.confirm];
                  Linking.openURL(
                    waLink(
                      order.customer_phone,
                      fillTemplate(template, templateVars(order)),
                    ),
                  );
                }}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
                <Text style={[styles.waText, { color: colors.foreground }]}>
                  Send order confirmation
                </Text>
              </TouchableOpacity>
              {order.order_type === "delivery" ? (
                <TouchableOpacity
                  testID="button-wa-ontheway"
                  style={[
                    styles.waButton,
                    {
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                      opacity: order.rider_id ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => {
                    if (!order.rider_id) {
                      Alert.alert(
                        "Assign a rider first",
                        "Pick a rider above so the message can include their name and number.",
                      );
                      return;
                    }
                    const template =
                      settingsQuery.data?.[TEMPLATE_KEYS.onTheWay] ??
                      DEFAULT_TEMPLATES[TEMPLATE_KEYS.onTheWay];
                    Linking.openURL(
                      waLink(
                        order.customer_phone,
                        fillTemplate(template, templateVars(order)),
                      ),
                    );
                  }}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
                  <Text style={[styles.waText, { color: colors.foreground }]}>
                    Send &quot;on its way&quot; message
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {NEXT_STATUS[order.status] ? (
            <TouchableOpacity
              testID="button-advance-status"
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: statusMutation.isPending ? 0.7 : 1,
                },
              ]}
              disabled={statusMutation.isPending}
              onPress={() =>
                statusMutation.mutate(NEXT_STATUS[order.status].next)
              }
              activeOpacity={0.8}
            >
              {statusMutation.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {NEXT_STATUS[order.status].label}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          {order.status !== "cancelled" && order.status !== "delivered" ? (
            <TouchableOpacity
              testID="button-cancel-order"
              style={styles.cancelButton}
              disabled={statusMutation.isPending}
              onPress={() =>
                Alert.alert("Cancel order", "Mark this order as cancelled?", [
                  { text: "No", style: "cancel" },
                  {
                    text: "Yes, cancel",
                    style: "destructive",
                    onPress: () => statusMutation.mutate("cancelled"),
                  },
                ])
              }
            >
              <Text style={[styles.cancelText, { color: colors.destructive }]}>
                Cancel Order
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusBig: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  totalBig: { fontSize: 18, fontFamily: "Inter_700Bold" },
  bodyText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  mutedText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  notesText: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 8 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  phoneText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  itemQty: { fontSize: 14, fontFamily: "Inter_700Bold", width: 32 },
  itemName: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  itemPrice: { fontSize: 14, fontFamily: "Inter_500Medium" },
  primaryButton: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cancelButton: { alignItems: "center", paddingVertical: 16 },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  posRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  posInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  posSaveButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  posSaveText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  riderChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  riderChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  riderChipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  waButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  waText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
