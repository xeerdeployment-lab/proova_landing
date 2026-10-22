import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

const spring = { stiffness: 170, damping: 18, mass: 0.6 };

/**
 * Card with perspective tilt, lift, pointer-following light (`.spotlight`) and a moving sheen.
 * Children marked `.tilt-layer` (with an optional `--depth`) drift against the tilt for depth.
 * Tilt runs for fine pointers only; touch and reduced motion get the static card.
 */
export default function TiltCard({ as = "div", className = "", max = 6, children, ...props }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const Tag = motion[as] ?? motion.div;
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const lift = useSpring(0, spring);
  const y = useTransform(lift, [0, 1], [0, -6]);

  const onPointerMove = (event) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    node.style.setProperty("--mx", `${x}px`);
    node.style.setProperty("--my", `${top}px`);
    if (reduce || event.pointerType !== "mouse") return;
    const px = x / rect.width - 0.5;
    const py = top / rect.height - 0.5;
    node.style.setProperty("--tx", px.toFixed(3));
    node.style.setProperty("--ty", py.toFixed(3));
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
    lift.set(1);
  };

  const onPointerLeave = () => {
    ref.current?.style.setProperty("--tx", "0");
    ref.current?.style.setProperty("--ty", "0");
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={reduce ? undefined : { rotateX, rotateY, y, transformPerspective: 1100 }}
      className={`spotlight tilt ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="tilt-sheen" />
      {children}
    </Tag>
  );
}
