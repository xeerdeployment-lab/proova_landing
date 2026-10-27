import cx from "../../lib/cx";

const tones = {
  pending: "bg-warning/12 text-warning",
  processing: "bg-warning/12 text-warning",
  completed: "bg-success/12 text-success",
  confirmed: "bg-success/12 text-success",
  rejected: "bg-danger/12 text-danger",
  failed: "bg-danger/12 text-danger",
  active: "bg-success/12 text-success",
  closed: "bg-white/6 text-mist",
  verified: "bg-success/12 text-success",
  self: "bg-mint/12 text-mint",
  achieved: "bg-success/12 text-success",
  "in-progress": "bg-warning/12 text-warning",
  missed: "bg-white/6 text-mist",
  locked: "bg-white/6 text-mist",
  open: "bg-success/12 text-success",
  waiting: "bg-white/6 text-mist",
  "not-confirmed": "bg-white/6 text-mist",
  "met-in-sample": "bg-royal/15 text-electric",
  "not-met": "bg-white/6 text-mist",
  unverified: "bg-warning/12 text-warning",
};

const labels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  confirmed: "Confirmed",
  rejected: "Rejected",
  failed: "Failed",
  active: "Active",
  closed: "Closed",
  verified: "Verified",
  self: "You",
  achieved: "Achieved",
  "in-progress": "In progress",
  missed: "Window closed",
  locked: "Locked",
  open: "Open",
  waiting: "Waiting",
  "not-confirmed": "Not confirmed",
  "met-in-sample": "Met in sample",
  "not-met": "Not met",
  unverified: "Unverified",
};

export default function StatusBadge({ status, label, className = "" }) {
  const key = String(status ?? "").toLowerCase();
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide whitespace-nowrap",
        tones[key] ?? "bg-white/6 text-mist",
        className,
      )}
    >
      {key === "pending" || key === "processing" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden="true" /> : null}
      {label ?? labels[key] ?? status}
    </span>
  );
}
