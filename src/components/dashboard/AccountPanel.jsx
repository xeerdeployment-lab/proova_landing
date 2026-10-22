import { Copy } from "lucide-react";
import { referralLink } from "../../data/demoData";
import useCopy from "../../hooks/useCopy";
import { formatDate } from "../../lib/dates";
import StatusBadge from "../ui/StatusBadge";

function Tile({ label, value, hint, copyValue, onCopy, wide = false }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-navy/50 p-4 ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-mist uppercase">{label}</p>
        {copyValue ? (
          <button type="button" className="icon-btn h-8 w-8" aria-label={`Copy ${label}`} onClick={() => onCopy(copyValue, `${label} copied.`)}>
            <Copy size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-medium break-all text-snow">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-mist">{hint}</p> : null}
    </div>
  );
}

export default function AccountPanel({ model }) {
  const copy = useCopy();
  const { member, activeStake } = model;
  const link = referralLink(member.referralId);

  return (
    <div className="dash-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-electric uppercase">Account</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Member profile</h2>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-mist">Preview profile. Private keys and personal contact details are not shown.</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Tile label="Member ID" value={member.id} copyValue={member.id} onCopy={copy} hint="Sample member identifier." />
        <Tile label="Wallet address" value="Not connected" hint="No wallet integration is attached to this preview." />
        <Tile label="Referral ID" value={member.referralId} copyValue={member.referralId} onCopy={copy} hint="Same code as the preview link." />
        <Tile label="Registration date" value={formatDate(member.createdAt)} hint="Date written on the sample profile." />
        <div className="rounded-2xl border border-white/[0.08] bg-navy/50 p-4">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-mist uppercase">Account status</p>
          <div className="mt-3">
            <StatusBadge status="self" label="Preview" />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mist">No live account is signed in.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-navy/50 p-4">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-mist uppercase">Active stake status</p>
          <div className="mt-3">
            <StatusBadge status={activeStake ? "active" : "closed"} label={activeStake ? "Sample active" : "No active stake"} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            {activeStake ? "One sample stake is marked active." : "This preview view has no active stake."}
          </p>
        </div>
        <Tile label="Referral link" value={link} copyValue={link} onCopy={copy} wide hint="Opens the public introduction. It does not enroll anyone." />
      </div>
    </div>
  );
}
