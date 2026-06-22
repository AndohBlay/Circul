import { useEffect, useState, useRef } from "react";
import { ShieldCheck, Clock, XCircle, Upload } from "lucide-react";
import Navbar from "../../components/Navbar";
import { identityApi } from "../../api/identity";

const ID_TYPES = [
  { value: "ghana_card", label: "Ghana Card" },
  { value: "voter_id", label: "Voter ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "ssnit", label: "SSNIT" },
];

export default function VerifyIdentity() {
  const [status, setStatus] = useState(null); // null while loading
  const [checking, setChecking] = useState(true);

  const refreshStatus = () => {
    setChecking(true);
    identityApi
      .status()
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus({ status: "unverified" }))
      .finally(() => setChecking(false));
  };

  useEffect(refreshStatus, []);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-xl px-5 sm:px-8 py-16">
        <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Compliance</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-2">Verify your identity</h1>
        <p className="text-text-muted font-body mb-8">
          We verify identity with your Ghana Card (or another accepted ID) before approving installment plans.
        </p>

        {checking && <p className="text-text-muted">Checking your status…</p>}

        {!checking && status?.status === "pending" && <StatusBanner kind="pending" />}
        {!checking && status?.status === "approved" && <StatusBanner kind="approved" />}
        {!checking && status?.status === "rejected" && (
          <>
            <StatusBanner kind="rejected" reason={status.rejection_reason} />
            <SubmitForm onSubmitted={refreshStatus} />
          </>
        )}
        {!checking && status?.status === "unverified" && <SubmitForm onSubmitted={refreshStatus} />}
      </div>
    </div>
  );
}

function StatusBanner({ kind, reason }) {
  const config = {
    pending: {
      icon: Clock,
      color: "text-amber",
      bg: "bg-amber/10 border-amber/30",
      title: "Verification pending",
      body: "We've received your documents and they're being reviewed. This usually takes a short while.",
    },
    approved: {
      icon: ShieldCheck,
      color: "text-mint",
      bg: "bg-mint/10 border-mint/30",
      title: "You're verified",
      body: "Your identity has been confirmed. You're all set to apply for installment plans.",
    },
    rejected: {
      icon: XCircle,
      color: "text-coral",
      bg: "bg-coral/10 border-coral/30",
      title: "Verification rejected",
      body: reason || "Your last submission couldn't be verified. Please check your documents and try again.",
    },
  }[kind];

  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-5 flex items-start gap-3 mb-6 ${config.bg}`}>
      <Icon size={20} className={`${config.color} mt-0.5 shrink-0`} />
      <div>
        <p className={`font-medium ${config.color}`}>{config.title}</p>
        <p className="text-text-muted text-sm mt-1">{config.body}</p>
      </div>
    </div>
  );
}

function SubmitForm({ onSubmitted }) {
  const [idType, setIdType] = useState("ghana_card");
  const [idNumber, setIdNumber] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const needsBack = idType !== "passport";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!front || !selfie || (needsBack && !back)) {
      setError("Please attach all required photos.");
      return;
    }

    const formData = new FormData();
    formData.append("id_type", idType);
    formData.append("id_number", idNumber);
    formData.append("id_front_image", front);
    if (back) formData.append("id_back_image", back);
    formData.append("selfie_image", selfie);

    setSaving(true);
    try {
      await identityApi.submit(formData);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your documents. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      {error && (
        <div className="rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">{error}</div>
      )}

      <label className="block">
        <span className="font-body text-sm text-text-muted mb-1.5 block">ID type</span>
        <select
          value={idType}
          onChange={(e) => setIdType(e.target.value)}
          className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-body text-sm outline-none focus:border-amber transition-colors"
        >
          {ID_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-body text-sm text-text-muted mb-1.5 block">ID number</span>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
          placeholder="GHA-000000000-0"
          className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-mono text-sm placeholder:text-text-faint outline-none focus:border-amber transition-colors"
        />
      </label>

      <div className={`grid ${needsBack ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
        <FileSlot label="Front of ID" file={front} onChange={setFront} />
        {needsBack && <FileSlot label="Back of ID" file={back} onChange={setBack} />}
        <FileSlot label="Selfie" file={selfie} onChange={setSelfie} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
      >
        {saving ? "Submitting…" : "Submit for verification"}
      </button>
    </form>
  );
}

function FileSlot({ label, file, onChange }) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="aspect-square rounded-lg border border-dashed border-border hover:border-amber transition-colors flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-ink relative"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {preview ? (
        <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <Upload size={18} className="text-text-faint" />
          <span className="text-text-faint text-xs text-center px-1">{label}</span>
        </>
      )}
    </button>
  );
}
