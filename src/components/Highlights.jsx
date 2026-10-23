import { Ban, Footprints, LayoutDashboard, ShieldCheck } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { highlights, unpublishedMetrics } from "../data/content";
import { dashboardNav } from "../data/navigation";
import { fadeUp, stagger, viewport } from "../lib/motion";

/**
 * Statistics strip under the hero. Every figure is a fact about this site (counted from the
 * content it renders); business metrics stay blank until they can be verified.
 */
const stats = [
  { ...highlights[0], code: "STD", icon: ShieldCheck, tone: "text-cyan", glow: "rgba(0,229,242,0.55)" },
  { ...highlights[1], code: "SEQ", icon: Footprints, tone: "text-lime", glow: "rgba(168,255,0,0.5)" },
  {
    value: dashboardNav.length,
    label: "Modules in the preview",
    detail: "Every dashboard page is open to explore with sample data.",
    code: "MOD",
    icon: LayoutDashboard,
    tone: "text-[#4fb4ff]",
    glow: "rgba(79,180,255,0.5)",
  },
  { ...highlights[2], code: "RULE", icon: Ban, tone: "text-[#ffb547]", glow: "rgba(255,181,71,0.45)" },
];

export default function Highlights() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="facts-title" data-act="intro" className="relative">
      <div className="container-page py-14 md:py-20">
        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          <h2 id="facts-title" className="hud-label text-cyan">
            System readout <span className="text-mist">// verified facts only</span>
          </h2>
          <p className="hud-label text-[0.6rem] text-mist/80">Counted from this site, not from member activity</p>
        </motion.div>

        <motion.div
          className="panel mt-4 grid grid-cols-2 lg:grid-cols-4"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.label}
                variants={fadeUp}
                className={`stat-cell group p-5 sm:p-7 ${index % 2 ? "border-l border-cyan/10" : ""} ${index > 1 ? "border-t border-cyan/10 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center border border-current/30 ${item.tone}`}>
                    <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="hud-label text-[0.56rem] text-mist/70">
                    {item.code}-0{index + 1}
                  </span>
                </div>
                <p
                  className={`mt-5 font-head text-[clamp(2.4rem,5vw,3.6rem)] leading-none font-bold ${item.tone}`}
                  style={{ textShadow: `0 0 28px ${item.glow}` }}
                >
                  <CountUp value={item.value} />
                </p>
                <h3 className="hud-label mt-4 text-[0.64rem] text-snow">{item.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist max-sm:hidden">{item.detail}</p>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-4 flex flex-col gap-3 border border-dashed border-cyan/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          <p className="hud-label flex items-center gap-2 text-[0.62rem] text-[#ffb547]">
            <span className="h-1.5 w-1.5 bg-[#ffb547]" aria-hidden="true" />
            Awaiting verified records
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {unpublishedMetrics.map((metric) => (
              <li key={metric.label} className="flex items-center gap-2.5 text-sm text-mist">
                <span className="text-snow">{metric.label}</span>
                <span aria-hidden="true">—</span>
                <span className="hud-label text-[0.6rem]">{metric.note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function CountUp({ value }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);
  const animate = !reduce && value !== 0;

  useEffect(() => {
    if (!animate || !inView) return undefined;
    let frame = 0;
    const began = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - began) / 1100);
      setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, inView, value]);

  return (
    <span ref={ref} className="num">
      {String(animate ? display : value).padStart(2, "0")}
    </span>
  );
}
