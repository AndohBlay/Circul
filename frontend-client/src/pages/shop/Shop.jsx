import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    productsApi
      .list()
      .then(({ data }) => setProducts(data.data ?? data))
      .catch(() => setError("Couldn't load products. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    setJustAdded(product.id);
    setTimeout(() => setJustAdded((id) => (id === product.id ? null : id)), 1800);
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Shop</p>
            <h1 className="font-display text-3xl font-semibold text-text">Phones</h1>
          </div>
          {justAdded && (
            <span className="inline-flex items-center gap-1.5 text-mint text-sm">
              <Check size={14} /> Added to cart
            </span>
          )}
        </div>

        {loading && <p className="text-text-muted">Loading products…</p>}
        {error && <p className="text-coral">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-text-muted">No products yet — check back soon.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {products.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/cart" className="text-amber text-sm hover:underline">
              View cart →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
