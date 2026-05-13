const AuthBackground = () => (
  <svg
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; r: 5; }
          50%       { opacity: 1;   r: 9; }
        }
        @keyframes pulseRing {
          0%   { r: 8;  opacity: 0.5; }
          100% { r: 22; opacity: 0;   }
        }
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);   opacity: 0.45; }
          50%       { transform: translateY(-14px); opacity: 0.9;  }
        }
        @keyframes fadein {
          0%   { opacity: 0;    transform: scale(0.95); }
          30%  { opacity: 0.7;  transform: scale(1);    }
          70%  { opacity: 0.7;  transform: scale(1);    }
          100% { opacity: 0;    transform: scale(0.95); }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(200%);  opacity: 0; }
        }
        .node     { animation: pulse 3s ease-in-out infinite; }
        .n2       { animation-delay: 0.5s; }
        .n3       { animation-delay: 1s;   }
        .n4       { animation-delay: 1.5s; }
        .n5       { animation-delay: 2s;   }
        .n6       { animation-delay: 2.5s; }
        .n7       { animation-delay: 0.8s; }
        .n8       { animation-delay: 1.3s; }
        .n9       { animation-delay: 1.8s; }
        .ring     { animation: pulseRing 3s ease-out infinite; opacity: 0; }
        .r2       { animation-delay: 0.5s; }
        .r3       { animation-delay: 1s;   }
        .r4       { animation-delay: 1.5s; }
        .r5       { animation-delay: 2s;   }
        .link {
          stroke: #C3D6EA;
          stroke-width: 0.8;
          stroke-dasharray: 5 5;
          animation: dash 2.5s linear infinite;
          opacity: 0.2;
          fill: none;
        }
        .link-solid {
          stroke: #C3D6EA;
          stroke-width: 0.8;
          opacity: 0.12;
          fill: none;
        }
        .badge     { animation: float 4s ease-in-out infinite; }
        .b2        { animation-delay: 1.2s; }
        .b3        { animation-delay: 2.4s; }
        .b4        { animation-delay: 0.6s; }
        .b5        { animation-delay: 1.8s; }
        .block     { animation: fadein 6s ease-in-out infinite; opacity: 0; }
        .bl2       { animation-delay: 2s;  }
        .bl3       { animation-delay: 4s;  }
        .bl4       { animation-delay: 1s;  }
        .hexspin   {
          transform-box: fill-box;
          transform-origin: center;
          animation: spin 18s linear infinite;
          opacity: 0.06;
        }
        .hexspin2  {
          transform-box: fill-box;
          transform-origin: center;
          animation: spin 24s linear infinite reverse;
          opacity: 0.05;
        }
        .scan {
          animation: scanline 8s linear infinite;
          opacity: 0;
        }
        .scan2 { animation-delay: 4s; }
        .bflabel {
          font-family: monospace;
          font-size: 8px;
          fill: #C3D6EA;
        }
      `}</style>
    </defs>

    <rect width="100%" height="100%" fill="#00203D" />

    <polygon className="hexspin" points="50,0 100,25 100,75 50,100 0,75 0,25"
      fill="none" stroke="#C3D6EA" strokeWidth="1"
      transform="translate(80, 80) scale(3.5)" />
    <polygon className="hexspin2" points="50,0 100,25 100,75 50,100 0,75 0,25"
      fill="none" stroke="#C3D6EA" strokeWidth="1"
      transform="translate(75, 75) scale(5)" />
    <polygon className="hexspin" points="50,0 100,25 100,75 50,100 0,75 0,25"
      fill="none" stroke="#C3D6EA" strokeWidth="0.8"
      transform="translate(1150, 500) scale(4)" style={{ animationDelay: '3s' }} />
    <polygon className="hexspin2" points="50,0 100,25 100,75 50,100 0,75 0,25"
      fill="none" stroke="#C3D6EA" strokeWidth="0.8"
      transform="translate(1140, 490) scale(6)" style={{ animationDelay: '1s' }} />

    <rect x="0" y="0" width="100%" height="2"
      fill="rgba(195,214,234,0.3)" className="scan" />
    <rect x="0" y="0" width="100%" height="2"
      fill="rgba(195,214,234,0.3)" className="scan scan2" />

    <line className="link" x1="8%"  y1="15%" x2="30%" y2="28%" />
    <line className="link" x1="30%" y1="28%" x2="55%" y2="15%" />
    <line className="link" x1="55%" y1="15%" x2="80%" y2="25%" />
    <line className="link" x1="80%" y1="25%" x2="92%" y2="12%" />
    <line className="link" x1="30%" y1="28%" x2="45%" y2="52%" />
    <line className="link" x1="55%" y1="15%" x2="45%" y2="52%" />
    <line className="link" x1="80%" y1="25%" x2="45%" y2="52%" />
    <line className="link" x1="45%" y1="52%" x2="18%" y2="68%" />
    <line className="link" x1="45%" y1="52%" x2="70%" y2="70%" />
    <line className="link" x1="18%" y1="68%" x2="70%" y2="70%" />
    <line className="link" x1="8%"  y1="15%" x2="18%" y2="68%" />
    <line className="link" x1="80%" y1="25%" x2="92%" y2="55%" />
    <line className="link" x1="92%" y1="55%" x2="70%" y2="70%" />
    <line className="link" x1="92%" y1="12%" x2="92%" y2="55%" />
    <line className="link" x1="18%" y1="68%" x2="10%" y2="88%" />
    <line className="link" x1="70%" y1="70%" x2="55%" y2="88%" />
    <line className="link" x1="70%" y1="70%" x2="85%" y2="90%" />

    <circle className="ring"    cx="8%"  cy="15%" r="8" fill="none" stroke="#C3D6EA" strokeWidth="1" />
    <circle className="ring r2" cx="55%" cy="15%" r="8" fill="none" stroke="#C3D6EA" strokeWidth="1" />
    <circle className="ring r3" cx="45%" cy="52%" r="8" fill="none" stroke="#C3D6EA" strokeWidth="1" />
    <circle className="ring r4" cx="70%" cy="70%" r="8" fill="none" stroke="#C3D6EA" strokeWidth="1" />
    <circle className="ring r5" cx="92%" cy="55%" r="8" fill="none" stroke="#C3D6EA" strokeWidth="1" />

    <circle className="node"    cx="8%"  cy="15%" r="5" fill="#C3D6EA" />
    <circle className="node n2" cx="30%" cy="28%" r="5" fill="#C3D6EA" />
    <circle className="node n3" cx="55%" cy="15%" r="5" fill="#C3D6EA" />
    <circle className="node n4" cx="80%" cy="25%" r="5" fill="#C3D6EA" />
    <circle className="node n5" cx="92%" cy="12%" r="5" fill="#C3D6EA" />
    <circle className="node n6" cx="45%" cy="52%" r="5" fill="#C3D6EA" />
    <circle className="node n7" cx="18%" cy="68%" r="5" fill="#C3D6EA" />
    <circle className="node n8" cx="70%" cy="70%" r="5" fill="#C3D6EA" />
    <circle className="node n9" cx="92%" cy="55%" r="5" fill="#C3D6EA" />

    <g className="badge"    style={{ transformOrigin: '7% 42%' }}>
      <circle cx="7%"  cy="42%" r="16" fill="none" stroke="#C3D6EA" strokeWidth="0.8" opacity="0.3" />
      <circle cx="7%"  cy="42%" r="10" fill="rgba(195,214,234,0.08)" />
      <text x="7%"  y="42%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#C3D6EA" opacity="0.7">✓</text>
    </g>
    <g className="badge b2" style={{ transformOrigin: '91% 40%' }}>
      <circle cx="91%" cy="40%" r="16" fill="none" stroke="#C3D6EA" strokeWidth="0.8" opacity="0.3" />
      <circle cx="91%" cy="40%" r="10" fill="rgba(195,214,234,0.08)" />
      <text x="91%" y="40%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#C3D6EA" opacity="0.7">✓</text>
    </g>
    <g className="badge b3" style={{ transformOrigin: '40% 88%' }}>
      <circle cx="40%" cy="88%" r="16" fill="none" stroke="#C3D6EA" strokeWidth="0.8" opacity="0.3" />
      <circle cx="40%" cy="88%" r="10" fill="rgba(195,214,234,0.08)" />
      <text x="40%" y="88%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#C3D6EA" opacity="0.7">✓</text>
    </g>
    <g className="badge b4" style={{ transformOrigin: '75% 88%' }}>
      <circle cx="75%" cy="88%" r="16" fill="none" stroke="#C3D6EA" strokeWidth="0.8" opacity="0.3" />
      <circle cx="75%" cy="88%" r="10" fill="rgba(195,214,234,0.08)" />
      <text x="75%" y="88%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#C3D6EA" opacity="0.7">✓</text>
    </g>
    <g className="badge b5" style={{ transformOrigin: '22% 35%' }}>
      <circle cx="22%" cy="35%" r="12" fill="none" stroke="#C3D6EA" strokeWidth="0.8" opacity="0.25" />
      <circle cx="22%" cy="35%" r="7"  fill="rgba(195,214,234,0.06)" />
      <text x="22%" y="35%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#C3D6EA" opacity="0.6">✓</text>
    </g>

    <g className="block">
      <rect x="2%" y="55%" width="100" height="52" rx="5"
        fill="rgba(195,214,234,0.04)" stroke="#C3D6EA" strokeWidth="0.6" />
      <line x1="2%" y1="calc(55% + 16px)" x2="calc(2% + 100px)" y2="calc(55% + 16px)"
        stroke="#C3D6EA" strokeWidth="0.4" opacity="0.3" />
      <text x="calc(2% + 8px)" y="calc(55% + 11px)" className="bflabel" opacity="0.5">#A3F2·9c1d</text>
      <text x="calc(2% + 8px)" y="calc(55% + 28px)" className="bflabel" opacity="0.35">volunteer</text>
      <text x="calc(2% + 8px)" y="calc(55% + 40px)" className="bflabel" opacity="0.35">verified ✓</text>
    </g>
    <g className="block bl2">
      <rect x="74%" y="5%" width="100" height="52" rx="5"
        fill="rgba(195,214,234,0.04)" stroke="#C3D6EA" strokeWidth="0.6" />
      <line x1="74%" y1="calc(5% + 16px)" x2="calc(74% + 100px)" y2="calc(5% + 16px)"
        stroke="#C3D6EA" strokeWidth="0.4" opacity="0.3" />
      <text x="calc(74% + 8px)" y="calc(5% + 11px)" className="bflabel" opacity="0.5">#B91C·4e2a</text>
      <text x="calc(74% + 8px)" y="calc(5% + 28px)" className="bflabel" opacity="0.35">certificate</text>
      <text x="calc(74% + 8px)" y="calc(5% + 40px)" className="bflabel" opacity="0.35">issued ✓</text>
    </g>
    <g className="block bl3">
      <rect x="2%" y="3%" width="100" height="52" rx="5"
        fill="rgba(195,214,234,0.04)" stroke="#C3D6EA" strokeWidth="0.6" />
      <line x1="2%" y1="calc(3% + 16px)" x2="calc(2% + 100px)" y2="calc(3% + 16px)"
        stroke="#C3D6EA" strokeWidth="0.4" opacity="0.3" />
      <text x="calc(2% + 8px)" y="calc(3% + 11px)" className="bflabel" opacity="0.5">#C47D·8f3b</text>
      <text x="calc(2% + 8px)" y="calc(3% + 28px)" className="bflabel" opacity="0.35">activity</text>
      <text x="calc(2% + 8px)" y="calc(3% + 40px)" className="bflabel" opacity="0.35">recorded ✓</text>
    </g>
    <g className="block bl4">
      <rect x="74%" y="60%" width="100" height="52" rx="5"
        fill="rgba(195,214,234,0.04)" stroke="#C3D6EA" strokeWidth="0.6" />
      <line x1="74%" y1="calc(60% + 16px)" x2="calc(74% + 100px)" y2="calc(60% + 16px)"
        stroke="#C3D6EA" strokeWidth="0.4" opacity="0.3" />
      <text x="calc(74% + 8px)" y="calc(60% + 11px)" className="bflabel" opacity="0.5">#D82E·1a9f</text>
      <text x="calc(74% + 8px)" y="calc(60% + 28px)" className="bflabel" opacity="0.35">polygon</text>
      <text x="calc(74% + 8px)" y="calc(60% + 40px)" className="bflabel" opacity="0.35">amoy ✓</text>
    </g>
  </svg>
);

export default AuthBackground;