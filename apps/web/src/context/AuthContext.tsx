// apps/web/src/context/AuthContext.tsx
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister, type AuthResponse } from "shared-api";

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "minddeck_auth";

function storeAuth(res: AuthResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ user: res.user, token: res.token }),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // hydrate from localStorage on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAuth = (res: AuthResponse) => {
    setUser(res.user);
    setToken(res.token);
    storeAuth(res);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      applyAuth(res);
    } finally {
      setLoading(false);
    }
    // any error thrown by apiLogin will bubble up to the caller
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    setLoading(true);
    try {
      const res = await apiRegister(username, email, password);
      applyAuth(res);
    } finally {
      setLoading(false);
    }
    // errors from apiRegister also bubble up
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
