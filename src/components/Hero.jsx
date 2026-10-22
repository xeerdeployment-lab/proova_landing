import { ArrowRight, FileText, MousePointerClick, ShieldCheck, Tag } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import { heroAssurances } from "../data/content";
import { ease } from "../lib/motion";
import Button from "./Button";
import NodeInfoPanel from "./stage/NodeInfoPanel";
import Magnetic from "./ui/Magnetic";
import TextReveal from "./ui/TextReveal";

const assuranceIcons = { ShieldCheck, FileText, Tag };

const headline = [
  [{ text: "Build" }, { text: "your" }, { text: "network.", className: "serif-accent text-spectrum pr-[0.06em]" }],
  [{ text: "Keep every term" }, { text: "in view.", keep: true, className: "serif-accent text-snow/90" }],
];

/** Hero copy over the live 3D network (rendered by the page-level stage behind it). */
export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const exitOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const exitY = useTransform(scrollYProgress, [0, 0.6], [0, -90]);

  return (
    <section
      id="top"
      ref={sectionRef}
      data-act="hero"
      className="relative isolate flex min-h-svh scroll-mt-28 flex-col justify-center overflow-hidden pt-28 pb-24 sm:pt-32 lg:pb-16"
    >
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
      {/* Quiet the scene behind the copy so the headline and body stay crisp. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,15,0.72)_0%,rgba(5,7,15,0.45)_38%,transparent_62%)] max-lg:bg-[linear-gradient(180deg,rgba(5,7,15,0.5)_0%,rgba(5,7,15,0.35)_55%,transparent_80%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-navy/60" />

      <motion.div className="container-page relative" style={reduce ? undefined : { opacity: exitOpacity, y: exitY }}>
        <div className="max-w-[40rem] lg:max-w-[44rem]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-3 pl-1.5 text-xs text-mist backdrop-blur transition-colors duration-300 hover:border-iris/40 hover:text-snow"
            >
              <span className="rounded-full bg-gradient-to-r from-royal to-electric px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-white uppercase">
                Preview
              </span>
              Explore the member dashboard
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </motion.div>

          <TextReveal
            lines={headline}
            delay={0.2}
            className="mt-8 text-[clamp(2.75rem,6.4vw,5.9rem)] leading-[0.95] font-semibold tracking-[-0.055em] text-snow [text-shadow:0_2px_40px_rgba(5,7,15,0.6)]"
          />

          <motion.p
            className="mt-7 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.75 }}
          >
            PROOVA is a community business platform built around clarity — a precise member
            dashboard for your stake, network, and ledger, and a plan you can read before you
            participate. Progress depends on your activity. Income is never guaranteed.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.9 }}
          >
            <Magnetic>
              <Button to="/get-started" variant="lux" size="lg" className="group w-full sm:w-auto">
                Get Started
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </Button>
            </Magnetic>
            <Magnetic>
              <Button to="/#platform" variant="glass" size="lg" className="w-full sm:w-auto">
                Explore Platform
              </Button>
            </Magnetic>
          </motion.div>

          <motion.ul
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease, delay: 1.1 }}
            aria-label="Platform commitments"
          >
            {heroAssurances.map((item) => {
              const Icon = assuranceIcons[item.icon] ?? ShieldCheck;
              return (
                <li key={item.label} className="flex items-center gap-2 text-sm text-mist">
                  <Icon size={15} strokeWidth={1.7} className="text-cyan" aria-hidden="true" />
                  {item.label}
                </li>
              );
            })}
          </motion.ul>
        </div>
      </motion.div>

      {/* Caption for the 3D scene, anchored under it on wide screens. */}
      <motion.div
        className="pointer-events-none absolute right-5 bottom-8 left-5 flex items-center justify-between gap-4 sm:right-8 sm:left-8 lg:left-auto lg:w-[44%] lg:justify-end"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease, delay: 1.6 }}
        style={reduce ? undefined : { opacity: exitOpacity }}
      >
        <p className="flex items-center gap-2 text-[0.7rem] tracking-[0.14em] text-mist/80 uppercase">
          <MousePointerClick size={14} className="text-iris" aria-hidden="true" />
          <span className="hidden sm:inline">Hover or tap a node</span>
          <span className="sm:hidden">Tap a node</span>
          <span aria-hidden="true">·</span>
          Illustrative network
        </p>
        <span className="scroll-line lg:hidden" aria-hidden="true" />
      </motion.div>

      <NodeInfoPanel />
    </section>
  );
}
