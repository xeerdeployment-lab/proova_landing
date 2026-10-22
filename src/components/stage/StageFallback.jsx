/**
 * Static stand-in for the WebGL stage: shown while the 3D chunk loads and on devices without
 * WebGL 2. Same composition — luminous core, rings, and a layered network — in CSS and SVG.
 */
const directs = [0, 60, 120, 180, 240, 300];

function polar(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return [Math.cos(rad) * radius, Math.sin(rad) * radius * 0.62];
}

export default function StageFallback({ shown }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_45%,rgba(79,140,255,0.16),transparent_70%)] max-lg:bg-[radial-gradient(80%_45%_at_50%_72%,rgba(79,140,255,0.16),transparent_70%)]" />
      <div className="absolute top-1/2 left-[68%] w-[min(54rem,120vw)] -translate-x-1/2 -translate-y-1/2 max-lg:top-[72%] max-lg:left-1/2">
        <div className="orb absolute inset-[30%] opacity-70" />
        <svg viewBox="-400 -260 800 520" className="relative h-auto w-full">
          <defs>
            <radialGradient id="fallback-core" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#9be8ff" />
              <stop offset="0.45" stopColor="#4f8cff" />
              <stop offset="1" stopColor="#0c1430" />
            </radialGradient>
          </defs>
          <g fill="none" strokeWidth="1">
            <ellipse rx="120" ry="44" stroke="rgba(90,215,242,0.5)" transform="rotate(-18)" />
            <ellipse rx="160" ry="60" stroke="rgba(165,160,255,0.35)" transform="rotate(14)" />
            <ellipse rx="210" ry="80" stroke="rgba(165,160,255,0.2)" transform="rotate(-6)" />
          </g>
          {directs.map((angle) => {
            const [x, y] = polar(angle, 190);
            return (
              <g key={angle}>
                <line x2={x} y2={y} stroke="rgba(139,132,255,0.35)" />
                {[-22, 0, 22].map((offset) => {
                  const [cx, cy] = polar(angle + offset, 300);
                  return (
                    <g key={offset}>
                      <line x1={x} y1={y} x2={cx} y2={cy} stroke="rgba(90,215,242,0.22)" />
                      <circle cx={cx} cy={cy} r="4" fill="#4f8cff" />
                      <circle cx={cx} cy={cy} r="12" fill="rgba(79,140,255,0.14)" />
                    </g>
                  );
                })}
                <circle cx={x} cy={y} r="7" fill="#8b84ff" />
                <circle cx={x} cy={y} r="18" fill="rgba(139,132,255,0.16)" />
              </g>
            );
          })}
          <circle r="64" fill="rgba(90,215,242,0.12)" />
          <circle r="44" fill="url(#fallback-core)" />
        </svg>
      </div>
    </div>
  );
}
