import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="size-10 rounded-full border-2 border-border border-t-amber animate-spin" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/access-denied" replace />;

  return <Outlet />;
}

export function SuperAdminRoute() {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/access-denied" replace />;

  return <Outlet />;
}
