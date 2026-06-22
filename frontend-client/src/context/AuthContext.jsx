import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("circul_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, confirm it's still valid and refresh user data.
  useEffect(() => {
    const token = localStorage.getItem("circul_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("circul_user", JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem("circul_token");
        localStorage.removeItem("circul_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const completeAuth = useCallback((token, userData) => {
    localStorage.setItem("circul_token", token);
    localStorage.setItem("circul_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear local session
    }
    localStorage.removeItem("circul_token");
    localStorage.removeItem("circul_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, completeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
