import React from 'react';

interface MonsterGymLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const MonsterGymLogo: React.FC<MonsterGymLogoProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
      title="Monster Gym"
    >
      {/* Outer subtle red neon halo */}
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-sm scale-110 pointer-events-none" />
      )}

      {/* Vector SVG replicating the uploaded Monster Gym illuminated emblem */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm"
      >
        <defs>
          <radialGradient id="gymGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1f1315" />
            <stop offset="85%" stopColor="#0a0a0c" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <linearGradient id="redRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff334b" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Outer Red Ring (Neon sign edge) */}
        <circle cx="100" cy="100" r="94" stroke="url(#redRing)" strokeWidth="6" filter="url(#neonGlow)" />
        
        {/* Inner White Fine Ring */}
        <circle cx="100" cy="100" r="88" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />

        {/* Dark Circle Background */}
        <circle cx="100" cy="100" r="86" fill="url(#gymGlow)" />

        {/* Muscular Bodybuilder Silhouette */}
        <g id="bodybuilder">
          {/* Head & Neck */}
          <path
            d="M93 38 C93 30, 107 30, 107 38 C107 43, 105 47, 100 48 C95 47, 93 43, 93 38 Z"
            fill="#111215"
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          {/* Hair silhouette */}
          <path
            d="M92 36 C92 28, 100 26, 108 28 C108 34, 106 36, 103 37 C99 35, 95 37, 92 36 Z"
            fill="#09090b"
          />

          {/* Massive Traps & Neck */}
          <path
            d="M84 52 C89 45, 93 45, 100 48 C107 45, 111 45, 116 52 C124 55, 128 62, 132 72 L68 72 C72 62, 76 55, 84 52 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Flexed Arm (Bicep peak & Forearm) */}
          <path
            d="M68 72 C58 68, 48 55, 52 42 C56 32, 68 32, 72 40 C75 44, 76 52, 70 56 C74 54, 82 52, 85 64 C86 70, 78 74, 68 72 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Right Fist */}
          <circle cx="58" cy="38" r="6.5" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />

          {/* Left Shoulder & Arm */}
          <path
            d="M132 72 C142 75, 148 85, 146 95 L124 95 C124 88, 126 78, 132 72 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Broad Chest Pectorals & Abs */}
          <path
            d="M72 72 C78 70, 96 74, 100 78 C104 74, 122 70, 128 72 C130 84, 126 98, 124 112 L76 112 C74 98, 70 84, 72 72 Z"
            fill="#1c1917"
            stroke="#ffffff"
            strokeWidth="1.2"
          />

          {/* Muscular chest definition lines */}
          <path d="M100 76 L100 110" stroke="#ff4455" strokeWidth="1.5" strokeOpacity="0.8" />
          <path d="M78 86 C88 90, 96 90, 100 86 C104 90, 112 90, 122 86" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          <path d="M84 98 C92 101, 100 101, 100 98 C100 101, 108 101, 116 98" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.7" />
        </g>

        {/* Central White Illuminated Banner */}
        <g id="banner" filter="url(#neonGlow)">
          <path
            d="M18 116 L182 116 C186 116, 188 120, 186 124 L182 144 C180 148, 176 150, 172 150 L28 150 C24 150, 20 148, 18 144 L14 124 C12 120, 14 116, 18 116 Z"
            fill="#ffffff"
            stroke="#111827"
            strokeWidth="2.5"
          />
          {/* Banner inner border */}
          <path
            d="M22 120 L178 120 L174 146 L26 146 Z"
            fill="none"
            stroke="#e11d48"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
          {/* Bold Text MONSTER GYM */}
          <text
            x="100"
            y="141"
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="23.5"
            letterSpacing="1.5"
            fill="#09090b"
          >
            MONSTER GYM
          </text>
        </g>

        {/* Heavy Barbell Underneath */}
        <g id="barbell" transform="translate(0, 8)">
          {/* Main Bar */}
          <rect x="70" y="152" width="60" height="4" rx="2" fill="#94a3b8" stroke="#000000" strokeWidth="0.8" />
          {/* Center Grips */}
          <rect x="92" y="151" width="16" height="6" rx="1" fill="#cbd5e1" />
          
          {/* Left Weight Plates */}
          <rect x="74" y="145" width="4.5" height="18" rx="1.5" fill="#475569" stroke="#0f172a" strokeWidth="1" />
          <rect x="80" y="147" width="4" height="14" rx="1" fill="#64748b" stroke="#0f172a" strokeWidth="0.8" />
          <circle cx="72" cy="154" r="2.5" fill="#e11d48" />

          {/* Right Weight Plates */}
          <rect x="121" y="145" width="4.5" height="18" rx="1.5" fill="#475569" stroke="#0f172a" strokeWidth="1" />
          <rect x="116" y="147" width="4" height="14" rx="1" fill="#64748b" stroke="#0f172a" strokeWidth="0.8" />
          <circle cx="128" cy="154" r="2.5" fill="#e11d48" />
        </g>

        {/* Bottom Red Glow Accent Arc */}
        <path
          d="M60 178 C84 188, 116 188, 140 178"
          stroke="#ef4444"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />
      </svg>
    </div>
  );
};
