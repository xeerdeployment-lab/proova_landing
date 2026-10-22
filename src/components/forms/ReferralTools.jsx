import { Copy, QrCode, Share2 } from "lucide-react";
import { demoMember, referralLink } from "../../data/demoData";
import useCopy from "../../hooks/useCopy";
import { useDashboard } from "../../hooks/useDashboard";

export default function ReferralTools() {
  const copy = useCopy();
  const { pushToast } = useDashboard();
  const link = referralLink(demoMember.referralId);

  const share = async () => {
    const payload = {
      title: "PROOVA preview",
      text: "This is a PROOVA interface preview link. It does not enroll anyone.",
      url: link,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    const copied = await copy(link, "Share is unavailable here, so the preview link was copied.");
    if (!copied) {
      pushToast({ title: "Share is unavailable", body: "Copy the link from the field below.", tone: "error" });
    }
  };

  return (
    <section className="dash-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-[-0.03em]">Referral tools</h2>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        The link opens the public introduction with a preview code. It does not create an account, attribute a referral, or enroll anyone.
      </p>
      <dl className="mt-5 space-y-4">
        <div>
          <dt className="text-xs tracking-[0.14em] text-mist uppercase">Referral ID</dt>
          <dd className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-xl border border-line bg-navy/60 px-3 py-2 text-sm text-snow">{demoMember.referralId}</code>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(demoMember.referralId, "Referral ID copied.")}>
              <Copy size={14} aria-hidden="true" />
              Copy ID
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.14em] text-mist uppercase">Referral link</dt>
          <dd className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={link} aria-label="Referral link" className="field py-2.5 text-sm" onFocus={(event) => event.target.select()} />
            <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={() => copy(link, "Referral link copied.")}>
              <Copy size={14} aria-hidden="true" />
              Copy link
            </button>
            <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={share}>
              <Share2 size={14} aria-hidden="true" />
              Share
            </button>
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed border-line p-4">
        <div
          className="grid h-24 w-24 shrink-0 grid-cols-5 gap-1 rounded-xl bg-navy p-2"
          role="img"
          aria-label="Placeholder graphic. This is not a scannable code."
        >
          {Array.from({ length: 25 }, (_, index) => (
            <span key={index} className={index % 3 === 0 || index % 7 === 0 ? "bg-gold/80" : "bg-white/10"} />
          ))}
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-snow">
            <QrCode size={16} aria-hidden="true" />
            QR placeholder
          </p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            A scannable code will be generated when referral links are live. This pattern does not encode the link.
          </p>
        </div>
      </div>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mist">
        <li>Share the preview link only as an introduction to the public site.</li>
        <li>Explain that registration is not open and that earnings are not guaranteed.</li>
        <li>Wait for a confirmed referral record before treating anyone as part of a team.</li>
      </ol>
    </section>
  );
}
