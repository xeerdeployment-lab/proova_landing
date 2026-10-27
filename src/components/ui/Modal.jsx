import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { ease } from "../../lib/motion";

export default function Modal({ open, title, description, onClose, children, wide = false }) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTarget = panelRef.current?.querySelector("[data-autofocus]") ?? panelRef.current;
    focusTarget?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
          <motion.button
            type="button"
            className="absolute inset-0 bg-[#04070d]/80 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`dash-card dash-scroll relative z-10 max-h-[min(92dvh,880px)] w-full overflow-y-auto bg-card p-5 outline-none sm:p-7 ${
              wide ? "max-w-2xl" : "max-w-lg"
            }`}
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                  {title}
                </h2>
                {description ? <p className="mt-2 text-sm leading-relaxed text-mist">{description}</p> : null}
              </div>
              <button type="button" className="icon-btn shrink-0" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
