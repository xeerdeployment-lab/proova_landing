import cx from "../../lib/cx";

const tones = {
  pending: "bg-warning/12 text-warning",
  completed: "bg-success/12 text-success",
  rejected: "bg-danger/12 text-danger",
  failed: "bg-danger/12 text-danger",
  active: "bg-success/12 text-success",
  closed: "bg-white/6 text-mist",
  verified: "bg-success/12 text-success",
  self: "bg-gold/12 text-gold",
  "not-confirmed": "bg-white/6 text-mist",
  "met-in-sample": "bg-royal/15 text-electric",
  "not-met": "bg-white/6 text-mist",
  unverified: "bg-warning/12 text-warning",
};

const labels = {
  pending: "Pending",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
  active: "Active",
  closed: "Closed",
  verified: "Verified",
  self: "You",
  "not-confirmed": "Not confirmed",
  "met-in-sample": "Met in sample",
  "not-met": "Not met",
  unverified: "Unverified",
};

export default function StatusBadge({ status, label }) {
  const key = String(status ?? "").toLowerCase();
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide whitespace-nowrap",
        tones[key] ?? "bg-white/6 text-mist",
      )}
    >
      {label ?? labels[key] ?? status}
    </span>
  );
}
