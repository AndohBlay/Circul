import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Clock, ArrowRight, ShoppingCart } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { identityApi } from "../../api/identity";

export default function Dashboard() {
  const { user } = useAuth();
  const { items, totalItems, totalPrice } = useCart();
  const [identityStatus, setIdentityStatus] = useState(null);

  useEffect(() => {
    identityApi
      .status()
      .then(({ data }) => setIdentityStatus(data.status))
      .catch(() => setIdentityStatus(null));
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Dashboard</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-1">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-muted font-body mb-8">
          Manage your orders and installment plans here.
        </p>

        {identityStatus && identityStatus !== "approved" && (
          <IdentityBanner status={identityStatus} />
        )}

        <Link
          to="/cart"
          className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 mb-8 hover:border-text-faint transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-surface-raised border border-border flex items-center justify-center text-amber shrink-0">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-text font-medium">
                {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart` : "Your cart is empty"}
              </p>
              <p className="text-text-muted text-sm mt-0.5">
                {totalItems > 0 ? `GHS ${totalPrice.toLocaleString()} — ready when you are` : "Browse the shop to add a phone"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber shrink-0">
            {items.length > 0 ? "Go to cart" : "Shop now"} <ArrowRight size={14} />
          </span>
        </Link>

        <p className="text-text-muted font-body mt-4">
          Order history and installment plan management land in the next build pass.
        </p>
      </div>
    </div>
  );
}

function IdentityBanner({ status }) {
  const config = {
    unverified: {
      icon: ShieldAlert,
      color: "text-amber",
      bg: "bg-amber/10 border-amber/30",
      title: "Verify your identity to unlock installment plans",
      body: "Confirm your Ghana Card (or another accepted ID) — it only takes a couple of minutes.",
      cta: "Verify now",
    },
    pending: {
      icon: Clock,
      color: "text-amber",
      bg: "bg-amber/10 border-amber/30",
      title: "Identity verification pending",
      body: "We're reviewing the documents you submitted. We'll let you know once it's confirmed.",
      cta: "View status",
    },
    rejected: {
      icon: ShieldAlert,
      color: "text-coral",
      bg: "bg-coral/10 border-coral/30",
      title: "Identity verification needs another look",
      body: "Your last submission was rejected. Please resubmit your documents.",
      cta: "Resubmit",
    },
  }[status];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <Link
      to="/verify-identity"
      className={`flex items-center justify-between gap-4 rounded-2xl border p-5 mb-8 hover:opacity-90 transition-opacity ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${config.color} mt-0.5 shrink-0`} />
        <div>
          <p className={`font-medium ${config.color}`}>{config.title}</p>
          <p className="text-text-muted text-sm mt-1">{config.body}</p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1 text-sm font-medium shrink-0 ${config.color}`}>
        {config.cta} <ArrowRight size={14} />
      </span>
    </Link>
  );
}
