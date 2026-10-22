import { GraduationCap, MonitorSmartphone, ShieldCheck, Users } from "lucide-react";
import { fadeUp } from "../lib/motion";
import SpotlightCard from "./ui/SpotlightCard";

const icons = {
  GraduationCap,
  MonitorSmartphone,
  ShieldCheck,
  Users,
};

export default function FeatureCard({
  title,
  body,
  icon,
  featured = false,
  wide = false,
  className = "",
}) {
  const Icon = icons[icon] ?? Users;

  return (
    <SpotlightCard
      as="article"
      variants={fadeUp}
      className={`panel group flex h-full flex-col p-6 sm:p-8 ${featured ? "min-h-[22rem]" : ""} ${
        wide ? "sm:flex-row sm:items-start sm:gap-8" : ""
      } ${className}`}
    >
      {featured ? <Orbit /> : null}
      <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-royal/25 to-royal/5 text-iris transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:rotate-[-6deg] motion-reduce:transition-none">
        <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className={`relative ${featured ? "mt-auto" : ""}`}>
        <h3
          className={`font-semibold tracking-[-0.03em] text-snow ${featured ? "mt-10 max-w-sm text-3xl leading-tight sm:text-4xl" : "mt-6 text-xl"} ${
            wide ? "sm:mt-0" : ""
          }`}
        >
          {title}
        </h3>
        <p className={`mt-3 leading-relaxed text-mist ${featured ? "max-w-md text-base" : "text-sm"}`}>{body}</p>
      </div>
    </SpotlightCard>
  );
}

/** Quiet orbital drawing for the featured card: people around a shared centre. */
function Orbit() {
  const dots = [
    [210, 50],
    [292, 120],
    [258, 214],
    [150, 220],
    [118, 118],
  ];

  return (
    <svg
      viewBox="0 0 400 280"
      className="pointer-events-none absolute -top-6 -right-16 w-[26rem] opacity-70 transition-opacity duration-500 group-hover:opacity-100 sm:-right-6"
      aria-hidden="true"
    >
      <circle cx="205" cy="140" r="100" fill="none" stroke="rgba(165,160,255,0.16)" />
      <circle cx="205" cy="140" r="62" fill="none" stroke="rgba(165,160,255,0.1)" strokeDasharray="2 6" />
      <circle cx="205" cy="140" r="26" fill="rgba(99,91,255,0.22)" stroke="rgba(216,189,131,0.6)" />
      {dots.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <line x1="205" y1="140" x2={x} y2={y} stroke="rgba(165,160,255,0.18)" />
          <circle cx={x} cy={y} r="6" fill="#0a0f1e" stroke="rgba(165,160,255,0.7)" />
        </g>
      ))}
    </svg>
  );
}
