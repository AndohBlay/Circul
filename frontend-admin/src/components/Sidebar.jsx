import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  ShieldCheck,
  BadgeCheck,
  LogOut,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItem = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors";
const activeClass = "bg-surface-raised text-text";
const inactiveClass = "text-text-muted hover:text-text hover:bg-surface";

export default function Sidebar({ open, onClose }) {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNav = () => {
    // Close sidebar on mobile after navigating
    if (onClose) onClose();
  };

  return (
    <>
      {/* Desktop: always visible. Mobile: slide in/out */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-60 shrink-0 h-screen
          border-r border-border flex flex-col bg-ink
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between gap-2 px-5 font-display font-semibold text-lg border-b border-border">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-full border-2 border-amber border-r-transparent rotate-45" aria-hidden="true" />
            Circul <span className="text-text-muted font-normal text-sm">Admin</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-text-muted hover:text-text p-1 -mr-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink to="/" end onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/products" onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
            <Package size={18} /> Products
          </NavLink>
          <NavLink to="/orders" onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
            <ClipboardList size={18} /> Orders
          </NavLink>
          <NavLink to="/verifications" onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
            <BadgeCheck size={18} /> Verifications
          </NavLink>

          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-1 px-3 font-mono text-[10px] uppercase tracking-widest text-text-faint">
                Superadmin
              </div>
              <NavLink to="/admins" onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
                <ShieldCheck size={18} /> Admins
              </NavLink>
              <NavLink to="/clients" onClick={handleNav} className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}>
                <Users size={18} /> Clients
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer — profile + logout */}
        <div className="px-3 py-4 border-t border-border">
          <NavLink
            to="/profile"
            onClick={handleNav}
            className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass} w-full mb-1`}
          >
            <UserCircle size={18} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-text-muted truncate leading-tight">{user?.email}</p>
            </div>
          </NavLink>
          <button onClick={handleLogout} className={`${navItem} ${inactiveClass} w-full hover:text-coral`}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
