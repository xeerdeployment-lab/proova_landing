import { FastForward, PanelLeftClose, PanelLeftOpen, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { dashboardGroups, dashboardNav } from "../../data/navigation";
import { useDashboard } from "../../hooks/useDashboard";
import cx from "../../lib/cx";
import { initialsOf } from "../../lib/format";
import { ease } from "../../lib/motion";
import { demoTools } from "../../services/api";
import Logo from "../Logo";

function NavItems({ collapsed, onNavigate }) {
  const { account } = useDashboard();
  const badges = {
    "/dashboard/daily-income": account?.daily.canClaim ? "Claim" : null,
    "/dashboard/restake": account?.stake.restake.required ? "Due" : null,
  };

  return dashboardGroups.map((group) => (
    <div key={group} className="mt-6 first:mt-2">
      <p className={cx("px-3 text-[0.625rem] font-semibold tracking-[0.18em] text-mist/70 uppercase", collapsed && "sr-only")}>{group}</p>
      <div className="mt-2 space-y-0.5">
        {dashboardNav
          .filter((item) => item.group === group && !item.hidden)
          .map((item) => {
            const Icon = item.icon;
            const badge = badges[item.to];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                    isActive ? "bg-accent/[0.1] text-snow" : "text-mist hover:bg-white/[0.04] hover:text-snow",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(57,217,138,0.7)]"
                        transition={{ duration: 0.3, ease }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon size={18} aria-hidden="true" className={cx("shrink-0", isActive && "text-accent")} />
                    <span className={cx("truncate", collapsed && "sr-only")}>{item.label}</span>
                    {badge && !collapsed ? (
                      <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold text-mint">{badge}</span>
                    ) : null}
                    {badge && collapsed ? <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" /> : null}
                  </>
                )}
              </NavLink>
            );
          })}
      </div>
    </div>
  ));
}

function DemoTools({ collapsed }) {
  const { source, applyAccount, pushToast, account } = useDashboard();
  const [busy, setBusy] = useState(false);
  if (source !== "demo" || collapsed) return null;

  const run = async (action, title) => {
    setBusy(true);
    try {
      applyAccount(await action());
      pushToast({ title, body: "Development ledger only." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-warning/20 bg-warning/[0.04] p-3">
      <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-warning uppercase">Demo ledger</p>
      <label className="mt-2 block text-[0.7rem] text-mist">
        Scenario
        <select
          className="field mt-1 py-1.5 text-xs"
          value={account?.scenario ?? "active"}
          disabled={busy}
          onChange={(event) => run(() => demoTools.reset(event.target.value), "Demo scenario loaded")}
        >
          <option value="active">Active member</option>
          <option value="capped">Capability reached</option>
          <option value="new">New member</option>
        </select>
      </label>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button type="button" className="btn btn-secondary btn-sm px-2 text-xs" disabled={busy} onClick={() => run(() => demoTools.advanceClock(24), "Clock moved 24 hours")}>
          <FastForward size={13} aria-hidden="true" />
          +24h
        </button>
        <button type="button" className="btn btn-secondary btn-sm px-2 text-xs" disabled={busy} onClick={() => run(() => demoTools.reset(account?.scenario), "Demo ledger reset")}>
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}

function ProfileFooter({ collapsed }) {
  const { account } = useDashboard();
  const name = account?.member.displayName ?? "Member";
  return (
    <NavLink to="/dashboard/profile" className={cx("flex items-center gap-3 border-t border-line px-4 py-4 hover:bg-white/[0.03]", collapsed && "justify-center px-2")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-teal/20 text-xs font-semibold text-mint ring-1 ring-accent/30">
        {initialsOf(name)}
      </span>
      <span className={cx("min-w-0", collapsed && "sr-only")}>
        <span className="block truncate text-sm font-medium text-snow">{name}</span>
        <span className="block truncate text-xs text-mist">{account?.member.id ?? "Not signed in"}</span>
      </span>
    </NavLink>
  );
}

export function SidebarPanel({ collapsed = false, onNavigate, onToggle, showClose = false, className = "" }) {
  return (
    <div className={cx("flex h-full min-h-0 flex-col bg-panel/80", className)}>
      <div className={cx("flex items-center gap-2 px-4 pt-5 pb-3", collapsed && "flex-col px-2")}>
        <Logo variant="dashboard" markOnly={collapsed} className={collapsed ? "" : "min-w-0 flex-1"} />
        {onToggle ? (
          <button type="button" className="icon-btn h-9 w-9 shrink-0" onClick={onToggle} aria-pressed={collapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        ) : null}
        {showClose ? (
          <button type="button" className="icon-btn h-9 w-9 shrink-0" onClick={onNavigate} aria-label="Close menu">
            <X size={16} />
          </button>
        ) : null}
      </div>
      <nav className="dash-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        <NavItems collapsed={collapsed} onNavigate={onNavigate} />
      </nav>
      <DemoTools collapsed={collapsed} />
      <ProfileFooter collapsed={collapsed} />
    </div>
  );
}

export default function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useDashboard();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      <motion.aside
        className="sticky top-0 hidden h-dvh shrink-0 overflow-hidden border-r border-line lg:block"
        initial={false}
        animate={{ width: collapsed ? 84 : 264 }}
        transition={{ duration: reduce ? 0 : 0.32, ease }}
      >
        <SidebarPanel collapsed={collapsed} onToggle={toggleCollapsed} className="h-dvh" />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div key="drawer" className="fixed inset-0 z-[70] lg:hidden" exit={{ opacity: 1 }}>
            <motion.button
              type="button"
              className="absolute inset-0 bg-[#04070d]/75 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 w-[min(86vw,18rem)] border-r border-line bg-canvas shadow-2xl"
              initial={reduce ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "-100%" }}
              transition={{ duration: 0.3, ease }}
            >
              <SidebarPanel showClose onNavigate={() => setMobileOpen(false)} className="h-full" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
