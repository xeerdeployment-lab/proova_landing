import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { principles } from "../data/content";
import { fadeUp, stagger, viewport } from "../lib/motion";
import TiltCard from "./ui/TiltCard";

const statement =
  "PROOVA is being built as a considered home for a community business opportunity — a place to understand the model, learn with other people, and decide with the terms in view.";
const emphasis = new Set(["understand", "learn", "decide"]);

export default function BrandIntro() {
  const reduce = useReducedMotion();
  const statementRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: statementRef, offset: ["start 0.85", "end 0.5"] });
  const words = statement.split(" ");

  return (
    <section id="about" data-act="intro" className="section overflow-hidden">
      
      <div className="container-page relative">
        <motion.p
          className="eyebrow"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={viewport}
        >
          The idea
        </motion.p>

        <p
          ref={statementRef}
          className="mt-8 max-w-5xl text-[clamp(1.85rem,4.2vw,3.6rem)] leading-[1.12] font-medium tracking-[-0.04em] text-balance text-snow"
        >
          {words.map((word, index) => {
            const clean = word.replace(/[^a-z]/gi, "").toLowerCase();
            return (
              <Word
                key={`${word}-${index}`}
                progress={scrollYProgress}
                range={[index / words.length, (index + 1) / words.length]}
                still={reduce}
                className={emphasis.has(clean) ? "serif-accent text-iris" : ""}
              >
                {word}
              </Word>
            );
          })}
        </p>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <motion.div
            className="space-y-5 text-base leading-relaxed text-mist sm:text-lg lg:col-span-5"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            <p>
              This introduction is deliberately quiet about what has not been decided.
              Products, services, fees, and compensation will appear here only when they
              are final and can be stated accurately. Until then, the standard is clarity.
            </p>
            <p className="text-snow">
              Growth, if it comes, comes from useful work and real demand — never from a
              slogan.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-3 sm:grid-cols-3 lg:col-span-7"
            variants={stagger}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            {principles.map((item, index) => (
              <TiltCard key={item.title} as="article" variants={fadeUp} className="panel p-6">
                <p className="tilt-layer serif-accent text-4xl text-gold/90 [--depth:16px]">0{index + 1}</p>
                <h3 className="tilt-layer mt-6 text-lg leading-snug font-semibold tracking-[-0.02em] text-snow [--depth:8px]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{item.body}</p>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Word({ children, progress, range, still, className }) {
  const opacity = useTransform(progress, range, [0.16, 1]);

  return (
    <>
      <motion.span className={className} style={still ? undefined : { opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}
