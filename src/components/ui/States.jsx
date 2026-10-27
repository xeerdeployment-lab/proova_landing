import { AlertTriangle, Inbox, PlugZap, RotateCcw } from "lucide-react";
import cx from "../../lib/cx";

export function DemoLabel({ className = "", children = "Demo" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.14em] text-warning uppercase",
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
      <span className="sr-only">Loading your account</span>
      <Skeleton className="h-56 w-full rounded-[1.75rem]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action = null, className = "" }) {
  return (
    <div className={cx("flex flex-col items-start gap-3 px-5 py-10", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-mint">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold text-snow">{title}</p>
        {body ? <p className="mt-1 max-w-md text-sm leading-relaxed text-mist">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = "We couldn't load your account", body, onRetry }) {
  return (
    <div className="dash-card flex flex-col items-start gap-3 p-6" role="alert">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-mist">{body ?? "Something went wrong while contacting the server. Your funds are not affected."}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RotateCcw size={15} aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function OfflineState() {
  return (
    <div className="dash-card flex flex-col items-start gap-3 p-6 sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-mist">
        <PlugZap size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-semibold">The member API isn&apos;t connected</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
          This build has no <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-snow">VITE_API_URL</code> configured, so there is no account to
          show. Balances, rewards and transactions only appear when they come from the Axora backend — the dashboard never fills in placeholder figures.
        </p>
      </div>
    </div>
  );
}

/** Inline error from a rejected request. */
export function InlineError({ error }) {
  if (!error) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/[0.07] px-3 py-2.5 text-sm text-danger" role="alert">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
      {error.message ?? String(error)}
    </p>
  );
}
