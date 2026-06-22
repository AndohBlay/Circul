import { useState } from "react";
import { Search, Package, CheckCircle2, Truck, XCircle, Clock } from "lucide-react";
import Navbar from "../../components/Navbar";
import { ordersApi } from "../../api/orders";

const STATUS_META = {
  pending: { icon: Clock, color: "text-amber", label: "Pending" },
  paid: { icon: CheckCircle2, color: "text-mint", label: "Paid" },
  partially_paid: { icon: Clock, color: "text-amber", label: "Partially paid" },
  shipped: { icon: Truck, color: "text-mint", label: "Shipped" },
  cancelled: { icon: XCircle, color: "text-coral", label: "Cancelled" },
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await ordersApi.trackByNumber(orderNumber.trim());
      setResult(data);
    } catch (err) {
      setError(
        err.response?.status === 422
          ? "We couldn't find an order with that number."
          : err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? STATUS_META[result.status] ?? STATUS_META.pending : null;
  const StatusIcon = meta?.icon ?? Package;

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-xl px-5 sm:px-8 py-16">
        <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Order status</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-2">Track your order</h1>
        <p className="text-text-muted font-body mb-8">
          Enter the order number from your confirmation message or email.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. CIR-2026-00123"
            className="flex-1 rounded-lg bg-surface border border-border px-4 py-2.5 text-text font-mono text-sm placeholder:text-text-faint outline-none focus:border-amber transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
          >
            <Search size={16} /> {loading ? "Searching…" : "Track"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3">{error}</div>
        )}

        {result && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`size-10 rounded-full bg-surface-raised border border-border flex items-center justify-center ${meta.color}`}>
                <StatusIcon size={18} />
              </div>
              <div>
                <p className="font-mono text-text">{result.order_number}</p>
                <p className={`text-sm font-medium ${meta.color}`}>{meta.label}</p>
              </div>
            </div>
            <dl className="text-sm space-y-2 text-text-muted">
              <div className="flex justify-between">
                <dt>Placed</dt>
                <dd className="text-text">{new Date(result.placed_at).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-text">{new Date(result.last_updated).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
