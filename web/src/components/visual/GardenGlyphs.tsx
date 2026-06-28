import { motion } from "framer-motion";

/* ============================================================================
   Premium SVG/CSS garden glyphs — the Rive fallback set. Each one is a small
   self-contained scene used across stages and submission cards.
   ========================================================================== */

/** A sealed seed pod: shell closed, faint hash glow on the surface. */
export function SealedSeed({
  size = 120,
  color = "var(--color-sealed)",
  glow = "var(--color-lime)",
}: {
  size?: number;
  color?: string;
  glow?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="cb-breathe">
      <defs>
        <radialGradient id="seedShell" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="color-mix(in srgb, #1c281c 80%, #000)" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="64" rx="34" ry="44" fill="url(#seedShell)" stroke={glow} strokeOpacity="0.3" strokeWidth="1.5" />
      {/* seam */}
      <path d="M60 22 C50 50 50 78 60 106" fill="none" stroke={glow} strokeOpacity="0.35" strokeWidth="1.2" />
      {/* faint hash shimmer */}
      <g className="cb-twinkle" stroke={glow} strokeOpacity="0.5" strokeWidth="1">
        <line x1="46" y1="56" x2="74" y2="56" />
        <line x1="44" y1="66" x2="76" y2="66" />
        <line x1="48" y1="76" x2="72" y2="76" />
      </g>
    </svg>
  );
}

/** An opened bloom: petals unfolded, bright living center. */
export function OpenBloom({
  size = 120,
  petal = "var(--color-aqua)",
  core = "var(--color-lime)",
}: {
  size?: number;
  petal?: string;
  core?: string;
}) {
  const petals = Array.from({ length: 8 });
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <g transform="translate(60 60)">
        {petals.map((_, i) => (
          <motion.ellipse
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.85 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 16 }}
            rx="9"
            ry="34"
            cy="-22"
            fill={petal}
            fillOpacity="0.5"
            stroke={petal}
            strokeOpacity="0.7"
            transform={`rotate(${(360 / 8) * i})`}
            style={{ transformOrigin: "0 0" }}
          />
        ))}
        <circle r="16" fill={core} fillOpacity="0.25" stroke={core} strokeWidth="2" className="cb-pulse-glow" style={{ color: core }} />
        <circle r="6" fill={core} />
      </g>
    </svg>
  );
}

/** A withered sprout — dry, broken, thorn-red. Used for invalid reveals. */
export function WitheredSprout({ size = 120 }: { size?: number }) {
  const thorn = "var(--color-thorn)";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="cb-thorn-shake">
      <path d="M60 100 C58 78 50 64 40 54" fill="none" stroke={thorn} strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 100 C62 80 70 70 82 62" fill="none" stroke={thorn} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 54 l-8 -4 m8 4 l-2 -9" stroke={thorn} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M82 62 l8 -3 m-8 3 l2 -9" stroke={thorn} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="60" cy="104" r="4" fill={thorn} fillOpacity="0.6" />
    </svg>
  );
}

/** The AI oracle flower — closed when unfunded, opens with nectar, pulses with
    Orchid rhythm while processing. */
export function OracleFlower({
  size = 160,
  openness = 0,
  processing = false,
}: {
  size?: number;
  openness?: number; // 0..1
  processing?: boolean;
}) {
  const orchid = "var(--color-orchid)";
  const nectar = "var(--color-nectar)";
  const petals = Array.from({ length: 10 });
  const spread = 12 + openness * 30;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={processing ? "cb-orchid-rhythm" : ""}>
      <g transform="translate(80 80)">
        {petals.map((_, i) => (
          <ellipse
            key={i}
            rx="10"
            ry={spread + 18}
            cy={-(spread + 12)}
            fill={orchid}
            fillOpacity={0.18 + openness * 0.4}
            stroke={orchid}
            strokeOpacity={0.4 + openness * 0.4}
            transform={`rotate(${(360 / 10) * i})`}
            style={{ transformOrigin: "0 0", transition: "all 0.8s cubic-bezier(.2,.8,.2,1)" }}
          />
        ))}
        {/* nectar core fills as it's funded */}
        <circle r="22" fill="#0b0e0a" stroke={orchid} strokeOpacity="0.6" strokeWidth="2" />
        <circle
          r={6 + openness * 14}
          fill={nectar}
          fillOpacity={0.3 + openness * 0.5}
          style={{ transition: "all 0.8s ease" }}
        />
        {processing && (
          <circle r="34" fill="none" stroke={orchid} strokeWidth="2" strokeDasharray="6 10" className="cb-spin-slow" />
        )}
      </g>
    </svg>
  );
}

/** The reward nectar vault — golden core locked in the root. */
export function RewardNectarVault({
  size = 150,
  charged = true,
  released = false,
}: {
  size?: number;
  charged?: boolean;
  released?: boolean;
}) {
  const nectar = "var(--color-nectar)";
  return (
    <svg width={size} height={size} viewBox="0 0 150 150">
      <g transform="translate(75 75)">
        {/* roots */}
        <g stroke={nectar} strokeOpacity="0.4" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M0 30 C-10 50 -28 56 -36 72" />
          <path d="M0 30 C10 50 28 56 36 72" />
          <path d="M0 30 C0 54 0 60 0 78" />
        </g>
        <circle r="34" fill="#0b0e0a" stroke={nectar} strokeOpacity="0.55" strokeWidth="2" />
        <circle
          r="22"
          fill={nectar}
          fillOpacity={charged ? 0.4 : 0.12}
          className={charged && !released ? "cb-pulse-glow" : ""}
          style={{ color: nectar }}
        />
        <circle r="9" fill={nectar} />
        {released && (
          <circle r="40" fill="none" stroke={nectar} strokeWidth="2" className="cb-pulse-glow" style={{ color: nectar }} />
        )}
      </g>
    </svg>
  );
}
