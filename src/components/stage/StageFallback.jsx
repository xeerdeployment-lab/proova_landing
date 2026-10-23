/**
 * Static stand-in for the WebGL stage: shown while the 3D chunk loads and on devices without
 * WebGL 2. Same composition — the proova emblem, orbital rings, and a layered network — in SVG.
 */
const directs = [0, 60, 120, 180, 240, 300];

function polar(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return [Math.cos(rad) * radius, Math.sin(rad) * radius * 0.62];
}

function hexPoints(radius) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 2 + (index * Math.PI) / 3;
    return `${(Math.cos(angle) * radius).toFixed(1)},${(-Math.sin(angle) * radius).toFixed(1)}`;
  }).join(" ");
}

export default function StageFallback({ shown }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_74%_50%,rgba(0,229,242,0.12),transparent_70%)] max-lg:bg-[radial-gradient(80%_45%_at_50%_72%,rgba(0,229,242,0.12),transparent_70%)]" />
      <div className="absolute top-1/2 left-[74%] w-[min(54rem,120vw)] -translate-x-1/2 -translate-y-1/2 max-lg:top-[72%] max-lg:left-1/2">
        <div className="orb absolute inset-[30%] opacity-60" />
        <svg viewBox="-400 -260 800 520" className="relative h-auto w-full">
          <defs>
            <linearGradient id="fallback-emblem" x1="-60" y1="-60" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#00e5f2" />
              <stop offset="0.55" stopColor="#00f5d4" />
              <stop offset="1" stopColor="#a8ff00" />
            </linearGradient>
            <radialGradient id="fallback-core" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="rgba(0,229,242,0.35)" />
              <stop offset="1" stopColor="rgba(0,229,242,0)" />
            </radialGradient>
          </defs>
          <g fill="none" strokeWidth="1">
            <ellipse rx="120" ry="44" stroke="rgba(0,229,242,0.55)" transform="rotate(-18)" />
            <ellipse rx="160" ry="60" stroke="rgba(168,255,0,0.4)" transform="rotate(14)" />
            <ellipse rx="210" ry="80" stroke="rgba(0,245,212,0.25)" transform="rotate(-6)" />
          </g>
          {directs.map((angle) => {
            const [x, y] = polar(angle, 190);
            return (
              <g key={angle}>
                <line x2={x} y2={y} stroke="rgba(0,229,242,0.3)" />
                {[-22, 0, 22].map((offset) => {
                  const [cx, cy] = polar(angle + offset, 300);
                  return (
                    <g key={offset}>
                      <line x1={x} y1={y} x2={cx} y2={cy} stroke="rgba(0,229,242,0.18)" />
                      <circle cx={cx} cy={cy} r="4" fill="#00e5f2" />
                      <circle cx={cx} cy={cy} r="12" fill="rgba(0,229,242,0.12)" />
                    </g>
                  );
                })}
                <circle cx={x} cy={y} r="7" fill="#a8ff00" />
                <circle cx={x} cy={y} r="18" fill="rgba(168,255,0,0.14)" />
              </g>
            );
          })}
          <circle r="96" fill="url(#fallback-core)" />
          <polygon points={hexPoints(62)} fill="rgba(3,7,10,0.85)" stroke="url(#fallback-emblem)" strokeWidth="3" />
          <polygon points={hexPoints(52)} fill="none" stroke="rgba(0,229,242,0.3)" />
          <path d="M-14 28V-28h16a15 15 0 0 1 0 30H-14" fill="none" stroke="#e8fdff" strokeWidth="7" strokeLinecap="square" />
          <rect x="12" y="16" width="9" height="9" fill="#a8ff00" />
        </svg>
      </div>
    </div>
  );
}
