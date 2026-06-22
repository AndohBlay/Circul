import { useState, useEffect, useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import { storageURL } from "../../api/client";

const empty = {
  name: "",
  installation_type: "",
  description: "",
  price: "",
  stock_quantity: "",
  is_active: true,
};

export default function ProductFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
    setError("");
    setImageFile(null);
    if (initial) {
      const imgs = initial.images ?? initial.product_images ?? [];
      const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
      if (primary) {
        const url = primary.image_url ?? primary.url ?? primary.path;
        setImagePreview(url?.startsWith("http") ? url : url ? `${storageURL}/storage/${url}` : null);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  }, [initial, open]);

  if (!open) return null;

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (imageFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", imageFile);
        await onSubmit(fd);
      } else {
        await onSubmit(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:px-5">
      <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border flex items-center justify-between px-6 py-4 rounded-t-2xl sm:rounded-t-2xl">
          <h2 className="font-display text-lg text-text">{initial ? "Edit product" : "New product"}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image picker */}
            <div>
              <span className="font-body text-sm text-text-muted mb-1.5 block">Product image</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-border hover:border-amber transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden"
                style={{ minHeight: imagePreview ? 0 : "8rem" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover" />
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2 text-text-faint">
                    <ImagePlus size={24} />
                    <span className="text-sm">Tap to add image</span>
                  </div>
                )}
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1.5 text-xs text-text-muted hover:text-amber transition-colors"
                >
                  Change image
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <Field label="Name" value={form.name} onChange={update("name")} required />

            {/* Installation type only — no category dropdown */}
            <label className="block">
              <span className="font-body text-sm text-text-muted mb-1.5 block">Installation</span>
              <select
                value={form.installation_type}
                onChange={update("installation_type")}
                required
                className="w-full rounded-lg bg-ink border border-border px-3 py-2 text-text font-body text-sm outline-none focus:border-amber transition-colors"
              >
                <option value="" disabled>Select…</option>
                <option value="installation">Installation</option>
                <option value="no_installation">No Installation</option>
              </select>
            </label>

            <Field label="Description" value={form.description} onChange={update("description")} textarea />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (GHS)" type="number" step="0.01" value={form.price} onChange={update("price")} required />
              <Field label="Stock qty" type="number" value={form.stock_quantity} onChange={update("stock_quantity")} required />
            </div>

            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" checked={!!form.is_active} onChange={update("is_active")} className="accent-amber" />
              Active / visible in shop
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, textarea, ...props }) {
  const Comp = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="font-body text-sm text-text-muted mb-1.5 block">{label}</span>
      <Comp
        {...props}
        rows={textarea ? 3 : undefined}
        className="w-full rounded-lg bg-ink border border-border px-3 py-2 text-text font-body text-sm outline-none focus:border-amber transition-colors"
      />
    </label>
  );
}