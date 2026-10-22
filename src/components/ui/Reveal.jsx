import { motion, useReducedMotion } from "motion/react";
import { ease } from "../../lib/motion";

export default function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduce ? 0 : 0.55, ease, delay: reduce ? 0 : delay }}
    >
      {children}
    </Tag>
  );
}
