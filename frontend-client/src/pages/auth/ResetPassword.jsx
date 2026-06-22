import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import { authApi } from "../../api/auth";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const userId = state?.userId;
  const phone = state?.phone;

  const [form, setForm] = useState({ otp: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) navigate("/forgot-password", { replace: true });
  }, [userId, navigate]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ user_id: userId, ...form });
      setSuccess(true);
      setTimeout(() => navigate("/signin", { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't reset your password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle={phone ? `Enter the code sent to ${phone} and your new password.` : "Enter the code and your new password."}
    >
      {error && (
        <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-mint/10 border border-mint/30 text-mint text-sm px-3 py-2">
          Password reset. Redirecting to sign in…
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="6-digit code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={form.otp}
          onChange={update("otp")}
          placeholder="123456"
          required
        />
        <FormField
          label="New password"
          type="password"
          value={form.password}
          onChange={update("password")}
          placeholder="••••••••"
          required
        />
        <FormField
          label="Confirm new password"
          type="password"
          value={form.password_confirmation}
          onChange={update("password_confirmation")}
          placeholder="••••••••"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        <Link to="/signin" className="text-amber hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
