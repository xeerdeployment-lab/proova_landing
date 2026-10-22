import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { fadeUp, stagger, viewport } from "../lib/motion";
import Button from "./Button";
import Magnetic from "./ui/Magnetic";

export default function FinalCTA() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -80, reduce ? 0 : 80]);
  const linesY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, reduce ? 0 : -40]);

  return (
    <section ref={ref} className="bg-navy px-3 pt-8 pb-10 sm:px-6 md:pb-16">
      <div className="beam relative mx-auto w-full max-w-6xl rounded-[2.25rem]">
        <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-ink px-6 py-24 text-center sm:px-14 md:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="bg-grid absolute inset-0 opacity-60" />
            <motion.div style={{ y: orbY }} className="orb absolute -bottom-[30rem] left-1/2 h-[52rem] w-[52rem] -translate-x-1/2" />
            <motion.svg style={{ y: linesY }} viewBox="0 0 1100 500" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice">
              <g fill="none" stroke="rgba(165,160,255,0.35)" strokeWidth="1">
                <path d="M -20 380 C 200 300, 320 420, 550 250 S 900 120, 1120 200" />
                <path d="M -20 120 C 180 200, 360 60, 550 250 S 880 420, 1120 330" strokeOpacity="0.6" />
              </g>
              {[
                [120, 330],
                [330, 342],
                [550, 250],
                [780, 175],
                [960, 360],
                [210, 150],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={x === 550 ? 6 : 3.5} fill={x === 550 ? "#d8bd83" : "#a5a0ff"} />
              ))}
            </motion.svg>
            <div className="bg-noise absolute inset-0" />
          </div>

          <motion.div
            className="relative mx-auto max-w-3xl"
            variants={stagger}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            <motion.p variants={fadeUp} className="eyebrow justify-center">
              Begin
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.055em] text-snow"
            >
              Start your <span className="serif-accent text-spectrum">journey.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
              Begin with the published facts. Participation opens only when the offer and the
              plan can be stated in full. Income is not guaranteed.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Magnetic className="justify-center">
                <Button to="/get-started" variant="lux" size="lg" className="group w-full sm:w-auto">
                  Get Started
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </Button>
              </Magnetic>
              <Magnetic className="justify-center">
                <Button to="/#opportunity" variant="glass" size="lg" className="w-full sm:w-auto">
                  Review the opportunity
                </Button>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
