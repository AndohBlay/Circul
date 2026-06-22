import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import ConsoleLayout from "../../components/ConsoleLayout";
import api from "../../api/client";

export default function Profile() {
  const { user, setUser, isSuperAdmin } = useAuth();

  // ── Details form
  const [details, setDetails] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState("");
  const [detailsError, setDetailsError] = useState("");

  // ── Password form
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const updateDetails = (field) => (e) => setDetails((d) => ({ ...d, [field]: e.target.value }));
  const updatePw = (field) => (e) => setPw((p) => ({ ...p, [field]: e.target.value }));

  const handleDetailsSave = async (e) => {
    e.preventDefault();
    setDetailsSaving(true);
    setDetailsError("");
    setDetailsSuccess("");
    try {
      // superadmin uses their own profile endpoint; admins use the shared one
      const endpoint = isSuperAdmin ? "/superadmin/profile" : "/user/profile";
      const { data } = await api.put(endpoint, details);
      const updated = { ...user, ...(data.user ?? data) };
      localStorage.setItem("circul_admin_user", JSON.stringify(updated));
      setUser(updated);
      setDetailsSuccess("Profile updated.");
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Couldn't update profile.");
    } finally {
      setDetailsSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pw.password !== pw.password_confirmation) {
      setPwError("New passwords don't match.");
      return;
    }
    setPwSaving(true);
    setPwError("");
    setPwSuccess("");
    try {
      await authApi.changePassword(pw);
      setPwSuccess("Password changed successfully.");
      setPw({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Couldn't change password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <ConsoleLayout eyebrow="Account" title="My profile">
      <div className="max-w-lg space-y-6">

        {/* ── Personal details ── */}
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-text mb-4">Personal details</h2>

          {detailsError && <Alert type="error" msg={detailsError} />}
          {detailsSuccess && <Alert type="success" msg={detailsSuccess} />}

          <form onSubmit={handleDetailsSave} className="space-y-4">
            <Field label="Name" value={details.name} onChange={updateDetails("name")} required />
            <Field label="Email" type="email" value={details.email} onChange={updateDetails("email")} required />
            <div className="pt-1">
              <button
                type="submit"
                disabled={detailsSaving}
                className="px-5 py-2.5 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
              >
                {detailsSaving ? "Saving…" : "Save details"}
              </button>
            </div>
          </form>
        </section>

        {/* ── Change password ── */}
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-text mb-1">Change password</h2>
          <p className="text-text-muted text-sm mb-4">Enter your current password to set a new one.</p>

          {pwError && <Alert type="error" msg={pwError} />}
          {pwSuccess && <Alert type="success" msg={pwSuccess} />}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Field
              label="Current password"
              type="password"
              value={pw.current_password}
              onChange={updatePw("current_password")}
              autoComplete="current-password"
              required
            />
            <Field
              label="New password"
              type="password"
              value={pw.password}
              onChange={updatePw("password")}
              autoComplete="new-password"
              required
            />
            <Field
              label="Confirm new password"
              type="password"
              value={pw.password_confirmation}
              onChange={updatePw("password_confirmation")}
              autoComplete="new-password"
              required
            />
            <div className="pt-1">
              <button
                type="submit"
                disabled={pwSaving}
                className="px-5 py-2.5 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
              >
                {pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </section>

      </div>
    </ConsoleLayout>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text-muted mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg bg-ink border border-border px-3 py-2 text-text font-body text-sm outline-none focus:border-amber transition-colors"
      />
    </label>
  );
}

function Alert({ type, msg }) {
  const styles =
    type === "error"
      ? "bg-coral/10 border-coral/30 text-coral"
      : "bg-mint/10 border-mint/30 text-mint";
  return (
    <div className={`mb-4 rounded-lg border text-sm px-3 py-2 ${styles}`}>{msg}</div>
  );
}
