import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { useDashboard } from "../../hooks/useDashboard";
import { demoMember } from "../../data/demoData";
import { dashboardGroups, dashboardNav } from "../../data/navigation";
import cx from "../../lib/cx";
import { ease } from "../../lib/motion";
import Logo from "../Logo";

const modes = [
  { id: "sample", label: "Sample" },
  { id: "empty", label: "Empty" },
  { id: "loading", label: "Loading" },
  { id: "error", label: "Error" },
];

function NavItems({ collapsed, onNavigate, unreadCount }) {
  return dashboardGroups.map((group) => (
    <div key={group} className="mt-7 first:mt-2">
      <p className={cx("px-3 text-[0.62rem] font-semibold tracking-[0.18em] text-mist/80 uppercase", collapsed && "sr-only")}>{group}</p>
      <div className="mt-2 space-y-1">
        {dashboardNav
          .filter((item) => item.group === group)
          .map((item) => {
            const Icon = item.icon;
            const showCount = item.to === "/dashboard/notifications" && unreadCount > 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    "relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-[0.92rem] transition-colors duration-300",
                    isActive
                      ? "bg-[linear-gradient(90deg,rgba(118,103,255,0.22),rgba(118,103,255,0.04))] text-snow"
                      : "text-mist hover:bg-white/[0.04] hover:text-snow",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-electric to-royal transition-opacity duration-300",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                    <Icon size={18} aria-hidden="true" className={cx("shrink-0", isActive && "text-electric")} />
                    <span className={cx("truncate", collapsed && "sr-only")}>{item.label}</span>
                    {showCount && !collapsed ? (
                      <span className="ml-auto rounded-full bg-gold/15 px-2 py-0.5 text-[0.68rem] font-semibold text-gold">{unreadCount}</span>
                    ) : null}
                    {showCount && collapsed ? <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" /> : null}
                  </>
                )}
              </NavLink>
            );
          })}
      </div>
    </div>
  ));
}

function ModeSwitch({ collapsed }) {
  const { dataMode, setDataMode } = useDashboard();
  if (collapsed) return null;
  return (
    <div className="px-3 pb-3">
      <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-mist uppercase">Preview states</p>
      <div className="mt-2 grid grid-cols-4 gap-1 rounded-2xl border border-line bg-navy/60 p-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-pressed={dataMode === mode.id}
            onClick={() => setDataMode(mode.id)}
            className={cx(
              "rounded-xl px-1 py-1.5 text-[0.68rem] font-semibold transition-colors",
              dataMode === mode.id ? "bg-royal/20 text-snow" : "text-mist hover:text-snow",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Profile({ collapsed, name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className={cx("flex items-center gap-3 border-t border-line px-4 py-4", collapsed && "justify-center px-2")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal/20 text-xs font-semibold text-snow ring-1 ring-gold/40">
        {initials || "DM"}
      </span>
      <span className={cx("min-w-0", collapsed && "sr-only")}>
        <span className="block truncate text-sm font-medium text-snow">{name}</span>
        <span className="block truncate text-xs text-mist">{demoMember.id}</span>
      </span>
    </div>
  );
}

export function SidebarPanel({ collapsed = false, onNavigate, onToggle, showClose = false, className = "" }) {
  const { displayName, unreadCount } = useDashboard();
  const name = displayName || demoMember.displayName;
  return (
    <div className={cx("flex h-full min-h-0 flex-col bg-obsidian", className)}>
      <div className={cx("flex items-center gap-2 px-4 pt-5 pb-2", collapsed && "flex-col px-2")}>
        <Logo variant="dashboard" markOnly={collapsed} className={collapsed ? "" : "min-w-0 flex-1"} />
        {onToggle ? (
          <button
            type="button"
            className="icon-btn h-9 w-9 shrink-0"
            onClick={onToggle}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        ) : null}
        {showClose ? (
          <button type="button" className="icon-btn h-9 w-9 shrink-0" onClick={onNavigate} aria-label="Close menu">
            <X size={16} />
          </button>
        ) : null}
      </div>
      <nav className="dash-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Member">
        <NavItems collapsed={collapsed} onNavigate={onNavigate} unreadCount={unreadCount} />
      </nav>
      <ModeSwitch collapsed={collapsed} />
      <Profile collapsed={collapsed} name={name} />
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
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.aside
        className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-line lg:block"
        animate={{ width: collapsed ? 92 : 280 }}
        transition={{ duration: reduce ? 0 : 0.32, ease }}
      >
        <SidebarPanel collapsed={collapsed} onToggle={toggleCollapsed} className="h-screen" />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div key="drawer" className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
            <motion.button
              type="button"
              className="absolute inset-0 bg-[#05070f]/75"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[min(100%,20rem)] border-r border-line shadow-2xl"
              initial={reduce ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "-100%" }}
              transition={{ duration: 0.32, ease }}
            >
              <SidebarPanel showClose onNavigate={() => setMobileOpen(false)} className="h-full" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
