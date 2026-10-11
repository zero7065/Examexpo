// Flat illustration: African students studying together (brand palette).
export default function StudentsIllustration({ width = "100%", maxWidth = 460 }) {
  return (
    <svg viewBox="0 0 460 360" width={width} style={{ maxWidth, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label="African students studying together">
      <defs>
        <linearGradient id="st-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="st-top1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6A9A6A" />
          <stop offset="1" stopColor="#8FCE8F" />
        </linearGradient>
        <linearGradient id="st-top2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6C3CE9" />
          <stop offset="1" stopColor="#9B59B6" />
        </linearGradient>
      </defs>

      <rect x="10" y="10" width="440" height="340" rx="28" fill="url(#st-bg)" />
      {/* glow dots */}
      <circle cx="70" cy="70" r="26" fill="var(--primary)" opacity="0.12" />
      <circle cx="400" cy="90" r="18" fill="var(--accent)" opacity="0.14" />
      <circle cx="380" cy="290" r="30" fill="var(--primary)" opacity="0.1" />

      {/* floating chips */}
      <g fontFamily="Inter, system-ui, sans-serif" fontWeight="800">
        <rect x="36" y="52" width="118" height="40" rx="20" fill="var(--bg-2)" stroke="var(--border)" />
        <text x="95" y="77" textAnchor="middle" fontSize="17" fill="var(--primary)">+10 XP ⚡</text>
        <rect x="320" y="46" width="104" height="40" rx="20" fill="var(--bg-2)" stroke="var(--border)" />
        <text x="372" y="71" textAnchor="middle" fontSize="15" fill="var(--accent)">320 JAMB 🎯</text>
      </g>

      {/* desk */}
      <rect x="60" y="262" width="340" height="16" rx="8" fill="var(--border)" />
      <rect x="90" y="278" width="14" height="52" rx="4" fill="var(--border)" />
      <rect x="356" y="278" width="14" height="52" rx="4" fill="var(--border)" />

      {/* student 1 (left, girl with puff hair + ankara top) */}
      <g>
        <circle cx="150" cy="150" r="34" fill="#2A1A12" />
        <circle cx="126" cy="132" r="16" fill="#2A1A12" />
        <circle cx="174" cy="132" r="16" fill="#2A1A12" />
        <circle cx="150" cy="158" r="26" fill="#6B4226" />
        {/* hair band */}
        <path d="M126 146 Q150 132 174 146" stroke="#D4A853" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* eyes + smile */}
        <circle cx="141" cy="157" r="3" fill="#14100C" />
        <circle cx="159" cy="157" r="3" fill="#14100C" />
        <path d="M141 169 Q150 175 159 169" stroke="#14100C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* body: ankara top */}
        <path d="M112 262 Q114 210 132 196 L168 196 Q186 210 188 262 Z" fill="url(#st-top2)" />
        <circle cx="141" cy="222" r="5" fill="#D4A853" />
        <circle cx="159" cy="222" r="5" fill="#D4A853" />
        <circle cx="150" cy="238" r="5" fill="#FFE9A8" />
        {/* arms to book */}
        <path d="M120 230 Q150 244 182 228" stroke="#6B4226" strokeWidth="13" fill="none" strokeLinecap="round" />
        {/* open book */}
        <path d="M124 236 Q150 226 150 226 Q150 226 176 236 L176 256 Q150 246 150 246 Q150 246 124 256 Z" fill="#F5F1E6" stroke="#D4A853" strokeWidth="2" />
        <line x1="150" y1="226" x2="150" y2="246" stroke="#D4A853" strokeWidth="2" />
      </g>

      {/* student 2 (right, boy with fade + laptop) */}
      <g>
        <circle cx="310" cy="156" r="26" fill="#3B2213" />
        <path d="M284 150 Q284 128 310 128 Q336 128 336 150 L336 142 Q336 122 310 122 Q284 122 284 142 Z" fill="#100C09" />
        <circle cx="301" cy="156" r="3" fill="#0E0B08" />
        <circle cx="319" cy="156" r="3" fill="#0E0B08" />
        <path d="M301 168 Q310 174 319 168" stroke="#0E0B08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M274 262 Q276 212 294 198 L326 198 Q344 212 346 262 Z" fill="url(#st-top1)" />
        {/* laptop */}
        <rect x="252" y="232" width="64" height="40" rx="5" fill="#1B2430" stroke="var(--border)" strokeWidth="2" />
        <rect x="258" y="238" width="52" height="24" rx="3" fill="#6A9A6A" opacity="0.35" />
        <circle cx="270" cy="246" r="3" fill="#8FCE8F" />
        <circle cx="282" cy="246" r="3" fill="#D4A853" />
        <rect x="246" y="272" width="76" height="8" rx="4" fill="#1B2430" stroke="var(--border)" strokeWidth="2" />
        {/* arm */}
        <path d="M338 226 Q318 240 300 244" stroke="#3B2213" strokeWidth="12" fill="none" strokeLinecap="round" />
      </g>

      {/* floating A+ badge */}
      <g fontFamily="Inter, system-ui, sans-serif">
        <circle cx="232" cy="88" r="24" fill="var(--primary)" />
        <text x="232" y="96" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">A</text>
      </g>
    </svg>
  );
}
