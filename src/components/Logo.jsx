import { useId } from "react";

export default function Logo({ className = "", markOnly = false, variant = "site" }) {
  const gradientId = `proova-mark-${useId().replace(/:/g, "")}`;

  if (variant === "dashboard") {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="18" cy="18" r="17" fill="#11182A" stroke="rgba(220,197,139,0.55)" />
          <circle cx="18" cy="18" r="13.25" stroke="#7667FF" strokeOpacity="0.85" />
          <path d="M13 24.2V12.2h6.15c2.45 0 4.05 1.45 4.05 3.55 0 2.1-1.6 3.55-4.05 3.55H15.7" stroke="#F4F5FA" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18.4 19.3 23.1 24.2" stroke="#DCC58B" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {markOnly ? null : (
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-[0.92rem] font-semibold tracking-[0.28em] text-snow">PROOVA</span>
            <span className="mt-1.5 text-[0.58rem] font-medium tracking-[0.24em] text-gold">MEMBER</span>
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="9" fill="rgba(99,91,255,0.14)" />
        <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8.25" stroke={`url(#${gradientId})`} strokeWidth="1.25" />
        <path
          d="M10.5 23V9.5h6.15a5.35 5.35 0 0 1 0 10.7H10.5"
          stroke="#F8FAFC"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23.4" cy="8.8" r="2.05" fill="#D8BD83" />
        <defs>
          <linearGradient id={gradientId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#635BFF" />
            <stop offset="1" stopColor="#D8BD83" />
          </linearGradient>
        </defs>
      </svg>
      {markOnly ? null : <span className="text-[0.95rem] font-semibold tracking-[0.22em] text-snow">PROOVA</span>}
    </span>
  );
}
