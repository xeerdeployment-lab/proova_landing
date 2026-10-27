import { CalendarClock, Gift } from "lucide-react";
import { useState } from "react";
import Countdown from "../../components/dashboard/Countdown";
import DashHeading from "../../components/dashboard/DashHeading";
import SuccessMark from "../../components/dashboard/SuccessMark";
import { HeroOrbital } from "../../components/dashboard/Visuals";
import DataTable from "../../components/tables/DataTable";
import Ledger from "../../components/tables/Ledger";
import Modal from "../../components/ui/Modal";
import MoneyFigure from "../../components/ui/MoneyFigure";
import Reveal from "../../components/ui/Reveal";
import { InlineError } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { planConfig, transactionCategories } from "../../data/planConfig";
import { useAccount, useMutation } from "../../hooks/useAccount";
import { useDashboard } from "../../hooks/useDashboard";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";
import { api } from "../../services/api";
import BreakdownRows from "../../components/dashboard/BreakdownRows";

export default function DailyIncome() {
  usePageTitle("Daily Income");
  const account = useAccount();
  const { refresh, pushToast } = useDashboard();
  const { daily } = account;
  const [open, setOpen] = useState(false);
  const mutation = useMutation(api.claimDailyIncome);
  const levelStatus = (row) => (row.eligible === 0 ? "waiting" : daily.canClaim ? "open" : "pending");

  const close = () => {
    if (mutation.submitting) return;
    setOpen(false);
  };

  const confirm = async () => {
    const result = await mutation.submit();
    if (result) pushToast({ title: "Daily income claimed", body: `${formatCents(result.amountCents)} was added to your balance.`, tone: "success" });
  };

  return (
    <div className="space-y-8">
      <section className="hero-surface p-6 sm:p-8" aria-labelledby="claim-title">
        <HeroOrbital className="absolute top-1/2 -right-24 hidden w-80 -translate-y-1/2 opacity-60 sm:block" />
        <div className="relative max-w-lg">
          <div className="flex flex-wrap items-center gap-2">
            <p className="kicker text-mint/80" id="claim-title">
              Today&apos;s claimable income
            </p>
            <StatusBadge status={daily.canClaim ? "open" : "waiting"} label={daily.canClaim ? "Ready" : "Not available"} />
          </div>
          <MoneyFigure cents={daily.canClaim ? daily.claimableCents : 0} className="font-display-num mt-3 block text-5xl font-semibold" />
          <p className="mt-2 text-sm text-mist">
            {formatCents(daily.totalCents)} per day from {daily.rows.reduce((sum, row) => sum + row.eligible, 0)} eligible active users
            {daily.claimableCents < daily.totalCents && daily.canClaim ? ` · clipped to remaining capability` : ""}
          </p>

          {daily.nextClaimAt && !daily.windowOpen ? (
            <p className="mt-5 flex items-center gap-2 text-sm text-mist">
              <CalendarClock size={16} className="text-accent" aria-hidden="true" />
              Next claim in <Countdown to={daily.nextClaimAt} onElapsed={refresh} className="font-semibold text-snow" />
              <span className="text-xs">({formatDate(daily.nextClaimAt, true)})</span>
            </p>
          ) : null}
          {daily.blocker && daily.windowOpen ? <p className="mt-5 text-sm text-warning">{daily.blocker}</p> : null}

          <button
            type="button"
            className="btn btn-primary mt-6 w-full sm:w-auto"
            disabled={!daily.canClaim}
            onClick={() => {
              mutation.reset();
              setOpen(true);
            }}
          >
            <Gift size={16} aria-hidden="true" />
            Claim daily income
          </button>
          <p className="mt-3 text-xs text-mist">
            One claim per {planConfig.dailyIncome.claimIntervalHours} hours, timed by the server. Last claim: {daily.lastClaimAt ? formatDate(daily.lastClaimAt, true) : "never"}.
          </p>
        </div>
      </section>

      <Reveal>
        <section>
          <DashHeading
            kicker="Levels"
            title="10-level income"
            lede="A fixed dollar amount per eligible active user at each level — not a percentage. Totals refresh from the server whenever your team changes."
          />
          <div className="dash-card overflow-hidden">
            <DataTable
              caption="Daily income by level"
              rows={daily.rows.map((row) => ({ ...row, id: `L${row.level}` }))}
              columns={[
                { key: "level", header: "Level", cell: (row) => <span className="font-medium text-snow">Level {row.level}</span> },
                { key: "eligible", header: "Eligible users", cell: (row) => <span className="num">{row.eligible} users</span> },
                { key: "rate", header: "Per user", cell: (row) => <span className="num">{formatCents(row.rateCents)} each</span> },
                { key: "claimed", header: "Total claimed", cell: (row) => <span className="num">{formatCents(row.claimedCents)} claimed</span> },
                { key: "status", header: "Status", cell: (row) => <StatusBadge status={levelStatus(row)} label={row.eligible === 0 ? "No users" : daily.canClaim ? "Claimable" : "Claimed"} /> },
                { key: "daily", header: "Daily income", align: "right", cell: (row) => <span className="num font-semibold text-mint">{formatCents(row.dailyCents)}</span> },
              ]}
            />
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3.5 text-sm sm:px-5">
              <span className="font-medium">Total per day</span>
              <span className="num text-base font-semibold text-mint">{formatCents(daily.totalCents)}</span>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Claim history" />
          <Ledger
            rows={account.ledger.filter((row) => row.category === "daily_income")}
            categories={transactionCategories.filter((item) => item.id === "daily_income")}
            filename="axora-daily-income.csv"
            pageSize={6}
            emptyTitle="No claims yet"
            emptyBody="Your daily income claims will be listed here."
          />
        </section>
      </Reveal>

      <Modal open={open} title={mutation.status === "success" ? "Income claimed" : "Claim daily income"} description={mutation.status === "success" ? undefined : "Calculated from your eligible active users at each level."} onClose={close}>
        {mutation.status === "success" ? (
          <div className="flex flex-col items-center text-center">
            <SuccessMark />
            <p className="font-display-num mt-4 text-3xl font-semibold text-mint">+{formatCents(mutation.result.amountCents)}</p>
            <p className="num mt-1 text-xs text-mist">Reference {mutation.result.transactionId}</p>
            <p className="mt-4 text-sm text-mist">Next claim opens {formatDate(mutation.result.nextClaimAt, true)}.</p>
            <button type="button" className="btn btn-primary mt-6 w-full" onClick={close}>
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <BreakdownRows
              rows={daily.rows.filter((row) => row.dailyCents > 0).map((row) => ({ label: `Level ${row.level} · ${row.eligible} × ${formatCents(row.rateCents)}`, cents: row.dailyCents }))}
              total={{ label: "You'll receive", cents: daily.claimableCents }}
            />
            {daily.claimableCents < daily.totalCents ? (
              <p className="text-xs text-warning">Only {formatCents(daily.claimableCents)} fits inside your remaining reward capability.</p>
            ) : null}
            <InlineError error={mutation.error} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn-secondary" onClick={close} disabled={mutation.submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={confirm} disabled={mutation.submitting}>
                {mutation.submitting ? "Claiming…" : `Claim ${formatCents(daily.claimableCents)}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
