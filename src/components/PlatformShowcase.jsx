import { ArrowUpRight, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { platformViews } from "../data/content";
import { getDemoModel } from "../data/demoData";
import { dashboardNav } from "../data/navigation";
import { transactionCategories } from "../data/planConfig";
import { ease, fadeUp, stagger, viewport } from "../lib/motion";
import Button from "./Button";
import { GrowthBars, LedgerRows, MiniTree, MockStat, WindowFrame } from "./landing/MockupParts";
import SectionHeading from "./SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";
import StatusBadge from "./ui/StatusBadge";

export default function PlatformShowcase() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [activeId, setActiveId] = useState(platformViews[0].id);
  const model = useMemo(() => getDemoModel(), []);
  const activeIndex = platformViews.findIndex((view) => view.id === activeId);
  const active = platformViews[activeIndex];

  const onKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = platformViews[(activeIndex + step + platformViews.length) % platformViews.length];
    setActiveId(next.id);
    document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
  };

  return (
    <section id="platform" data-act="platform" className="section overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div aria-hidden="true" className="orb pointer-events-none absolute -right-60 top-20 h-[34rem] w-[34rem] opacity-30" />

      <div className="container-page relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="The platform"
              title={
                <>
                  One dashboard. Every line <span className="serif-accent text-spectrum">accounted for.</span>
                </>
              }
            />
          </div>
          <motion.p
            className="text-base leading-relaxed text-mist lg:col-span-5"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            The member dashboard preview brings your stake, rewards ledger, network, and
            withdrawals into one calm workspace. Everything in it today is sample data, and
            it is labeled that way on every screen.
          </motion.p>
        </div>

        <div
          role="tablist"
          aria-label="Dashboard views"
          onKeyDown={onKeyDown}
          className="mt-12 grid w-full grid-cols-4 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:inline-flex sm:w-auto"
        >
          {platformViews.map((view) => {
            const selected = view.id === activeId;
            return (
              <button
                key={view.id}
                id={`${baseId}-tab-${view.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(view.id)}
                className={`relative isolate rounded-full px-1 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-300 sm:px-5 sm:text-sm ${
                  selected ? "text-white" : "text-mist hover:text-snow"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId={`${baseId}-tab-pill`}
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-[#7d76ff] to-[#5148f0] shadow-[0_8px_24px_-8px_rgba(99,91,255,0.8)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
                {view.label}
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeId}`}
          className="mt-6 grid gap-6 lg:grid-cols-12"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className="flex flex-col justify-between gap-8 lg:col-span-4"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}
            >
              <div>
                <h3 className="text-2xl leading-tight font-semibold tracking-[-0.03em] text-snow sm:text-3xl">
                  {active.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">{active.body}</p>
                <ul className="mt-6 space-y-3">
                  {active.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-snow">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-royal/20 text-iris">
                        <Check size={12} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <Button to={active.to} variant="glass" className="group self-start">
                Open {active.label.toLowerCase()} preview
                <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </Button>
            </motion.div>
          </AnimatePresence>

          <div className="lg:col-span-8">
            <div className="beam rounded-[1.4rem] shadow-float">
              <WindowFrame path={`Member dashboard · ${active.label}`}>
                <div className="relative min-h-[22rem] p-4 sm:p-6">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active.id}
                      initial={reduce ? false : { opacity: 0, scale: 0.985, filter: "blur(6px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: "blur(6px)" }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <ViewMock id={active.id} model={model} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </WindowFrame>
            </div>
          </div>
        </div>

        <ModuleGrid />
      </div>
    </section>
  );
}

function ViewMock({ id, model }) {
  const { snapshot } = model;

  if (id === "network") {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        <div className="tile p-4 md:col-span-3">
          <p className="text-xs font-medium text-snow">Network tree</p>
          <MiniTree root={model.networkRoot} width={360} height={190} className="mt-4" />
        </div>
        <ul className="space-y-2 md:col-span-2">
          {model.downline.slice(0, 5).map((person) => (
            <li key={person.id} className="tile flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-snow">{person.alias}</span>
                <span className="block text-[0.66rem] text-mist">{person.id}</span>
              </span>
              <StatusBadge status={person.verification} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (id === "ledger") {
    const shown = ["stake", "direct_reward", "withdrawal"];
    return (
      <div>
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          <span className="rounded-full bg-royal/20 px-3 py-1 text-[0.7rem] font-medium text-iris">All categories</span>
          {transactionCategories
            .filter((category) => shown.includes(category.id))
            .map((category) => (
              <span key={category.id} className="rounded-full border border-white/10 px-3 py-1 text-[0.7rem] text-mist">
                {category.label}
              </span>
            ))}
          <span className="ml-auto rounded-full border border-white/10 px-3 py-1 text-[0.7rem] text-mist">Export CSV</span>
        </div>
        <div className="mt-4">
          <LedgerRows rows={model.transactions.slice(0, 6)} />
        </div>
      </div>
    );
  }

  if (id === "withdrawals") {
    const lines = [
      ["Requested amount", "Entered by you"],
      ["Stated deductions", "Listed separately"],
      ["Stated allocations", "Listed separately"],
    ];
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="tile p-5">
          <p className="text-xs font-medium text-snow">Request a withdrawal</p>
          <div className="mt-4 space-y-3" aria-hidden="true">
            <div className="h-11 rounded-xl border border-white/10 bg-white/[0.02]" />
            <div className="h-11 rounded-xl border border-white/10 bg-white/[0.02]" />
            <div className="h-10 w-40 rounded-full bg-gradient-to-b from-[#7d76ff] to-[#5148f0] opacity-80" />
          </div>
        </div>
        <div className="tile p-5">
          <p className="text-xs font-medium text-snow">Stated lines</p>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {lines.map(([line, state]) => (
              <li key={line} className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-mist">{line}</span>
                <span className="text-snow">{state}</span>
              </li>
            ))}
            <li className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-medium text-snow">Net payout</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-semibold text-mist">Not calculated</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MockStat label="Directs" value={snapshot.directReferrals} />
        <MockStat label="Team" value={snapshot.teamMembers} />
        <MockStat label="Verified" value={snapshot.verifiedRecords} accent="text-success" />
        <MockStat label="Requests" value={snapshot.withdrawalRequests} hint="Withdrawal rows" />
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <div className="tile p-4 md:col-span-3">
          <p className="text-xs font-medium text-snow">Team growth by week</p>
          <div className="mt-4">
            <GrowthBars growth={model.growth} />
          </div>
        </div>
        <div className="tile p-4 md:col-span-2">
          <p className="text-xs font-medium text-snow">Activity</p>
          <ul className="mt-3 space-y-3">
            {model.activity.map((line) => (
              <li key={line} className="flex gap-2.5 text-xs leading-relaxed text-mist">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ModuleGrid() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-snow">
          {dashboardNav.length} modules in the preview
        </h3>
        <Link to="/dashboard" className="text-sm text-iris transition-colors hover:text-snow">
          Open the full dashboard preview →
        </Link>
      </div>
      <motion.ul
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        variants={stagger}
        initial={reduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {dashboardNav.map((item) => {
          const Icon = item.icon;
          return (
            <motion.li key={item.to} variants={fadeUp}>
              <SpotlightCard className="h-full rounded-2xl border border-white/[0.07] bg-[#080c1b]/80 backdrop-blur-sm">
                <Link to={item.to} className="flex h-full flex-col gap-4 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal/15 text-iris">
                    <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-snow">{item.label}</span>
                    <span className="mt-0.5 block text-[0.68rem] tracking-[0.14em] text-mist uppercase">{item.group}</span>
                  </span>
                </Link>
              </SpotlightCard>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
