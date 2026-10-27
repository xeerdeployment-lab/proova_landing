import { Copy, Share2 } from "lucide-react";
import { useAccount } from "../../hooks/useAccount";
import useCopy from "../../hooks/useCopy";
import { useDashboard } from "../../hooks/useDashboard";
import { referralLink } from "../../lib/format";

export default function ReferralTools({ className = "" }) {
  const copy = useCopy();
  const { pushToast } = useDashboard();
  const { member } = useAccount();
  const link = referralLink(member.referralCode);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join me on Axora", text: "Here is my Axora referral link.", url: link });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    const copied = await copy(link, "Sharing isn't available here, so the link was copied instead.");
    if (!copied) pushToast({ title: "Share is unavailable", body: "Copy the link from the field instead.", tone: "error" });
  };

  return (
    <section className={`dash-card p-5 sm:p-6 ${className}`} aria-labelledby="referral-tools-title">
      <p className="kicker">Invite</p>
      <h2 id="referral-tools-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
        Your referral link
      </h2>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} aria-label="Referral link" className="field num min-w-0 py-2.5 text-sm" onFocus={(event) => event.target.select()} />
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary btn-sm flex-1 sm:flex-none" onClick={() => copy(link, "Referral link copied.")}>
            <Copy size={14} aria-hidden="true" />
            Copy
          </button>
          <button type="button" className="btn btn-secondary btn-sm flex-1 sm:flex-none" onClick={share}>
            <Share2 size={14} aria-hidden="true" />
            Share
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mist">
        Referral code
        <button type="button" className="chip num hover:text-snow" onClick={() => copy(member.referralCode, "Referral code copied.")} aria-label={`Copy referral code ${member.referralCode}`}>
          {member.referralCode}
          <Copy size={11} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
