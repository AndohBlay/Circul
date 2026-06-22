import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ConsoleLayout from "../../components/ConsoleLayout";
import { superAdminApi } from "../../api/superadmin";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      superAdminApi
        .listClients(search ? { search } : undefined)
        .then(({ data }) => {
          setClients(data.data ?? data);
          setMeta(data.data ? { total: data.total, currentPage: data.current_page, lastPage: data.last_page } : null);
        })
        .catch(() => setError("Couldn't load clients."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <ConsoleLayout
      eyebrow="Customers"
      title="Clients"
      action={
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text outline-none focus:border-amber w-64"
          />
        </div>
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
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.id} className="text-text">
                  <td className="px-5 py-3">{c.name}</td>
                  <td className="px-5 py-3 text-text-muted">{c.email}</td>
                  <td className="px-5 py-3 text-text-muted font-mono">{c.phone}</td>
                  <td className="px-5 py-3 text-text-muted">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-text-muted">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta?.total !== undefined && (
        <p className="text-xs text-text-faint mt-3">
          {meta.total} client{meta.total === 1 ? "" : "s"} total
        </p>
      )}
    </ConsoleLayout>
  );
}
