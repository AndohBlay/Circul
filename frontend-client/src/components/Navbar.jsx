import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-ink/90 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="size-7 rounded-full border-2 border-amber border-r-transparent rotate-45" aria-hidden="true" />
          Circul
        </Link>

        <div className="hidden md:flex items-center gap-8 font-body text-sm text-text-muted">
          <Link to="/shop" className="hover:text-text transition-colors">Shop</Link>
          <Link to="/track-order" className="hover:text-text transition-colors">Track order</Link>
          {user && <Link to="/dashboard" className="hover:text-text transition-colors">Dashboard</Link>}
          <CartIcon count={totalItems} />
          {user ? (
            <button onClick={handleLogout} className="hover:text-coral transition-colors">Log out</button>
          ) : (
            <>
              <Link to="/signin" className="hover:text-text transition-colors">Sign in</Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full bg-amber text-ink font-medium hover:bg-amber-dim transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <CartIcon count={totalItems} />
          <button
            className="text-text"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border px-5 py-4 flex flex-col gap-4 font-body text-sm">
          <Link to="/shop" onClick={() => setOpen(false)} className="flex items-center gap-2 text-text">
            <ShoppingBag size={16} /> Shop
          </Link>
          <Link to="/track-order" onClick={() => setOpen(false)} className="text-text">Track order</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-text">Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-coral">Log out</button>
            </>
          ) : (
            <>
              <Link to="/signin" onClick={() => setOpen(false)} className="text-text">Sign in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-amber font-medium">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function CartIcon({ count }) {
  return (
    <Link to="/cart" className="relative text-text-muted hover:text-text transition-colors" aria-label="Cart">
      <ShoppingCart size={20} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber text-ink text-[10px] font-mono font-semibold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
