export default function FormField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text-muted mb-1.5 block">{label}</span>
      <input
        {...props}
        className={`w-full rounded-lg bg-surface border ${
          error ? "border-coral" : "border-border"
        } px-4 py-2.5 text-text font-body text-sm placeholder:text-text-faint outline-none focus:border-amber transition-colors`}
      />
      {error && <span className="text-coral text-xs mt-1 block">{error}</span>}
    </label>
  );
}
