import { useEffect, useState } from "react";
import { TrendingUp, Package, Users, AlertTriangle } from "lucide-react";
import ConsoleLayout from "../../components/ConsoleLayout";
import StatRing from "../../components/StatRing";
import { adminDashboardApi } from "../../api/admin";

function StatCard({ icon, label, value, sublabel, ringPercent, ringColor }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-text-muted mb-2">
          {icon}
          <span className="text-xs font-body">{label}</span>
        </div>
        <p className="font-display text-2xl font-semibold text-text">{value}</p>
        {sublabel && <p className="text-xs text-text-muted mt-1">{sublabel}</p>}
      </div>
      {ringPercent !== undefined && <StatRing percent={ringPercent} color={ringColor} />}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError("Couldn't load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConsoleLayout eyebrow="Overview" title="Dashboard">
      {loading && <p className="text-text-muted">Loading…</p>}
      {error && <p className="text-coral">{error}</p>}

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard
              icon={<TrendingUp size={16} />}
              label="Revenue this month"
              value={`GHS ${Number(stats.revenue?.this_month ?? 0).toLocaleString()}`}
              sublabel={`GHS ${Number(stats.revenue?.total ?? 0).toLocaleString()} total`}
            />
            <StatCard
              icon={<Package size={16} />}
              label="Orders"
              value={stats.orders?.total ?? 0}
              sublabel={`${stats.orders?.pending ?? 0} pending`}
            />
            <StatCard
              icon={<Users size={16} />}
              label="Clients"
              value={stats.clients?.total ?? 0}
              sublabel={`+${stats.clients?.new_this_month ?? 0} this month`}
            />
            <StatCard
              icon={<AlertTriangle size={16} />}
              label="Overdue installments"
              value={stats.overdue_installments ?? 0}
              ringPercent={
                stats.orders?.total
                  ? Math.min(100, ((stats.overdue_installments ?? 0) / stats.orders.total) * 100)
                  : 0
              }
              ringColor="var(--color-coral)"
            />
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 mb-10">
            <h2 className="font-display text-lg text-text mb-4">Recent orders</h2>
            <div className="divide-y divide-border">
              {(stats.recent_orders ?? []).length === 0 && (
                <p className="text-text-muted text-sm py-3">No recent orders.</p>
              )}
              {(stats.recent_orders ?? []).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-mono text-text">{order.order_number}</p>
                    <p className="text-text-muted text-xs">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-amber">GHS {Number(order.total_amount).toLocaleString()}</p>
                    <p className="text-text-muted text-xs capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </ConsoleLayout>
  );
}
