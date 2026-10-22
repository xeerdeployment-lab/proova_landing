import { motion } from "motion/react";
import { useRef } from "react";

/**
 * Card with a pointer-following highlight and border glow (see `.spotlight` in index.css).
 * Writes CSS variables directly so hovering never triggers a React render.
 */
export default function SpotlightCard({ as = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  const Tag = motion[as] ?? motion.div;

  const onPointerMove = (event) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Tag ref={ref} onPointerMove={onPointerMove} className={`spotlight ${className}`} {...props}>
      {children}
    </Tag>
  );
}
