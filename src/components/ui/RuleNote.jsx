import { Info } from "lucide-react";

export default function RuleNote({ title = "Rule needs confirmation", children }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.06] px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold">
        <Info size={16} aria-hidden="true" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-mist">{children}</p>
    </div>
  );
}
