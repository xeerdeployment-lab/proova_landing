import { ArrowUpRight, CircleDashed, GitBranch, ShieldCheck } from "lucide-react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useId, useMemo, useRef, useSyncExternalStore } from "react";
import { getDemoModel } from "../data/demoData";
import { ease, fadeUp, stagger, viewport } from "../lib/motion";
import Button from "./Button";
import { SampleTag } from "./landing/MockupParts";
import SectionHeading from "./SectionHeading";
import CountUp from "./ui/CountUp";
import TiltCard from "./ui/TiltCard";

const narrowQuery = "(max-width: 639px)";
const subscribeNarrow = (onChange) => {
  const query = window.matchMedia(narrowQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const weekLabel = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Everything on this section is derived from the dashboard preview's labeled sample records. */
function useSampleAnalytics() {
  return useMemo(() => {
    const model = getDemoModel();
    const cumulative = model.growth.map((item, index) => ({
      label: weekLabel(item.week),
      value: model.growth.slice(0, index + 1).reduce((sum, week) => sum + week.count, 0),
    }));
    const people = [...model.upline, ...model.downline];
    const byDepth = [
      { label: "Level 1", value: model.downline.filter((p) => p.depth === 1).length },
      { label: "Level 2", value: model.downline.filter((p) => p.depth === 2).length },
    ];
    return {
      cumulative,
      byDepth,
      verified: people.filter((p) => p.verification === "verified").length,
      pending: people.filter((p) => p.verification === "pending").length,
      total: people.length,
      directs: model.snapshot.directReferrals,
      unconfirmed: model.breakdown.filter((item) => !item.calculated).length,
    };
  }, []);
}

export default function Analytics() {
  const reduce = useReducedMotion();
  const data = useSampleAnalytics();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const near = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 70, reduce ? 0 : -70]);
  const far = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 30, reduce ? 0 : -30]);

  return (
    <section id="analytics" ref={sectionRef} data-act="analytics" className="section overflow-hidden">
      <div className="container-page relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Analytics"
              title={
                <>
                  Signals you can read. <span className="serif-accent text-aurora">Not promises.</span>
                </>
              }
            />
          </div>
          <motion.p
            className="text-base leading-relaxed text-mist lg:col-span-5"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            The dashboard turns a network into a few plain charts: when records joined, how many
            are verified, and where each one sits. Every figure on this section is counted from
            the labeled sample records — none of it describes real members or earnings.
          </motion.p>
        </div>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-12">
          <TiltCard max={2.5} className="glass-deep p-5 sm:p-7 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="hud-label text-mist">Records on file</p>
                <p className="mt-1 text-sm text-snow">Cumulative sample records by week joined</p>
              </div>
              <SampleTag />
            </div>
            <GrowthChart points={data.cumulative} reduce={reduce} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.byDepth.map((row, index) => (
                <DepthBar key={row.label} row={row} max={Math.max(...data.byDepth.map((item) => item.value))} index={index} reduce={reduce} />
              ))}
            </div>
          </TiltCard>

          <motion.div
            className="grid gap-5 lg:col-span-4"
            variants={stagger}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            <TiltCard as="article" variants={fadeUp} className="glass-deep p-6">
              <p className="hud-label text-mist">Verification</p>
              <VerifiedRing verified={data.verified} total={data.total} reduce={reduce} />
              <p className="mt-4 text-xs leading-relaxed text-mist">
                {data.pending} sample records are still pending. A record counts only once it is verified.
              </p>
            </TiltCard>
            <TiltCard as="article" variants={fadeUp} className="glass-deep p-6">
              <p className="hud-label text-mist">Reward lines</p>
              <p className="mt-3 text-sm text-snow">
                <span className="text-3xl font-semibold tracking-[-0.04em]">{data.unconfirmed}</span> lines marked
              </p>
              <span className="mt-2 inline-flex rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.7rem] font-semibold text-mist">Not calculated</span>
              <p className="mt-3 text-xs leading-relaxed text-mist">
                Where a rule is unconfirmed, the dashboard leaves the line blank instead of estimating it.
              </p>
            </TiltCard>
          </motion.div>

          {/* Floating metric panels on their own depth layers, parked on empty corners. */}
          <motion.div style={{ y: far }} className="pointer-events-none absolute -top-12 -right-3 z-10 hidden lg:block">
            <FloatMetric icon={GitBranch} label="Direct referrals" value={data.directs} />
          </motion.div>
          <motion.div style={{ y: near }} className="pointer-events-none absolute -bottom-24 left-[8%] z-10 hidden md:block">
            <FloatMetric icon={ShieldCheck} label="Verified records" value={data.verified} accent="text-success" />
          </motion.div>
          <motion.div style={{ y: far }} className="pointer-events-none absolute -bottom-20 left-[42%] z-10 hidden lg:block">
            <FloatMetric icon={CircleDashed} label="Pending verification" value={data.pending} accent="text-cyan" />
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col items-start md:mt-32 justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-xl text-xs leading-relaxed text-mist/80">
            Illustrative data only, counted from the same sample records used throughout the dashboard preview.
          </p>
          <Button to="/dashboard" variant="glass" className="group">
            Open the dashboard preview
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function GrowthChart({ points, reduce }) {
  // A narrower drawing on phones keeps axis labels legible instead of shrinking them.
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);
  const W = narrow ? 340 : 560;
  const H = narrow ? 200 : 220;
  const PAD = { top: 22, right: 16, bottom: 34, left: narrow ? 26 : 34 };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const id = useId().replace(/:/g, "");
  const max = Math.max(1, ...points.map((point) => point.value));
  const step = (W - PAD.left - PAD.right) / Math.max(1, points.length - 1);
  const xy = points.map((point, index) => [PAD.left + index * step, PAD.top + (1 - point.value / max) * (H - PAD.top - PAD.bottom)]);
  // Monotone-ish cubic through the points.
  const line = xy.reduce((d, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`;
    const [px, py] = xy[index - 1];
    const mid = (px + x) / 2;
    return `${d} C ${mid} ${py}, ${mid} ${y}, ${x} ${y}`;
  }, "");
  const area = `${line} L ${xy.at(-1)[0]} ${H - PAD.bottom} L ${xy[0][0]} ${H - PAD.bottom} Z`;
  const shown = inView || reduce;
  const ticks = [0, Math.round(max / 2), max];

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="mt-6 h-auto w-full overflow-visible"
      role="img"
      aria-label={`Line chart of cumulative sample records by week: ${points.map((p) => `${p.label}, ${p.value}`).join("; ")}.`}
    >
      <defs>
        <linearGradient id={`${id}-line`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#00e5f2" />
          <stop offset="0.6" stopColor="#0094b8" />
          <stop offset="1" stopColor="#00e5f2" />
        </linearGradient>
        <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0094b8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#0094b8" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {ticks.map((tick) => {
        const y = PAD.top + (1 - tick / max) * (H - PAD.top - PAD.bottom);
        return (
          <g key={tick} aria-hidden="true">
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" />
            <text x={PAD.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(152,162,184,0.8)">
              {tick}
            </text>
          </g>
        );
      })}
      {xy.map(([x], index) => (
        <text key={points[index].label} x={x} y={H - 10} textAnchor="middle" fontSize="11" fill="rgba(152,162,184,0.8)" aria-hidden="true">
          {points[index].label}
        </text>
      ))}

      <motion.path
        d={area}
        fill={`url(#${id}-area)`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 1.2, ease, delay: 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth="6"
        opacity="0.55"
        filter={`url(#${id}-glow)`}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: 1.6, ease }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: 1.6, ease }}
      />
      {xy.map(([x, y], index) => (
        <motion.g
          key={points[index].label}
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.5, ease, delay: 0.3 + index * 0.35 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <circle cx={x} cy={y} r="9" fill="rgba(0,229,242,0.14)" />
          <circle cx={x} cy={y} r="3.6" fill="#070d13" stroke="#b8fff2" strokeWidth="1.6" />
          <text x={x} y={y - 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#f8fafc" aria-hidden="true">
            {points[index].value}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

function DepthBar({ row, max, index, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <div ref={ref} className="tile p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-mist">{row.label} records</p>
        <p className="text-lg font-head font-bold tracking-[-0.01em] text-snow uppercase">{inView || reduce ? <CountUp value={row.value} /> : 0}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-to-r from-royal via-[#0094b8] to-cyan shadow-[0_0_14px_rgba(0,229,242,0.6)]"
          style={{ width: `${(row.value / Math.max(1, max)) * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: inView || reduce ? 1 : 0 }}
          transition={{ duration: 1.1, ease, delay: 0.2 + index * 0.15 }}
        />
      </div>
    </div>
  );
}

function VerifiedRing({ verified, total, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const id = useId().replace(/:/g, "");
  const share = total ? verified / total : 0;
  const shown = inView || reduce;

  return (
    <div ref={ref} className="mt-4 flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`${verified} of ${total} sample records verified`}>
        <defs>
          <linearGradient id={`${id}-ring`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#00e5f2" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={`url(#${id}-ring)`}
          strokeWidth="9"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.55))" }}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: shown ? share : 0 }}
          transition={{ duration: 1.4, ease, delay: 0.2 }}
        />
      </svg>
      <div>
        <p className="text-4xl font-semibold tracking-[-0.05em] text-snow">
          {shown ? <CountUp value={verified} /> : 0}
          <span className="text-xl text-mist"> / {total}</span>
        </p>
        <p className="mt-1 text-xs text-mist">sample records verified</p>
      </div>
    </div>
  );
}

function FloatMetric({ icon: Icon, label, value, accent = "text-snow" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="glass float-b px-4 py-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
      <p className="flex items-center gap-2 hud-label text-gold">
        <Icon size={12} strokeWidth={1.8} aria-hidden="true" />
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.04em] ${accent}`}>{inView ? <CountUp value={value} /> : 0}</p>
      <p className="hud-label text-mist">Sample</p>
    </div>
  );
}
