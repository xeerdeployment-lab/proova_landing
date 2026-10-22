import { motion, useReducedMotion } from "motion/react";
import { ease } from "../../lib/motion";

export default function Tabs({ label, tabs, value, onChange }) {
  const reduce = useReducedMotion();

  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 rounded-full border border-line bg-white/[0.03] p-1">
      {tabs.map((tab) => {
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected ? "text-snow" : "text-mist hover:text-snow"
            }`}
          >
            {selected ? (
              reduce ? (
                <span className="absolute inset-0 rounded-full bg-royal/25" />
              ) : (
                <motion.span
                  layoutId={`tab-${label}`}
                  className="absolute inset-0 rounded-full bg-royal/25"
                  transition={{ duration: 0.28, ease }}
                />
              )
            ) : null}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
