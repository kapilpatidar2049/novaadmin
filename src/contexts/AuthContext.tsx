import React, { createContext, useContext, useState, ReactNode } from "react";
import { authApi, setAuthTokens, clearAuth, setUser, getUser } from "@/lib/api";

interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const savedUser = getUser();
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedUser);
  const [user, setUserState] = useState<{ name: string; email: string } | null>(
    savedUser ? { name: savedUser.name, email: savedUser.email } : null
  );

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data?.user && res.data?.tokens) {
        const { user: u, tokens } = res.data;
        if (u.role !== "super_admin") {
          return { ok: false, error: "Invalid account type. Admin access only." };
        }
        setAuthTokens(tokens.accessToken, tokens.refreshToken);
        setUser({ id: u.id, name: u.name, email: u.email });
        setUserState({ name: u.name, email: u.email });
        setIsLoggedIn(true);
        return { ok: true };
      }
      return { ok: false, error: (res as { message?: string }).message || "Login failed" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      if (msg === "Failed to fetch" || msg.includes("fetch")) {
        return {
          ok: false,
          error: "Cannot reach server. Make sure the backend is running (npm run dev in backend folder).",
        };
      }
      return { ok: false, error: msg };
    }
  };

  const logout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
