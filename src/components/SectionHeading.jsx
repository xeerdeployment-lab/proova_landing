import { motion, useReducedMotion } from "motion/react";
import { fadeUp, stagger, viewport } from "../lib/motion";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  className = "",
}) {
  const reduce = useReducedMotion();
  const centered = align === "center";

  return (
    <motion.div
      className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
      variants={stagger}
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={viewport}
    >
      {eyebrow ? (
        <motion.p variants={fadeUp} className="eyebrow mb-5">
          {eyebrow}
        </motion.p>
      ) : null}
      <motion.h2
        id={id}
        variants={fadeUp}
        className="heading-hud text-[clamp(2rem,4.2vw,3.5rem)] leading-[1] text-balance text-snow"
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={fadeUp}
          className={`mt-6 max-w-2xl text-base leading-relaxed text-pretty text-mist sm:text-lg ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
