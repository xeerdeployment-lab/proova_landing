import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { highlights, unpublishedMetrics } from "../data/content";
import { fadeUp, stagger, viewport } from "../lib/motion";

/** Trust strip: only facts about this site, plus business metrics that stay blank until verified. */
export default function Highlights() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="facts-title" className="relative border-y border-white/[0.06] bg-navy">
      <div className="container-page py-14 md:py-16">
        <motion.div
          className="grid gap-10 lg:grid-cols-12 lg:items-center"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <p className="eyebrow">Verified facts only</p>
            <h2 id="facts-title" className="mt-4 text-2xl leading-tight font-semibold tracking-[-0.03em] text-snow">
              Facts we can <span className="serif-accent text-iris">stand behind.</span>
            </h2>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3 lg:col-span-9">
            {highlights.map((item) => (
              <motion.article key={item.label} variants={fadeUp} className="bg-navy p-6 sm:p-7">
                <p className="text-spectrum text-5xl font-semibold tracking-[-0.06em]">
                  <CountUp value={item.value} />
                </p>
                <h3 className="mt-3 text-sm font-semibold text-snow">{item.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-mist">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-dashed border-white/[0.12] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Awaiting verified records</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {unpublishedMetrics.map((metric) => (
              <li key={metric.label} className="flex items-center gap-2.5 text-sm text-mist">
                <span className="text-snow">{metric.label}</span>
                <span aria-hidden="true">—</span>
                <span className="text-xs tracking-[0.14em] uppercase">{metric.note}</span>
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
      const progress = Math.min(1, (now - began) / 900);
      setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, inView, value]);

  return (
    <span ref={ref} className="num">
      {animate ? display : value}
    </span>
  );
}
