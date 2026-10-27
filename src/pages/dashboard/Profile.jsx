import { Copy, KeyRound, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import ReferralTools from "../../components/forms/ReferralTools";
import { InlineError } from "../../components/ui/States";
import { useAccount } from "../../hooks/useAccount";
import useCopy from "../../hooks/useCopy";
import { useDashboard } from "../../hooks/useDashboard";
import { formatDate } from "../../lib/dates";
import usePageTitle from "../../lib/usePageTitle";
import { api } from "../../services/api";

const preferenceCopy = [
  ["rewards", "Reward notices"],
  ["withdrawals", "Withdrawal notices"],
  ["team", "Team notices"],
  ["announcements", "Announcements"],
];

export default function Profile() {
  usePageTitle("Profile & Settings");
  const account = useAccount();
  const { member } = account;
  const { prefs, updatePref, pushToast, refresh, source } = useDashboard();
  const copy = useCopy();
  const [name, setName] = useState(member.displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveName = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 48) {
      setError({ message: "Use 2 to 48 characters." });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({ displayName: trimmed });
      await refresh();
      pushToast({ title: "Profile updated", body: "Your display name was saved.", tone: "success" });
    } catch (failure) {
      setError(failure);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form className="dash-card p-5 sm:p-6" onSubmit={saveName} noValidate>
          <p className="kicker">Profile</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-mist">Member ID</dt>
              <dd className="num mt-1">{member.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Joined</dt>
              <dd className="mt-1">{formatDate(member.joinedAt, true)}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">First stake</dt>
              <dd className="mt-1">{member.firstStakeAt ? formatDate(member.firstStakeAt, true) : "Not yet"}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Plan version</dt>
              <dd className="num mt-1">{account.planVersion}</dd>
            </div>
          </dl>
          <label htmlFor="display-name" className="mt-6 block text-sm font-medium">
            Display name
          </label>
          <input id="display-name" value={name} maxLength={48} onChange={(event) => setName(event.target.value)} className="field mt-2" autoComplete="nickname" />
          <div className="mt-3">
            <InlineError error={error} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm mt-3" disabled={saving || name.trim() === member.displayName}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <section className="dash-card p-5 sm:p-6" aria-labelledby="security-title">
          <p className="kicker">Security</p>
          <h2 id="security-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            Wallet & access
          </h2>
          <div className="mt-5 rounded-2xl border border-line bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Wallet size={16} className="text-accent" aria-hidden="true" />
              Linked wallet {source === "demo" ? <span className="text-[0.65rem] font-semibold tracking-wider text-warning uppercase">Demo</span> : null}
            </p>
            {member.walletAddress ? (
              <div className="mt-2 flex items-center gap-2">
                <code className="num min-w-0 flex-1 text-sm break-all text-mist">{member.walletAddress}</code>
                <button type="button" className="icon-btn h-9 w-9 shrink-0" onClick={() => copy(member.walletAddress, "Wallet address copied.")} aria-label="Copy wallet address">
                  <Copy size={14} />
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-mist">No wallet is linked to this account.</p>
            )}
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-mist">
            <li className="flex gap-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              Stakes and payouts only use the address linked to your account. One active stake is allowed per address.
            </li>
            <li className="flex gap-3">
              <KeyRound size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              Axora will never ask for your seed phrase or private key — not in support chats, email or this dashboard.
            </li>
          </ul>
          <div className="mt-5 flex gap-4 text-sm">
            <Link to="/privacy" className="text-mint hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="text-mint hover:underline">
              Terms
            </Link>
          </div>
        </section>
      </section>

      <ReferralTools />

      <section className="dash-card p-5 sm:p-6">
        <p className="kicker">Preferences</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Notifications</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {preferenceCopy.map(([key, label]) => (
            <li key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3">
              <span className="text-sm" id={`pref-${key}`}>
                {label}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                aria-labelledby={`pref-${key}`}
                onClick={() => updatePref(key, !prefs[key])}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${prefs[key] ? "bg-accent" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-snow shadow transition-transform ${prefs[key] ? "translate-x-5" : ""}`} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-mist">Saved on this device.</p>
      </section>
    </div>
  );
}
