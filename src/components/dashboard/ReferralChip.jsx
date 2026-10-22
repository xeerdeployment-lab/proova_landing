import { Copy } from "lucide-react";
import { referralLink } from "../../data/demoData";
import useCopy from "../../hooks/useCopy";

export default function ReferralChip({ code }) {
  const copy = useCopy();
  const link = referralLink(code);

  return (
    <div className="dash-card p-4 sm:p-5">
      <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-mist uppercase">Referral link</p>
      <div className="mt-3 flex items-center gap-2">
        <input
          readOnly
          value={link}
          aria-label="Referral link"
          className="field min-w-0 flex-1 py-2.5 text-xs"
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={() => copy(link, "Referral link copied.")}>
          <Copy size={14} aria-hidden="true" />
          Copy
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-mist">Preview link only. It does not enroll anyone or confirm a referral.</p>
    </div>
  );
}
