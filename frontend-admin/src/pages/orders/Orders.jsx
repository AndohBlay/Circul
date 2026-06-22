import { useEffect, useState } from "react";
import ConsoleLayout from "../../components/ConsoleLayout";
import { adminOrdersApi } from "../../api/admin";

const STATUSES = ["pending", "paid", "partially_paid", "shipped", "cancelled"];

const statusColor = {
  pending: "text-amber",
  paid: "text-mint",
  partially_paid: "text-amber",
  shipped: "text-mint",
  cancelled: "text-coral",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    adminOrdersApi
      .list(filter ? { status: filter } : undefined)
      .then(({ data }) => setOrders(data.data ?? data))
      .catch(() => setError("Couldn't load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (order, status) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await adminOrdersApi.updateStatus(order.id, status);
    } catch {
      setOrders(prev);
      setError("Couldn't update order status.");
    }
  };

  return (
    <ConsoleLayout
      eyebrow="Fulfillment"
      title="Orders"
      action={
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-amber"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      }
    >
      {loading && <p className="text-text-muted">Loading…</p>}
      {error && <p className="text-coral mb-4">{error}</p>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted font-body border-b border-border">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="text-text">
                  <td className="px-5 py-3 font-mono">{o.order_number}</td>
                  <td className="px-5 py-3">{o.user?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-amber">GHS {Number(o.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o, e.target.value)}
                      className={`bg-ink border border-border rounded-md px-2 py-1 text-xs capitalize outline-none focus:border-amber ${statusColor[o.status] ?? "text-text"}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </ConsoleLayout>
  );
}
