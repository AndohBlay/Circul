import { Link } from "react-router-dom";

export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg mb-10 justify-center">
          <span className="size-7 rounded-full border-2 border-amber border-r-transparent rotate-45" aria-hidden="true" />
          Circul
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {eyebrow && (
            <p className="font-mono text-[11px] tracking-widest text-amber uppercase mb-2">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl font-semibold text-text mb-1.5">{title}</h1>
          {subtitle && <p className="font-body text-sm text-text-muted mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
