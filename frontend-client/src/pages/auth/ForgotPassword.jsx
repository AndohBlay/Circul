import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import { authApi } from "../../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword({ phone });
      navigate("/reset-password", { state: { userId: data.user_id, phone } });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't find that phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll text a reset code to the phone number on your account."
    >
      {error && (
        <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0244000000"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
        >
          {loading ? "Sending code…" : "Send reset code"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Remembered it?{" "}
        <Link to="/signin" className="text-amber hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
