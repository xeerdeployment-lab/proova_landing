import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, stagger, viewport } from "../lib/motion";
import Button from "./Button";
import Magnetic from "./ui/Magnetic";

/** Closing scene: the stage converges the network into the core above this copy. */
export default function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section data-act="finale" className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 pt-[46svh] pb-20 sm:px-8 md:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(70%_80%_at_50%_100%,rgba(5,7,15,0.85),transparent_75%)]" />

      <motion.div
        className="relative mx-auto max-w-3xl text-center"
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
          className="mt-6 text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.055em] text-snow [text-shadow:0_4px_50px_rgba(5,7,15,0.8)]"
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
    </section>
  );
}
