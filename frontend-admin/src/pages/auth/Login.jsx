import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { completeAuth } = useAuth();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      const roleNames = (data.user?.roles ?? []).map((r) => (typeof r === "string" ? r : r.name));
      if (!roleNames.includes("admin") && !roleNames.includes("superadmin")) {
        setError("This account doesn't have admin access.");
        setLoading(false);
        return;
      }
      completeAuth(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 font-display font-semibold text-xl mb-10 justify-center">
          <span className="size-7 rounded-full border-2 border-amber border-r-transparent rotate-45" aria-hidden="true" />
          Circul <span className="text-text-muted font-normal text-base">Admin</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold text-text mb-1.5">Sign in</h1>
          <p className="font-body text-sm text-text-muted mb-6">Staff access only.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="font-body text-sm text-text-muted mb-1.5 block">Email or phone</span>
              <input
                type="text"
                value={form.login}
                onChange={update("login")}
                required
                className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-body text-sm outline-none focus:border-amber transition-colors"
              />
            </label>
            <label className="block">
              <span className="font-body text-sm text-text-muted mb-1.5 block">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                required
                className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-body text-sm outline-none focus:border-amber transition-colors"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
