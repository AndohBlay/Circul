import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
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
      completeAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your orders and payment plans.">
      {error && (
        <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email or phone"
          type="text"
          value={form.login}
          onChange={update("login")}
          placeholder="ama@example.com"
          required
        />
        <div>
          <FormField
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="••••••••"
            required
          />
          <Link to="/forgot-password" className="text-xs text-amber hover:underline mt-1.5 block text-right">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        New to Circul?{" "}
        <Link to="/signup" className="text-amber hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
