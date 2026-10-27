import { useReducedMotion } from "motion/react";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { createActSample, sampleActs } from "../../three/acts";
import { getTier } from "../../three/quality";
import { selectNode, stage } from "../../three/stageStore";
import StageFallback from "./StageFallback";

const Stage = lazy(() => import("../../three/Stage"));

const wakeEvents = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"];
const idleFallbackMs = 3500;

/**
 * The 3D chunk (three.js + R3F) is the heaviest thing on the page, so it never competes with first
 * paint: it waits for the window `load` event, then for the first sign of a present user. Larger
 * tiers also arm after a short idle period; phones wait for interaction and keep the SVG scene.
 */
function useStageArmed(tier) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (tier === "none" || armed) return undefined;
    let timer = 0;
    let idle = 0;
    const arm = () => {
      window.clearTimeout(timer);
      const run = () => setArmed(true);
      idle = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 1000 }) : window.setTimeout(run, 0);
      detach();
    };
    const detach = () => wakeEvents.forEach((name) => window.removeEventListener(name, arm));
    const listen = () => {
      wakeEvents.forEach((name) => window.addEventListener(name, arm, { once: true, passive: true }));
      if (tier !== "low") timer = window.setTimeout(arm, idleFallbackMs);
    };

    if (document.readyState === "complete") listen();
    else window.addEventListener("load", listen, { once: true });

    return () => {
      window.removeEventListener("load", listen);
      detach();
      window.clearTimeout(timer);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [tier, armed]);

  return armed;
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Fixed cinematic backdrop for the home page. Converts scroll position into a fractional act
 * index over every `[data-act]` section, veils the scene behind text-heavy sections, and stops
 * rendering entirely while the scene is fully veiled.
 */
export default function StageBackdrop() {
  const reduce = useReducedMotion();
  const [tier, setTier] = useState(() => getTier());
  const [ready, setReady] = useState(false);
  const [eventSource] = useState(() => document.getElementById("root"));
  const veilRef = useRef(null);
  const armed = useStageArmed(tier);

  useEffect(() => {
    const sample = createActSample();
    let tops = [];
    let frame = 0;
    let loop = "";
    let lastY = window.scrollY;
    let lastAt = performance.now();

    const measure = () => {
      const markers = [...document.querySelectorAll("[data-act]")];
      stage.actNames = markers.length ? markers.map((node) => node.dataset.act) : ["hero"];
      tops = markers.map((node) => node.getBoundingClientRect().top + window.scrollY);
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const probe = window.scrollY + vh * 0.5;
      let position = 0;
      // Each boundary blends over ~half a viewport centred just above the section top.
      for (let index = 1; index < tops.length; index += 1) {
        position += smoothstep(tops[index] - vh * 0.45, tops[index] + vh * 0.1, probe);
      }
      stage.actPos = position;

      const now = performance.now();
      const elapsed = Math.max(16, now - lastAt);
      stage.velocity = (window.scrollY - lastY) / vh / (elapsed / 1000);
      stage.velocityAt = now;
      lastY = window.scrollY;
      lastAt = now;

      const narrow = window.innerWidth < 1024 || window.innerWidth / vh < 1.1;
      const { dim } = sampleActs(stage.actNames, position, narrow, sample);
      if (veilRef.current) veilRef.current.style.opacity = dim.toFixed(3);

      const nextLoop = dim > 0.95 ? "never" : reduce ? "demand" : "always";
      if (nextLoop !== loop && stage.setFrameloop) {
        loop = nextLoop;
        stage.setFrameloop(nextLoop);
      }
      if (reduce) stage.invalidate?.();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    const onPointer = (event) => {
      if (event.pointerType !== "mouse") return;
      stage.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    remeasure();
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reduce, ready]);

  useEffect(
    () => () => {
      selectNode(null);
      stage.invalidate = null;
      stage.setFrameloop = null;
      stage.panelEl = null;
      document.body.style.cursor = "";
    },
    [],
  );

  const webgl = tier !== "none";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh overflow-hidden">
      <StageFallback shown={!webgl || !ready} />
      {webgl && armed ? (
        <StageErrorBoundary onError={() => setTier("none")}>
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
              <Stage tier={tier} reduce={Boolean(reduce)} eventSource={eventSource} onReady={() => setReady(true)} />
            </div>
          </Suspense>
        </StageErrorBoundary>
      ) : null}
      <div ref={veilRef} className="absolute inset-0 bg-navy" style={{ opacity: 0 }} />
      <div className="stage-vignette absolute inset-0" />
      <div className="bg-noise absolute inset-0" />
    </div>
  );
}

/** If WebGL fails at runtime (context creation, driver issues) fall back to the static scene. */
class StageErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
