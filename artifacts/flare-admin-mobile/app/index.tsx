import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DEFAULT_BASE_URL, useAuth } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ready, loggedIn, login } = useAuth();
  const [url, setUrl] = useState<string>(DEFAULT_BASE_URL);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (loggedIn) {
    return <Redirect href="/orders" />;
  }

  const onSubmit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const err = await login(url, password);
    setBusy(false);
    if (err) setError(err);
  };

  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + webTop + 60, paddingBottom: 60 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
      >
        <View style={styles.logoWrap}>
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <Ionicons name="flame" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Flare Admin
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Order alerts for Flare by TK
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            WEBSITE ADDRESS
          </Text>
          <TextInput
            testID="input-base-url"
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
              },
            ]}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={DEFAULT_BASE_URL}
            placeholderTextColor={colors.mutedForeground}
          />

          <Text
            style={[
              styles.label,
              { color: colors.mutedForeground, marginTop: 18 },
            ]}
          >
            ADMIN PASSWORD
          </Text>
          <View style={styles.passwordRow}>
            <TextInput
              testID="input-password"
              style={[
                styles.input,
                styles.flex,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  borderRadius: colors.radius,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
            <TouchableOpacity
              testID="button-toggle-password"
              style={styles.eyeButton}
              onPress={() => setShowPassword((s) => !s)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            testID="button-login"
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: busy ? 0.7 : 1,
              },
            ]}
            onPress={onSubmit}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[styles.buttonText, { color: colors.primaryForeground }]}
              >
                Connect
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { paddingHorizontal: 24 },
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  form: { width: "100%", maxWidth: 420, alignSelf: "center" },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeButton: { padding: 10, marginLeft: 4 },
  error: { marginTop: 12, fontSize: 14, fontFamily: "Inter_500Medium" },
  button: {
    marginTop: 24,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
