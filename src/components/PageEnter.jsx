import { motion, useReducedMotion } from "motion/react";
import { ease } from "../lib/motion";

export default function PageEnter({ children }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}
