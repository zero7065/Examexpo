// Animated app logo: E-book mark + AI bot eye with ripple + scan effects.
// Pure SVG + CSS. Set animate={false} for a static mark.
export default function Logo({ size = 36, animate = true, radius = 10 }) {
  const cls = animate ? "ep-logo-anim" : "";
  return (
    <span
      className={`ep-logo ${cls}`}
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #07120C 0%, #10241A 55%, #0A141E 100%)",
        border: "1px solid rgba(106,154,106,0.5)",
        boxShadow: "0 0 18px rgba(106,154,106,0.35), inset 0 0 12px rgba(106,154,106,0.18)",
        position: "relative", overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 512 512" width={size * 0.82} height={size * 0.82}>
        <defs>
          <linearGradient id="ep-logo-neon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4E7A4E" />
            <stop offset="0.55" stopColor="#6A9A6A" />
            <stop offset="1" stopColor="#8FCE8F" />
          </linearGradient>
          <linearGradient id="ep-logo-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE9A8" />
            <stop offset="1" stopColor="#D4A853" />
          </linearGradient>
        </defs>

        {/* E letterform */}
        <rect x="118" y="118" width="44" height="212" rx="22" fill="#4E7A4E" />
        <rect x="118" y="118" width="190" height="44" rx="22" fill="url(#ep-logo-neon)" />
        <rect className="ep-logo-scanbar" x="118" y="214" width="226" height="44" rx="22" fill="url(#ep-logo-gold)" />
        <rect x="118" y="310" width="150" height="20" rx="10" fill="#6A9A6A" />

        {/* scan sheen sweeping the gold bar */}
        {animate && (
          <rect className="ep-logo-sheen" x="118" y="214" width="46" height="44" rx="22" fill="#FFFFFF" opacity="0.55" />
        )}

        {/* bot eye */}
        <circle cx="398" cy="132" r="36" fill="#07120C" stroke="url(#ep-logo-gold)" strokeWidth="12" />
        <circle className="ep-logo-eye" cx="398" cy="132" r="12" fill="url(#ep-logo-gold)" />

        {/* analyzing orbit */}
        {animate && (
          <circle className="ep-logo-orbit" cx="398" cy="132" r="58" fill="none"
            stroke="#8FCE8F" strokeWidth="7" strokeDasharray="40 26" strokeLinecap="round" opacity="0.8" />
        )}

        {/* ripple rings */}
        {animate && (
          <g fill="none" stroke="#8FCE8F">
            <circle className="ep-logo-ripple r1" cx="398" cy="132" r="58" strokeWidth="7" />
            <circle className="ep-logo-ripple r2" cx="398" cy="132" r="58" strokeWidth="7" />
          </g>
        )}
      </svg>
      <style>{`
        .ep-logo-anim .ep-logo-sheen { animation: epSheen 2.6s ease-in-out infinite; }
        @keyframes epSheen {
          0% { transform: translateX(0); opacity: 0; }
          15% { opacity: 0.55; }
          55% { transform: translateX(180px); opacity: 0.55; }
          70%, 100% { transform: translateX(180px); opacity: 0; }
        }
        .ep-logo-anim .ep-logo-eye { animation: epEye 2.6s ease-in-out infinite; transform-origin: 398px 132px; }
        @keyframes epEye {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
        .ep-logo-anim .ep-logo-orbit { animation: epOrbit 5s linear infinite; transform-origin: 398px 132px; }
        @keyframes epOrbit { to { transform: rotate(360deg); } }
        .ep-logo-anim .ep-logo-ripple { transform-origin: 398px 132px; animation: epRipple 2.6s ease-out infinite; }
        .ep-logo-anim .ep-logo-ripple.r2 { animation-delay: 1.3s; }
        @keyframes epRipple {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ep-logo-anim .ep-logo-sheen, .ep-logo-anim .ep-logo-eye,
          .ep-logo-anim .ep-logo-orbit, .ep-logo-anim .ep-logo-ripple { animation: none !important; }
        }
        html.reduce-motion .ep-logo-sheen, html.reduce-motion .ep-logo-eye,
        html.reduce-motion .ep-logo-orbit, html.reduce-motion .ep-logo-ripple { animation: none !important; }
      `}</style>
    </span>
  );
}
