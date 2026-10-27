import { Check, Loader2, X } from "lucide-react";
import cx from "../../lib/cx";

/**
 * Status of a submitted transaction as the server reports it. `status` is the request state
 * ("submitting") or the ledger status of the created record ("pending" | "completed" | "failed").
 */
export default function TxProgress({ status, steps = ["Request sent", "Recorded by server", "Confirmed"] }) {
  const reached = status === "submitting" ? 0 : status === "pending" ? 1 : status === "completed" ? 3 : 1;
  const failed = status === "failed" || status === "rejected";

  return (
    <ol className="space-y-3" aria-label="Transaction status">
      {steps.map((step, index) => {
        const done = index < reached;
        const active = index === reached && !failed;
        const error = failed && index === reached;
        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              className={cx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                done && "border-accent/40 bg-accent/15 text-accent",
                active && "border-warning/40 bg-warning/10 text-warning",
                error && "border-danger/40 bg-danger/10 text-danger",
                !done && !active && !error && "border-line text-mist",
              )}
            >
              {done ? (
                <Check size={14} aria-hidden="true" />
              ) : error ? (
                <X size={14} aria-hidden="true" />
              ) : active ? (
                <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <span className="text-[0.7rem]">{index + 1}</span>
              )}
            </span>
            <span className={cx(done ? "text-snow" : active ? "text-warning" : error ? "text-danger" : "text-mist")}>
              {step}
              <span className="sr-only">{done ? " — done" : active ? " — in progress" : error ? " — failed" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
