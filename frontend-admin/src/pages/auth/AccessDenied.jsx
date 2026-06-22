import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccessDenied() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5 text-center">
      <div>
        <p className="font-mono text-xs tracking-widest text-coral uppercase mb-3">Access denied</p>
        <h1 className="font-display text-2xl font-semibold text-text mb-2">This account isn't staff</h1>
        <p className="text-text-muted mb-6 max-w-sm mx-auto">
          You're signed in, but this account doesn't hold admin or superadmin access.
        </p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-full bg-amber text-ink font-medium hover:bg-amber-dim transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
