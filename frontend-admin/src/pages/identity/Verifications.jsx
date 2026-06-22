import { useEffect, useState } from "react";
import { Check, X, User } from "lucide-react";
import ConsoleLayout from "../../components/ConsoleLayout";
import { identityApi } from "../../api/identity";
import { storageURL } from "../../api/client";

const ID_TYPE_LABELS = {
  ghana_card: "Ghana Card",
  voter_id: "Voter ID",
  passport: "Passport",
  drivers_license: "Driver's License",
  ssnit: "SSNIT",
};

const TABS = ["pending", "approved", "rejected"];

export default function Verifications() {
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    identityApi
      .list({ status: tab })
      .then(({ data }) => setItems(data.data ?? data))
      .catch(() => setError("Couldn't load identity verifications."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleReview = async (id, status) => {
    let rejection_reason;
    if (status === "rejected") {
      rejection_reason = prompt("Reason for rejection (shown to the client):");
      if (!rejection_reason) return;
    }
    try {
      await identityApi.review(id, { status, rejection_reason });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update this verification.");
    }
  };

  return (
    <ConsoleLayout eyebrow="Compliance" title="Identity verifications">
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-body capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-amber text-text" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-muted">Loading…</p>}
      {error && <p className="text-coral mb-4">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="text-text-muted">No {tab} verification requests.</p>
      )}

      <div className="space-y-4">
        {items.map((v) => (
          <div key={v.id} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-text font-medium">{v.user?.name ?? `User #${v.user_id}`}</p>
                  <p className="text-text-muted text-xs">{v.user?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
                  {ID_TYPE_LABELS[v.id_type] ?? v.id_type}
                </span>
                <p className="font-mono text-xs text-text-muted mt-1">{v.id_number}</p>
              </div>
            </div>

            {v.status === "rejected" && v.rejection_reason && (
              <p className="text-coral text-xs mt-3">Rejected: {v.rejection_reason}</p>
            )}

            <button
              onClick={() => setExpanded(expanded === v.id ? null : v.id)}
              className="text-amber text-xs mt-3 hover:underline"
            >
              {expanded === v.id ? "Hide documents" : "View documents"}
            </button>

            {expanded === v.id && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                <DocThumb label="Front" path={v.id_front_image} />
                {v.id_back_image && <DocThumb label="Back" path={v.id_back_image} />}
                <DocThumb label="Selfie" path={v.selfie_image} />
              </div>
            )}

            {v.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleReview(v.id, "approved")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint/10 text-mint text-xs font-medium hover:bg-mint/20 transition-colors"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  onClick={() => handleReview(v.id, "rejected")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/10 text-coral text-xs font-medium hover:bg-coral/20 transition-colors"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </ConsoleLayout>
  );
}

function DocThumb({ label, path }) {
  const url = `${storageURL}/storage/${path}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block group">
      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-ink">
        <img src={url} alt={label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
      </div>
      <p className="text-text-muted text-xs mt-1">{label}</p>
    </a>
  );
}
