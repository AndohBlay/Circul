/**
 * CycleRing — the signature visual element for Circul.
 * Renders an SVG ring whose fill represents progress (e.g. "3 of 6 payments made").
 * Used in the landing hero, installment plan cards, and as a loading spinner variant.
 */
export default function CycleRing({
  segments = 6,
  filled = 3,
  size = 220,
  strokeWidth = 10,
  label,
  sublabel,
  accent = "var(--color-amber)",
}) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gapDeg = 6; // gap between segments in degrees
  const segAngle = 360 / segments - gapDeg;

  const polarToCartesian = (angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  const describeArc = (startAngle, endAngle) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const arcs = Array.from({ length: segments }, (_, i) => {
    const start = i * (360 / segments);
    const end = start + segAngle;
    return { start, end, isFilled: i < filled };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(arc.start, arc.end)}
            fill="none"
            stroke={arc.isFilled ? accent : "var(--color-border)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: "stroke 0.4s ease",
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {label && (
          <span className="font-display text-3xl font-semibold text-text leading-none">{label}</span>
        )}
        {sublabel && <span className="font-body text-xs text-text-muted mt-2 tracking-wide">{sublabel}</span>}
      </div>
    </div>
  );
}
