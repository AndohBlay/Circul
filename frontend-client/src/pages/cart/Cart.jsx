import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { storageURL } from "../../api/client";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
        <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Your cart</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-8">Cart</h1>

        {items.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <ShoppingBag size={28} className="text-text-faint mx-auto mb-3" />
            <p className="text-text-muted mb-4">Your cart is empty.</p>
            <Link to="/shop" className="text-amber text-sm hover:underline">
              Browse phones →
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border mb-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 p-4">
                  <div className="size-16 rounded-lg bg-surface-raised overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image_path ? (
                      <img
                        src={`${storageURL}/storage/${item.image_path}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag size={20} className="text-text-faint" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-text font-medium truncate">{item.name}</p>
                    <p className="font-mono text-amber text-sm">GHS {item.price.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-text-muted hover:text-text disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-sm text-text w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="text-text-muted hover:text-text disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-text-muted hover:text-coral"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-text-muted font-body">Total</span>
              <span className="font-mono text-xl text-text">GHS {totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors"
            >
              Proceed to checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
