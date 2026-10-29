import { Bell, ChevronRight, LogOut, Menu, Search, Wallet } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { matchNav } from "../../data/navigation";
import { useDashboard } from "../../hooks/useDashboard";
import cx from "../../lib/cx";
import { formatDate } from "../../lib/dates";
import { initialsOf, shortAddress } from "../../lib/format";
import { ease } from "../../lib/motion";
import Logo from "../Logo";

const destinations = {
  stake: "/dashboard/stake",
  reward: "/dashboard/rewards",
  withdrawal: "/dashboard/withdrawals",
  rank: "/dashboard/ranks",
  referral: "/dashboard/referrals",
  announcement: "/dashboard/notifications",
};

const statusCopy = {
  api: { label: "Live", tone: "live", title: "Connected to the Axora member API" },
  demo: { label: "Demo ledger", tone: "warning", title: "Development build using local demo data" },
  offline: { label: "Offline", tone: "muted", title: "No member API is configured" },
};

function NetworkStatus() {
  const { source, status } = useDashboard();
  const copy = status === "error" ? { label: "Unreachable", tone: "muted", title: "The member API did not respond" } : statusCopy[source];
  return (
    <span className="hidden items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1.5 text-xs text-mist xl:inline-flex" title={copy.title}>
      <span className="live-dot" data-tone={copy.tone === "live" ? undefined : copy.tone} aria-hidden="true" />
      {copy.label}
    </span>
  );
}

function WalletStatus() {
  const { account, source } = useDashboard();
  const address = account?.member.walletAddress;
  return (
    <span
      className={cx(
        "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:inline-flex",
        address ? "border-accent/25 bg-accent/[0.06] text-snow" : "border-line bg-card/70 text-mist",
      )}
      title={address ? `${source === "demo" ? "Demo address" : "Linked address"} ${address}` : "No wallet is linked to this account"}
    >
      <Wallet size={14} className={address ? "text-accent" : "text-mist"} aria-hidden="true" />
      <span className="num">{address ? shortAddress(address) : "No wallet"}</span>
      {address && source === "demo" ? <span className="text-[0.625rem] font-semibold tracking-wider text-warning uppercase">Demo</span> : null}
    </span>
  );
}

export default function Topbar() {
  const { pathname } = useLocation();
  const current = matchNav(pathname);
  const { setMobileOpen, setSearchOpen, notifications, unreadCount, markRead, account } = useDashboard();
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenu(false);
    setAlerts(false);
  }
  const menuRef = useRef(null);
  const alertRef = useRef(null);
  const name = account?.member.displayName ?? "Member";

  useEffect(() => {
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenu(false);
      if (alertRef.current && !alertRef.current.contains(event.target)) setAlerts(false);
    };
    const onKey = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);
      if (event.key === "Escape") {
        setMenu(false);
        setAlerts(false);
      }
      if (!typing && (event.key === "/" || (event.key === "k" && (event.metaKey || event.ctrlKey)))) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [setSearchOpen]);

  const panelMotion = {
    initial: reduce ? false : { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reduce ? undefined : { opacity: 0, y: 4 },
    transition: { duration: 0.18, ease },
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-10">
        <button type="button" className="icon-btn shrink-0 lg:hidden" aria-label="Open menu — all pages" onClick={() => setMobileOpen(true)}>
          <Menu size={18} />
        </button>
        <Link to="/dashboard" aria-label="Axora dashboard home" className="shrink-0 max-[399px]:hidden lg:hidden">
          <Logo variant="dashboard" markOnly />
        </Link>
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-mist sm:flex">
            <Link to="/dashboard" className="hover:text-snow">
              Dashboard
            </Link>
            {current.to !== "/dashboard" ? (
              <>
                <ChevronRight size={12} className="text-white/30" aria-hidden="true" />
                <span className="truncate text-snow/80" aria-current="page">
                  {current.label}
                </span>
              </>
            ) : null}
          </nav>
          <h1 className="truncate text-base font-semibold tracking-[-0.02em] min-[400px]:text-lg sm:text-xl">
            {current.short && current.label.length > 13 ? (
              <>
                <span className="sm:hidden">{current.short}</span>
                <span className="max-sm:hidden">{current.label}</span>
              </>
            ) : (
              current.label
            )}
          </h1>
        </div>

        <NetworkStatus />
        {/* <button
          type="button"
          className="icon-btn shrink-0 xl:w-auto xl:gap-2 xl:px-3"
          aria-label="Search or jump to a page"
          aria-keyshortcuts="Control+K"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={16} />
          <span className="hidden text-xs text-mist xl:inline">Search</span>
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[0.625rem] text-mist xl:inline">Ctrl K</kbd>
        </button> */}
        <WalletStatus />

        <div className="relative" ref={alertRef}>
          <button
            type="button"
            className="icon-btn relative"
            aria-expanded={alerts}
            aria-haspopup="true"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
            onClick={() => {
              setAlerts((open) => !open);
              setMenu(false);
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-[#04140c]" aria-hidden="true">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          <AnimatePresence>
            {alerts ? (
              <motion.div {...panelMotion} className="dash-card fixed inset-x-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-20 max-h-[calc(100dvh-11rem)] origin-top overflow-y-auto p-2 shadow-2xl sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:max-h-none sm:w-[22rem] sm:origin-top-right">
                <p className="kicker px-3 py-2">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-mist">You&apos;re all caught up.</p>
                ) : (
                  <ul>
                    {notifications.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <Link
                          to={destinations[item.type] ?? "/dashboard/notifications"}
                          className="block rounded-xl px-3 py-2.5 hover:bg-white/[0.04]"
                          onClick={() => {
                            markRead(item.id);
                            setAlerts(false);
                          }}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium text-snow">
                            {!item.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
                            <span className="truncate">{item.title}</span>
                          </span>
                          <span className="mt-1 block text-xs text-mist">{formatDate(item.at, true)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/dashboard/notifications" className="mt-1 block rounded-xl px-3 py-2 text-sm font-medium text-mint hover:bg-white/[0.04]" onClick={() => setAlerts(false)}>
                  View all notifications
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-line bg-card p-1 transition-colors hover:border-accent/40 xl:pr-3"
            aria-expanded={menu}
            aria-haspopup="menu"
            aria-label="Account menu"
            onClick={() => {
              setMenu((open) => !open);
              setAlerts(false);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-teal/20 text-[0.7rem] font-semibold text-mint ring-1 ring-accent/30">
              {initialsOf(name)}
            </span>
            <span className="hidden max-w-32 truncate text-sm font-medium xl:block">{name}</span>
          </button>
          <AnimatePresence>
            {menu ? (
              <motion.div {...panelMotion} role="menu" className="dash-card absolute right-0 z-20 mt-2 w-60 origin-top-right p-2 shadow-2xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-snow">{name}</p>
                  <p className="truncate text-xs text-mist">{account?.member.id}</p>
                </div>
                <div className="my-1 h-px bg-line" />
                {[
                  ["/dashboard/profile", "Profile & Settings"],
                  ["/dashboard/notifications", "Notifications"],
                  ["/dashboard/help", "Help & Support"],
                ].map(([to, label]) => (
                  <Link key={to} to={to} role="menuitem" className="block rounded-xl px-3 py-2.5 text-sm text-snow hover:bg-white/[0.04]" onClick={() => setMenu(false)}>
                    {label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-line" />
                <Link to="/" role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-mist hover:bg-white/[0.04] hover:text-snow" onClick={() => setMenu(false)}>
                  <LogOut size={14} aria-hidden="true" />
                  Back to website
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
