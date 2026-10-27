import { useId } from "react";

export default function Logo({ className = "", markOnly = false, variant = "site", tagline = "" }) {
  const gradientId = `axora-mark-${useId().replace(/:/g, "")}`;

  if (variant === "dashboard") {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0 drop-shadow-[0_0_10px_rgba(57,217,138,0.3)]">
          <path d="M18 1.6 32.2 9.8v16.4L18 34.4 3.8 26.2V9.8L18 1.6Z" fill="#101827" stroke={`url(#${gradientId})`} strokeWidth="1.3" />
          <path d="M13 24.2V12.2h6.15c2.45 0 4.05 1.45 4.05 3.55 0 2.1-1.6 3.55-4.05 3.55H15.7" stroke="#F4F7FB" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M18.4 19.3 23.1 24.2" stroke="#83F7B5" strokeWidth="1.7" strokeLinecap="round" />
          <defs>
            <linearGradient id={gradientId} x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#83F7B5" />
              <stop offset="0.5" stopColor="#39D98A" />
              <stop offset="1" stopColor="#27B5A0" />
            </linearGradient>
          </defs>
        </svg>
        {markOnly ? null : (
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display-num text-[1.05rem] font-semibold tracking-[0.2em] text-snow">AXORA</span>
            <span className="mt-1.5 text-[0.56rem] font-semibold tracking-[0.26em] text-mint/80">STAKING</span>
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" className="shrink-0 drop-shadow-[0_0_10px_rgba(0,229,242,0.35)]">
        <path d="M17 1.5 30.4 9.25v15.5L17 32.5 3.6 24.75V9.25L17 1.5Z" fill="rgba(0,229,242,0.08)" stroke={`url(#${gradientId})`} strokeWidth="1.3" />
        <path d="M17 6.2 26.35 11.6v10.8L17 27.8 7.65 22.4V11.6L17 6.2Z" stroke="rgba(0,229,242,0.25)" strokeWidth="0.8" />
        <path d="M13 23.5V10.5h5.2a4.3 4.3 0 0 1 0 8.6H13" stroke="#F4F7FB" strokeWidth="1.9" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="19.6" y="20.6" width="3" height="3" fill="#A8FF00" />
        <defs>
          <linearGradient id={gradientId} x1="3" y1="2" x2="31" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00E5F2" />
            <stop offset="0.55" stopColor="#00F5D4" />
            <stop offset="1" stopColor="#A8FF00" />
          </linearGradient>
        </defs>
      </svg>
      {markOnly ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-head text-[1.02rem] font-bold tracking-[0.2em] text-snow">Axora</span>
          {tagline ? <span className="hud-label mt-1.5 text-[0.52rem] tracking-[0.3em] text-cyan/80">{tagline}</span> : null}
        </span>
      )}
    </span>
  );
}
