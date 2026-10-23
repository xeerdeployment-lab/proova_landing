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
  [{ text: "Build your" }],
  [{ text: "network.", className: "text-hud pr-[0.04em]" }],
  [{ text: "Every term" }],
  [{ text: "in view.", keep: true, className: "text-cyan" }],
];

/**
 * Two-column hero: copy on the left, and on the right a HUD frame around the 3D Proova emblem
 * (rendered by the page-level stage behind this section; see three/Stage.jsx).
 */
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
      className="relative isolate flex min-h-svh scroll-mt-28 flex-col justify-center overflow-hidden pt-28 pb-24 sm:pt-32 lg:pb-20"
    >
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div aria-hidden="true" className="grid-streaks -z-10">
        <span style={{ top: "28%" }} />
        <span />
        <span />
      </div>
      {/* Quiet the scene behind the copy so the headline and body stay crisp. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,7,10,0.82)_0%,rgba(3,7,10,0.5)_38%,transparent_58%)] max-lg:bg-[linear-gradient(180deg,rgba(3,7,10,0.6)_0%,rgba(3,7,10,0.4)_55%,transparent_80%)]" />

      <HudFrame reduce={reduce} exitOpacity={exitOpacity} />

      <motion.div className="container-page relative" style={reduce ? undefined : { opacity: exitOpacity, y: exitY }}>
        <div className="max-w-[40rem] lg:max-w-[46%]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
          >
            <Link
              to="/dashboard"
              className="group hud-label inline-flex items-center gap-3 border border-cyan/30 bg-cyan/[0.05] py-1.5 pr-3 pl-1.5 text-[0.62rem] text-mist transition-colors duration-300 hover:border-cyan/70 hover:text-snow [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)]"
            >
              <span className="bg-lime px-2 py-1 font-semibold text-ink">Preview</span>
              Member dashboard
              <ArrowRight size={13} className="text-cyan transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </motion.div>

          <TextReveal
            lines={headline}
            delay={0.3}
            className="heading-hud mt-8 text-[clamp(2.5rem,5.2vw,5rem)] leading-[0.92] text-snow [text-shadow:0_2px_40px_rgba(3,7,10,0.7)]"
            after={<span aria-hidden="true" className="hud-cursor" />}
          />

          <motion.p
            className="mt-7 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.85 }}
          >
            PROOVA is a community business platform built around clarity — a precise member
            dashboard for your stake, network, and ledger, and a plan you can read before you
            participate. Progress depends on your activity. Income is never guaranteed.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1 }}
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
            className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-cyan/10 pt-5"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease, delay: 1.2 }}
            aria-label="Platform commitments"
          >
            <li className="hud-label flex items-center gap-2 text-[0.6rem] text-green">
              <span className="status-dot pulse-dot" aria-hidden="true" />
              Status: preview
            </li>
            {heroAssurances.map((item) => {
              const Icon = assuranceIcons[item.icon] ?? ShieldCheck;
              return (
                <li key={item.label} className="hud-label flex items-center gap-2 text-[0.6rem] text-mist">
                  <Icon size={13} strokeWidth={1.7} className="text-cyan" aria-hidden="true" />
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
        <p className="hud-label flex items-center gap-2 text-[0.6rem] text-mist/80">
          <MousePointerClick size={13} className="text-cyan" aria-hidden="true" />
          <span className="hidden sm:inline">Hover or tap a node</span>
          <span className="sm:hidden">Tap a node</span>
          <span aria-hidden="true">//</span>
          Illustrative network
        </p>
        <span className="h-[46px] w-px animate-pulse bg-gradient-to-b from-cyan to-transparent lg:hidden" aria-hidden="true" />
      </motion.div>

      <NodeInfoPanel />
    </section>
  );
}

/** Decorative HUD around the 3D emblem: tick ring, sweeping arcs, and a few quiet readouts. */
function HudFrame({ reduce, exitOpacity }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-[48svh] left-[77.5%] hidden aspect-square w-[min(40vw,36rem,78svh)] -translate-x-1/2 -translate-y-1/2 lg:block"
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.6, ease, delay: 0.6 }}
      style={reduce ? undefined : { opacity: exitOpacity }}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(0,229,242,0.08),rgba(3,7,10,0)_70%)]" />
      <div className="hud-ring" />
      <div className="hud-ticks" />
      <div className="hud-arc" />
      <div className="hud-ring inset-[9%] border-dashed border-cyan/10" />
      <div className="hud-ring inset-[24%] border-lime/10" />

      {/* Crosshair */}
      <span className="absolute top-0 left-1/2 h-5 w-px -translate-x-1/2 bg-cyan/60" />
      <span className="absolute bottom-0 left-1/2 h-5 w-px -translate-x-1/2 bg-cyan/60" />
      <span className="absolute top-1/2 left-0 h-px w-5 -translate-y-1/2 bg-cyan/60" />
      <span className="absolute top-1/2 right-0 h-px w-5 -translate-y-1/2 bg-cyan/60" />

      <span className="hud-label absolute top-[9%] left-[2%] text-[0.56rem] text-cyan/70">
        Node // Core
        <span className="mt-1 block text-mist/60">Illustrative</span>
      </span>
      <span className="hud-label absolute top-[9%] right-[0%] text-right text-[0.56rem] text-lime/70">
        Orbit // 03
        <span className="mt-1 block text-mist/60">Levels shown</span>
      </span>
      <span className="hud-label absolute right-[2%] bottom-[8%] text-right text-[0.56rem] text-mist/60">
        Sample data only
      </span>
    </motion.div>
  );
}
