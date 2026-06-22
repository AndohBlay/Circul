import { Smartphone, ShoppingCart } from "lucide-react";
import { productImageUrl } from "../utils/image";

export default function ProductCard({ product, onAddToCart }) {
  const imageUrl = productImageUrl(product);
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="aspect-square bg-surface-raised flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Smartphone size={36} className="text-text-faint" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-base text-text mb-1 line-clamp-1">{product.name}</h3>
        <p className="font-mono text-amber text-sm mb-3">GHS {Number(product.price).toLocaleString()}</p>
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            disabled={outOfStock}
            className="mt-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} /> {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        )}
      </div>
    </div>
  );
}
