import { GraduationCap, MonitorSmartphone, ShieldCheck, Users } from "lucide-react";
import { fadeUp } from "../lib/motion";
import TiltCard from "./ui/TiltCard";

const icons = {
  GraduationCap,
  MonitorSmartphone,
  ShieldCheck,
  Users,
};

const badges = {
  community: "Community",
  structure: "Structure",
  digital: "Interface",
  learning: "Education",
};

export default function FeatureCard({
  id,
  index = 0,
  title,
  body,
  icon,
  featured = false,
  wide = false,
  className = "",
}) {
  const Icon = icons[icon] ?? Users;

  return (
    <TiltCard
      as="article"
      variants={fadeUp}
      max={featured ? 3 : 6}
      className={`panel group flex h-full flex-col p-6 sm:p-8 ${featured ? "min-h-[22rem]" : ""} ${
        wide ? "sm:flex-row sm:items-start sm:gap-8" : ""
      } ${className}`}
    >
      {featured ? <Orbit /> : null}
      <div className="tilt-layer relative flex shrink-0 items-center gap-3 self-start [--depth:16px]">
        <span className="icon-box">
          <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="hud-badge">{badges[id] ?? "Standard"}</span>
      </div>
      <div className={`tilt-layer relative [--depth:8px] ${featured ? "mt-auto" : ""}`}>
        <p className={`hud-label text-[0.58rem] text-mist/70 ${featured ? "mt-10" : "mt-7"} ${wide ? "sm:mt-0" : ""}`}>
          Standard // 0{index + 1}
        </p>
        <h3
          className={`mt-2 font-head font-bold tracking-[-0.01em] text-snow uppercase ${featured ? "max-w-sm text-3xl leading-[1.05] sm:text-4xl" : "text-xl leading-tight"}`}
        >
          {title}
        </h3>
        <p className={`mt-3 leading-relaxed text-mist ${featured ? "max-w-md text-base" : "text-sm"}`}>{body}</p>
      </div>
      <span aria-hidden="true" className="accent-line" />
    </TiltCard>
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
      className="tilt-layer pointer-events-none absolute -top-6 -right-16 w-[26rem] opacity-70 [--depth:-16px] transition-[opacity,transform] duration-500 group-hover:opacity-100 sm:-right-6"
      aria-hidden="true"
    >
      <circle cx="205" cy="140" r="100" fill="none" stroke="rgba(0,245,212,0.16)" />
      <circle cx="205" cy="140" r="62" fill="none" stroke="rgba(0,245,212,0.1)" strokeDasharray="2 6" />
      <circle cx="205" cy="140" r="26" fill="rgba(0,229,242,0.22)" stroke="rgba(168,255,0,0.6)" />
      <g className="orbit-spin">
        {dots.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1="205" y1="140" x2={x} y2={y} stroke="rgba(0,229,242,0.22)" />
            <circle cx={x} cy={y} r="6" fill="#070d13" stroke="rgba(0,229,242,0.75)" />
          </g>
        ))}
      </g>
    </svg>
  );
}
