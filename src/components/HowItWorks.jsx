import { BookOpen, Network, UserPlus } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { steps } from "../data/content";
import { fadeUp, stagger, viewport } from "../lib/motion";
import SectionHeading from "./SectionHeading";
import TiltCard from "./ui/TiltCard";

const stepIcons = [UserPlus, BookOpen, Network];

export default function HowItWorks() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 0.8", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="how-it-works" data-act="path" className="section overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-page">
        <SectionHeading
          eyebrow="The path"
          align="center"
          title={
            <>
              Three steps. <span className="serif-accent text-iris">No hidden leap.</span>
            </>
          }
          description="There is no shortcut from interest to income. Each step stays available to read before you decide."
        />

        <div ref={trackRef} className="relative mt-20">
          {/* Desktop track */}
          <div aria-hidden="true" className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px bg-white/10 lg:block">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-royal via-iris to-cyan"
              style={{ scaleX: reduce ? 1 : progress }}
            />
          </div>
          {/* Mobile track */}
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-7 w-px bg-white/10 lg:hidden">
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-royal via-iris to-cyan"
              style={{ scaleY: reduce ? 1 : progress }}
            />
          </div>

          <motion.ol
            className="relative grid gap-12 lg:grid-cols-3 lg:gap-10"
            variants={stagger}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            {steps.map((step, index) => (
              <Step key={step.number} step={step} index={index} progress={progress} reduce={reduce} />
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

function Step({ step, index, progress, reduce }) {
  const Icon = stepIcons[index] ?? Network;
  const threshold = index / steps.length;
  const lit = useTransform(progress, [threshold, threshold + 0.12], [0, 1]);

  return (
    <motion.li variants={fadeUp} className="relative flex gap-6 lg:flex-col lg:items-center lg:text-center">
      <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-ink">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border border-iris/60 bg-royal/20 shadow-[0_0_30px_-4px_rgba(99,91,255,0.7)]"
          style={{ opacity: reduce ? 1 : lit }}
        />
        <Icon size={20} strokeWidth={1.6} className="relative text-snow" aria-hidden="true" />
      </div>
      <TiltCard className="glass-deep min-w-0 flex-1 rounded-[1.6rem] p-6 sm:p-7 lg:mt-8 lg:w-full">
        <p className="tilt-layer serif-accent text-2xl text-gold/90 [--depth:14px]">{step.number}</p>
        <h3 className="tilt-layer mt-2 text-2xl font-semibold tracking-[-0.03em] text-snow [--depth:8px]">{step.title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist sm:text-base lg:mx-auto">{step.body}</p>
      </TiltCard>
    </motion.li>
  );
}
