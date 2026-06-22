import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConsoleLayout from "../../components/ConsoleLayout";
import { adminProductsApi } from "../../api/admin";
import { storageURL } from "../../api/client";
import ProductFormModal from "./ProductFormModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    adminProductsApi
      .list()
      .then(({ data }) => setProducts(data.data ?? data))
      .catch(() => setError("Couldn't load products."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form) => {
    await adminProductsApi.create(form);
    load();
  };

  const handleUpdate = async (form) => {
    await adminProductsApi.update(editing.id, form);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    try {
      await adminProductsApi.remove(id);
      load();
    } catch {
      setError("Couldn't delete the product.");
    }
  };

  const primaryImage = (p) => {
    // Support both { images: [...] } and { product_images: [...] } shapes
    const imgs = p.images ?? p.product_images ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    if (!primary) return null;
    const url = primary.image_url ?? primary.url ?? primary.path;
    if (!url) return null;
    return url.startsWith("http") ? url : `${storageURL}/storage/${url}`;
  };

  return (
    <ConsoleLayout
      eyebrow="Catalog"
      title="Products"
      action={
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors shrink-0"
        >
          <Plus size={16} /> New product
        </button>
      }
    >
      {loading && <p className="text-text-muted">Loading…</p>}
      {error && <p className="text-coral mb-4">{error}</p>}

      {!loading && (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted font-body border-b border-border">
                  <th className="px-5 py-3 font-medium w-12" />
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const img = primaryImage(p);
                  return (
                    <tr key={p.id} className="text-text">
                      <td className="px-5 py-3">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-faint text-xs">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">{p.name}</td>
                      <td className="px-5 py-3 font-mono text-amber">GHS {Number(p.price).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={p.stock_quantity <= 5 ? "text-coral" : "text-text"}>{p.stock_quantity}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            p.is_active ? "bg-mint/10 text-mint" : "bg-text-faint/10 text-text-faint"
                          }`}
                        >
                          {p.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="text-text-muted hover:text-amber mr-3"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-text-muted hover:text-coral"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="sm:hidden space-y-3">
            {products.length === 0 && (
              <p className="text-center text-text-muted py-8">No products yet.</p>
            )}
            {products.map((p) => {
              const img = primaryImage(p);
              return (
                <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex gap-3">
                  {img ? (
                    <img src={img} alt={p.name} className="w-14 h-14 rounded-lg object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-surface-raised border border-border shrink-0 flex items-center justify-center text-text-faint text-xs">
                      No img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-text text-sm font-medium truncate">{p.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          p.is_active ? "bg-mint/10 text-mint" : "bg-text-faint/10 text-text-faint"
                        }`}
                      >
                        {p.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="font-mono text-amber text-sm mt-0.5">GHS {Number(p.price).toLocaleString()}</p>
                    <p className={`text-xs mt-0.5 ${p.stock_quantity <= 5 ? "text-coral" : "text-text-muted"}`}>
                      {p.stock_quantity} in stock
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => { setEditing(p); setModalOpen(true); }}
                      className="text-text-muted hover:text-amber"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-text-muted hover:text-coral"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
      />
    </ConsoleLayout>
  );
}
