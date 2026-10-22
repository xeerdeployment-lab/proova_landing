import { useState } from "react";
import { Link } from "react-router";
import ReferralTools from "../../components/forms/ReferralTools";
import { EmptyState } from "../../components/ui/States";
import { useDashboard } from "../../hooks/useDashboard";
import { demoMember } from "../../data/demoData";
import { formatDate } from "../../lib/dates";
import usePageTitle from "../../lib/usePageTitle";

const preferenceCopy = [
  ["rewards", "Reward notices"],
  ["withdrawals", "Withdrawal notices"],
  ["team", "Team notices"],
  ["announcements", "Announcements"],
];

export default function Profile() {
  usePageTitle("Profile & Security");
  const { displayName, saveDisplayName, prefs, updatePref, pushToast } = useDashboard();
  const [name, setName] = useState(displayName || demoMember.displayName);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const saveName = (event) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      pushToast({ title: "Name is too short", body: "Use at least 2 characters.", tone: "error" });
      return;
    }
    saveDisplayName(name);
    pushToast({ title: "Name saved on this device", body: "It was not sent to a server." });
  };

  const savePassword = (event) => {
    event.preventDefault();
    if (current.length < 8 || next.length < 8) {
      setPasswordError("Use at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setPasswordError("");
    pushToast({ title: "Password was not changed", body: "This preview has no authentication backend." });
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-2">
        <form className="dash-card p-6" onSubmit={saveName}>
          <h2 className="text-xl font-semibold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-mist">Member ID</dt>
              <dd className="mt-1">{demoMember.id}</dd>
            </div>
            <div>
              <dt className="text-mist">Account creation date</dt>
              <dd className="mt-1">{formatDate(demoMember.createdAt, true)}</dd>
            </div>
          </dl>
          <label htmlFor="display-name" className="mt-5 block text-sm font-medium">
            Display name
          </label>
          <input id="display-name" value={name} onChange={(event) => setName(event.target.value)} className="field mt-2" />
          <p className="mt-2 text-xs text-mist">Saved in this browser only. It does not update an account.</p>
          <button type="submit" className="btn btn-primary btn-sm mt-4">
            Save display name
          </button>
        </form>
        <form className="dash-card p-6" onSubmit={savePassword} noValidate>
          <h2 className="text-xl font-semibold">Password</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            This form checks the fields locally and then clears them. It does not store or transmit a password. Do not enter a seed phrase or private key.
          </p>
          {[
            ["current-password", "Current password", current, setCurrent],
            ["new-password", "New password", next, setNext],
            ["confirm-password", "Confirm new password", confirm, setConfirm],
          ].map(([id, label, value, setter]) => (
            <div key={id} className="mt-4">
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={id}
                type={show ? "text" : "password"}
                autoComplete={id === "current-password" ? "current-password" : "new-password"}
                value={value}
                onChange={(event) => setter(event.target.value)}
                className="field mt-2"
              />
            </div>
          ))}
          <button type="button" className="mt-3 text-sm text-mist underline-offset-4 hover:underline" onClick={() => setShow((value) => !value)}>
            {show ? "Hide passwords" : "Show passwords"}
          </button>
          {passwordError ? (
            <p role="alert" className="mt-3 text-sm text-danger">
              {passwordError}
            </p>
          ) : null}
          <button type="submit" className="btn btn-secondary btn-sm mt-4">
            Review password change
          </button>
        </form>
      </section>

      <ReferralTools />

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="dash-card p-6">
          <h2 className="text-xl font-semibold">Notification preferences</h2>
          <ul className="mt-4 space-y-3">
            {preferenceCopy.map(([key, label]) => (
              <li key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3">
                <span className="text-sm">{label}</span>
                <button
                  type="button"
                  aria-pressed={prefs[key]}
                  onClick={() => updatePref(key, !prefs[key])}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${prefs[key] ? "bg-royal/20 text-snow" : "bg-white/5 text-mist"}`}
                >
                  {prefs[key] ? "On" : "Off"}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-mist">Stored on this device. No messages are delivered.</p>
        </div>
        <div className="dash-card">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-xl font-semibold">Sessions</h2>
          </div>
          <EmptyState title="No sessions" body="Session management appears when authentication is connected. This preview has no signed-in session." />
          <div className="flex gap-4 px-6 pb-6 text-sm">
            <Link to="/privacy" className="text-gold">
              Privacy
            </Link>
            <Link to="/terms" className="text-gold">
              Terms
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
