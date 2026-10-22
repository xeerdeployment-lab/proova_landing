import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Sparse drifting particles on a canvas. Pauses while offscreen or when the tab is hidden,
 * draws a single static frame for reduced motion, and uses fewer particles on small screens.
 */
export default function ParticleField({ className = "" }) {
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const count = window.matchMedia("(max-width: 640px)").matches ? 18 : 42;
    const particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.35,
      v: Math.random() * 0.0002 + 0.00005,
      a: Math.random() * 0.4 + 0.1,
      tone: index % 4,
    }));
    const tones = ["216, 189, 131", "165, 160, 255", "90, 215, 242", "165, 160, 255"];

    let frame = 0;
    let width = 0;
    let height = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (advance) => {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        if (advance) {
          particle.y -= particle.v;
          if (particle.y < 0) particle.y = 1;
        }
        context.beginPath();
        context.fillStyle = `rgba(${tones[particle.tone]}, ${particle.a})`;
        context.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
        context.fill();
      }
    };

    const loop = () => {
      draw(true);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (!reduce && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    draw(false);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(false);
    });
    resizeObserver.observe(canvas);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    });
    viewObserver.observe(canvas);

    const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
