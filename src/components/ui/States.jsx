import { AlertTriangle, Inbox, RotateCcw } from "lucide-react";
import cx from "../../lib/cx";

export function DemoLabel({ className = "", children = "Demo data" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-gold uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading preview</span>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action = null }) {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-10">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-gold">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold text-snow">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-mist">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = "The preview could not load", body, onRetry }) {
  return (
    <div className="dash-card flex flex-col items-start gap-3 p-6" role="alert">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-mist">
          {body ?? "Sample records are still on this device. Retry to return to the demo view. Nothing was requested from a server."}
        </p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RotateCcw size={15} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
