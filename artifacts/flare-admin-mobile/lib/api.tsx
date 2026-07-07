import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const KEY_BASE_URL = "flare-admin:baseUrl";
const KEY_PASSWORD = "flare-admin:password";

export const DEFAULT_BASE_URL = "https://flarebytk.com";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  tracking_token: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  order_type: string;
  status: string;
  total_amount: string;
  coupon_code: string | null;
  discount_amount: string | null;
  special_instructions: string | null;
  pos_number: string | null;
  rider_id: number | null;
  rider_name: string | null;
  rider_phone: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export function normalizeBaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, "");
}

interface AuthContextValue {
  ready: boolean;
  loggedIn: boolean;
  baseUrl: string;
  login: (baseUrl: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const passwordRef = useRef<string>("");
  const baseUrlRef = useRef<string>(DEFAULT_BASE_URL);

  useEffect(() => {
    (async () => {
      try {
        const [storedUrl, storedPassword] = await Promise.all([
          AsyncStorage.getItem(KEY_BASE_URL),
          AsyncStorage.getItem(KEY_PASSWORD),
        ]);
        if (storedUrl) {
          setBaseUrl(storedUrl);
          baseUrlRef.current = storedUrl;
        }
        if (storedPassword) {
          passwordRef.current = storedPassword;
          setLoggedIn(true);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const doLogin = useCallback(
    async (url: string, password: string): Promise<Response> => {
      return fetch(`${url}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
    },
    [],
  );

  const login = useCallback(
    async (rawUrl: string, password: string): Promise<string | null> => {
      const url = normalizeBaseUrl(rawUrl);
      if (!url) return "Please enter the website address.";
      if (!password) return "Please enter the admin password.";
      let res: Response;
      try {
        res = await doLogin(url, password);
      } catch {
        return "Could not reach the server. Check the address and your internet connection.";
      }
      if (res.status === 401) return "Wrong password.";
      if (!res.ok) return `Server error (${res.status}). Try again.`;
      passwordRef.current = password;
      baseUrlRef.current = url;
      setBaseUrl(url);
      setLoggedIn(true);
      await Promise.all([
        AsyncStorage.setItem(KEY_BASE_URL, url),
        AsyncStorage.setItem(KEY_PASSWORD, password),
      ]);
      return null;
    },
    [doLogin],
  );

  const logout = useCallback(async () => {
    passwordRef.current = "";
    setLoggedIn(false);
    await AsyncStorage.removeItem(KEY_PASSWORD);
  }, []);

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit): Promise<Response> => {
      const url = `${baseUrlRef.current}${path}`;
      const opts: RequestInit = { ...init, credentials: "include" };
      let res = await fetch(url, opts);
      if (res.status === 401 && passwordRef.current) {
        // Session cookie expired — re-login once and retry.
        try {
          const loginRes = await doLogin(
            baseUrlRef.current,
            passwordRef.current,
          );
          if (loginRes.ok) {
            res = await fetch(url, opts);
          }
        } catch {
          // fall through with the original 401
        }
      }
      return res;
    },
    [doLogin],
  );

  const value = useMemo(
    () => ({ ready, loggedIn, baseUrl, login, logout, apiFetch }),
    [ready, loggedIn, baseUrl, login, logout, apiFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}
