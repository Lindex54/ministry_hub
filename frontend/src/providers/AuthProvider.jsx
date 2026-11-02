"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, ACCESS_TOKEN_KEY } from "@/lib/api";

const REFRESH_TOKEN_KEY = "ministry-hub.refreshToken";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) { setLoading(false); return; }
    api("/auth/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const result = await api.post("/auth/login", { identifier, password });
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    api.post("/auth/logout", {}).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
