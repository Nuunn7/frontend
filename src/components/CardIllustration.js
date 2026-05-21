import React from 'react';

const PALETTES = [
  { from: '#1a6b3c', to: '#2ecc71', accent: '#a8edca', sky: '#0d4f2c' }, // Palette 0 (Green)
  { from: '#1a3a6b', to: '#3b82f6', accent: '#a8c8ed', sky: '#0d2550' }, // Palette 1 (Blue)
  { from: '#6b1a3a', to: '#e05c8a', accent: '#edaac8', sky: '#500d2c' }, // Palette 2 (Pink/Red)
  { from: '#6b4a1a', to: '#f59e0b', accent: '#fde68a', sky: '#4a2e08' }, // Palette 3 (Orange/Yellow)
  { from: '#2d1a6b', to: '#8b5cf6', accent: '#c4b5fd', sky: '#1a0d50' }, // Palette 4 (Purple)
];

export const statusStyle = (status) => {
  switch (status) {
    case 'UPCOMING':  return { bg: 'rgba(195,214,234,0.5)', color: '#00203D' };
    case 'ONGOING':   return { bg: 'rgba(0,32,61,0.6)',     color: '#C3D6EA' };
    case 'COMPLETED': return { bg: 'rgba(160,213,133,0.5)', color: '#00203D' };
    case 'CANCELLED': return { bg: 'rgba(235,76,76,0.7)',   color: '#fff'    };
    default:          return { bg: 'rgba(0,32,61,0.3)',     color: '#C3D6EA' };
  }
};

export const statusLabel = {
  UPCOMING: 'Удахгүй',
  ONGOING: 'Явагдаж байна',
  COMPLETED: 'Дууссан',
  CANCELLED: 'Цуцлагдсан',
};

const CardIllustration = ({ index = 0 }) => {
  const p = PALETTES[index % PALETTES.length];
  const gradId = `fixed-friendly-grad-${index}`;

  return (
    <svg
      width="100%" height="100%" viewBox="0 0 320 110"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={p.sky} />
          <stop offset="60%"  stopColor={p.from} />
          <stop offset="100%" stopColor={p.to} />
        </linearGradient>
      </defs>
      
      {/* Background Gradient */}
      <rect width="320" height="110" fill={`url(#${gradId})`} />
      
      {/* Decorative ambient background light orbs */}
      <circle cx="280" cy="20" r="40" fill={p.to}    opacity="0.15" />
      <circle cx="290" cy="5"  r="25" fill={p.accent} opacity="0.1"  />
      <circle cx="40"  cy="90" r="35" fill={p.from}   opacity="0.2"  />
      
      {/* Ground Horizon Shadow */}
      <ellipse cx="160" cy="115" rx="300" ry="18" fill="rgba(0,0,0,0.25)" />

      {/* --- Ambient Background Graphics --- */}
      <g fill={p.accent} opacity="0.35">
        {/* Stylized Sun (top left) */}
        <circle cx="22" cy="22" r="5" stroke={p.accent} strokeWidth="1" fill="none"/>
        <line x1="22" y1="13" x2="22" y2="10" strokeWidth="1" strokeLinecap="round"/>
        <line x1="22" y1="31" x2="22" y2="34" strokeWidth="1" strokeLinecap="round"/>
        <line x1="13" y1="22" x2="10" y2="22" strokeWidth="1" strokeLinecap="round"/>
        <line x1="31" y1="22" x2="34" y2="22" strokeWidth="1" strokeLinecap="round"/>
        
        {/* Small floating leaves */}
        <path d="M90 32 Q94 28, 98 32 Q94 36, 90 32Z" transform="rotate(-15 94 32)" />
        <path d="M120 28 Q124 24, 128 28 Q124 32, 120 28Z" transform="rotate(20 124 28)" />

        {/* Cleaning Tools (Far Left) */}
        <g transform="translate(15, 62)" opacity="0.4">
          <rect x="0" y="4" width="10" height="14" rx="1.5" />
          <line x1="5" y1="4" x2="5" y2="1" stroke={p.accent} strokeWidth="1" />
          <line x1="18" y1="-2" x2="18" y2="18" stroke={p.accent} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 14 L22 14 L20 18 L16 18 Z" />
        </g>
        
        {/* Minimal Mountain / Hills (Far Right) */}
        <path d="M260 95 L280 65 L300 95 Z" opacity="0.4" />
        <path d="M285 95 L300 75 L315 95 Z" opacity="0.2" />
      </g>

      {/* --- Friendly Unified Team Graphic --- */}
      <g fill={p.accent}>
        
        {/* FIGURE 1 (Far Left, slightly faded background layer) */}
        <g opacity="0.75">
          <circle cx="105" cy="74" r="7" />
          <rect x="97" y="83" width="16" height="21" rx="4" />
          {/* Arm resting on neighbor's shoulder */}
          <rect x="110" y="85" width="22" height="5" rx="2" transform="rotate(10 110 85)" />
        </g>

        {/* FIGURE 4 (Far Right, slightly faded background layer) */}
        <g opacity="0.75">
          <circle cx="215" cy="74" r="7" />
          <rect x="207" y="83" width="16" height="21" rx="4" />
          {/* Arm resting on neighbor's shoulder */}
          <rect x="193" y="85" width="22" height="5" rx="2" transform="rotate(-10 215 85)" />
          {/* Friendly wave arm */}
          <rect x="220" y="83" width="5" height="15" rx="2" transform="rotate(30 220 83)" />
          <circle cx="229" cy="73" r="2.5" />
        </g>

        {/* --- CENTRAL SHAKING PAIR (Crisp Foreground Layer) --- */}
        
        {/* FIGURE 2 (Center Left) */}
        <g opacity="0.95">
          <circle cx="138" cy="71" r="8.5" />
          <rect x="128" y="81" width="20" height="24" rx="5" />
          {/* Clean Extended Handshake Arm */}
          <rect x="146" y="87" width="18" height="6" rx="2.5" transform="rotate(5 146 87)" />
        </g>

        {/* FIGURE 3 (Center Right) */}
        <g opacity="0.95">
          <circle cx="182" cy="71" r="8.5" />
          <rect x="172" y="81" width="20" height="24" rx="5" />
          {/* Clean Extended Handshake Arm */}
          <rect x="156" y="87" width="18" height="6" rx="2.5" transform="rotate(-5 174 87)" />
        </g>

        {/* --- NATURAL HANDSHAKE INTERSECTION KNUCKLE --- */}
        <g opacity="0.95">
          {/* The interlocking hand grip clasp */}
          <rect x="158" y="86" width="4" height="8" rx="2" fill={p.accent} />
          <rect x="160" y="84" width="3" height="6" rx="1.5" fill={p.accent} transform="rotate(15 160 84)" />
          {/* Subtle center split line to show it's two hands joining */}
          <line x1="160" y1="86" x2="160" y2="92" stroke={p.from} strokeWidth="0.8" opacity="0.5" />
        </g>
        
      </g>
    </svg>
  );
};

export default CardIllustration;