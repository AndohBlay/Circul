import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Smartphone, Wallet, Lock } from "lucide-react";
import Navbar from "../components/Navbar";
import CycleRing from "../components/CycleRing";
import ProductCard from "../components/ProductCard";
import { productsApi } from "../api/products";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list({ per_page: 4, sort_by: "created_at", sort_order: "desc" })
      .then(({ data }) => setProducts(data.data ?? data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-amber uppercase mb-4">
            Own it in cycles, not all at once
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-text">
            Get the phone now.
            <br />
            Pay it down in cycles.
          </h1>
          <p className="font-body text-text-muted mt-5 max-w-md leading-relaxed">
            Circul splits the cost of your next phone into manageable installments —
            no hidden charges, no waiting around. Pick a plan, get verified, walk away
            with your device.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber text-ink font-medium hover:bg-amber-dim transition-colors"
            >
              Browse phones <ArrowRight size={16} />
            </Link>
            <Link
              to="/track-order"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text hover:border-text-faint transition-colors"
            >
              Track an order
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <CycleRing
            segments={6}
            filled={3}
            size={260}
            label="3 / 6"
            sublabel="installments paid on a typical plan"
          />
        </div>
      </section>

      {/* Featured phones — live from the catalog, no mock data */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">In stock now</p>
              <h2 className="font-display text-2xl font-semibold text-text">A few phones to start with</h2>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-amber text-sm hover:underline">
              See more <ArrowRight size={14} />
            </Link>
          </div>

          {loading && <p className="text-text-muted">Loading phones…</p>}

          {!loading && products.length === 0 && (
            <p className="text-text-muted">New stock is on the way — check back soon.</p>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-border bg-surface p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted shrink-0">
                <Lock size={16} />
              </div>
              <p className="text-text-muted text-sm">
                {user
                  ? "See the full catalog and place orders from the shop."
                  : "Sign in to see the full catalog and place orders."}
              </p>
            </div>
            <Link
              to="/shop"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors"
            >
              See more <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Circul */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 grid sm:grid-cols-3 gap-10">
          <Feature
            icon={<Smartphone size={20} />}
            title="Real devices, fair prices"
            body="Every phone listed is verified stock with transparent, all-in pricing — what you see is what you pay."
          />
          <Feature
            icon={<Wallet size={20} />}
            title="Flexible cycles"
            body="Choose a payment cycle that fits your income. Miss nothing — we remind you before anything is due."
          />
          <Feature
            icon={<ShieldCheck size={20} />}
            title="Verified, secure checkout"
            body="Identity verification and secure payment processing keep every transaction protected end to end."
          />
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-text-muted font-body">
          <span>© {new Date().getFullYear()} Circul. All rights reserved.</span>
          <span className="font-mono text-text-faint">Built in cycles.</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }) {
  return (
    <div>
      <div className="size-10 rounded-full bg-surface border border-border flex items-center justify-center text-amber mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-medium text-text mb-2">{title}</h3>
      <p className="font-body text-sm text-text-muted leading-relaxed">{body}</p>
    </div>
  );
}
