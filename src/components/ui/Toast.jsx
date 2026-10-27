import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDashboard } from "../../hooks/useDashboard";
import { ease } from "../../lib/motion";

export default function ToastRegion() {
  const { toasts, dismissToast } = useDashboard();
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-[90] flex w-[min(100%-2rem,22rem)] lg:bottom-4 flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto rounded-2xl border bg-card px-4 py-3 text-left shadow-2xl ${
              toast.tone === "success" ? "border-accent/30" : toast.tone === "error" ? "border-danger/30" : "border-line"
            }`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease }}
          >
            <p className={`text-sm font-semibold ${toast.tone === "error" ? "text-danger" : toast.tone === "success" ? "text-mint" : "text-snow"}`}>{toast.title}</p>
            {toast.body ? <p className="mt-1 text-sm leading-relaxed text-mist">{toast.body}</p> : null}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
