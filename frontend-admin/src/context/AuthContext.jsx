import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

// Normalizes whatever shape the API sends roles in: ['admin'], [{name:'admin'}], etc.
function extractRoleNames(user) {
  if (!user?.roles) return [];
  return user.roles.map((r) => (typeof r === "string" ? r : r.name)).filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("circul_admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("circul_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("circul_admin_user", JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem("circul_admin_token");
        localStorage.removeItem("circul_admin_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const completeAuth = useCallback((token, userData) => {
    localStorage.setItem("circul_admin_token", token);
    localStorage.setItem("circul_admin_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // clear local session regardless
    }
    localStorage.removeItem("circul_admin_token");
    localStorage.removeItem("circul_admin_user");
    setUser(null);
  }, []);

  const roles = useMemo(() => extractRoleNames(user), [user]);
  const isAdmin = roles.includes("admin") || roles.includes("superadmin");
  const isSuperAdmin = roles.includes("superadmin");

  return (
    <AuthContext.Provider value={{ user, setUser, loading, completeAuth, logout, roles, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
