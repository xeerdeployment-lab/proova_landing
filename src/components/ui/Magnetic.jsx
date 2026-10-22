import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";

const spring = { stiffness: 260, damping: 20, mass: 0.6 };

/**
 * Pulls its child gently toward the pointer. Only active for fine pointers
 * and when the user has not asked for reduced motion.
 */
export default function Magnetic({ children, strength = 0.28, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  const onPointerMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-flex ${className}`}
      style={reduce ? undefined : { x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
