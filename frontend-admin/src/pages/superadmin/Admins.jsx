import { useEffect, useState } from "react";
import { Plus, RotateCcw, UserMinus, X } from "lucide-react";
import ConsoleLayout from "../../components/ConsoleLayout";
import { superAdminApi } from "../../api/superadmin";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    superAdminApi
      .listAdmins()
      .then(({ data }) => setAdmins(data))
      .catch(() => setError("Couldn't load admins."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this admin? They'll be demoted to client access.")) return;
    try {
      await superAdminApi.deactivateAdmin(id);
      load();
    } catch {
      setError("Couldn't deactivate admin.");
    }
  };

  const handleReactivate = async (id) => {
    try {
      await superAdminApi.reactivateAdmin(id);
      load();
    } catch {
      setError("Couldn't reactivate admin.");
    }
  };

  return (
    <ConsoleLayout
      eyebrow="Staff"
      title="Admins"
      action={
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors"
        >
          <Plus size={16} /> New admin
        </button>
      }
    >
      {loading && <p className="text-text-muted">Loading…</p>}
      {error && <p className="text-coral mb-4">{error}</p>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted font-body border-b border-border">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((a) => (
                <tr key={a.id} className="text-text">
                  <td className="px-5 py-3">{a.name}</td>
                  <td className="px-5 py-3 text-text-muted">{a.email}</td>
                  <td className="px-5 py-3 text-text-muted font-mono">{a.phone}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(a.id)}
                      className="text-text-muted hover:text-coral mr-3"
                      title="Deactivate"
                    >
                      <UserMinus size={16} />
                    </button>
                    <button
                      onClick={() => handleReactivate(a.id)}
                      className="text-text-muted hover:text-mint"
                      title="Reactivate"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-text-muted">
                    No admins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <NewAdminModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </ConsoleLayout>
  );
}

function NewAdminModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await superAdminApi.createAdmin(form);
      onCreated();
      onClose();
      setForm({ name: "", email: "", phone: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center px-5">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text">New admin</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "email", "phone", "password"].map((field) => (
            <label key={field} className="block">
              <span className="font-body text-sm text-text-muted mb-1.5 block capitalize">{field}</span>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={update(field)}
                required
                className="w-full rounded-lg bg-ink border border-border px-3 py-2 text-text font-body text-sm outline-none focus:border-amber transition-colors"
              />
            </label>
          ))}
          <p className="text-xs text-text-faint">
            Credentials are sent to the new admin's phone via SMS.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
