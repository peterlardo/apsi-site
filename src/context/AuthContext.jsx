import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, getAccessToken, onAuthChange, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(() => {
      if (!getAccessToken()) setUser(null);
    });
    (async () => {
      try {
        const data = await apiFetch("/auth/refresh", { auth: false });
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await apiFetch("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
