import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import { authApi } from "../../api/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      // Backend returns { message, user_id } — phone still needs OTP verification.
      navigate("/verify-otp", { state: { userId: data.user_id, phone: form.phone } });
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  return (
    <AuthShell eyebrow="Step 1 of 2" title="Create your account" subtitle="A few details to get you started.">
      {serverError && (
        <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          type="text"
          value={form.name}
          onChange={update("name")}
          error={fieldError("name")}
          placeholder="Ama Owusu"
          required
        />
        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={update("email")}
          error={fieldError("email")}
          placeholder="ama@example.com"
          required
        />
        <FormField
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          error={fieldError("phone")}
          placeholder="0244000000"
          required
        />
        <FormField
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          error={fieldError("password")}
          placeholder="••••••••"
          required
        />
        <FormField
          label="Confirm password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{" "}
        <Link to="/signin" className="text-amber hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
