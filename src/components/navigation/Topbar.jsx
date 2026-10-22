import { Bell, ChevronRight, Menu, Search, Wallet } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useDashboard } from "../../hooks/useDashboard";
import { demoMember } from "../../data/demoData";
import { matchNav } from "../../data/navigation";
import { formatDate } from "../../lib/dates";
import { ease } from "../../lib/motion";

const destinations = {
  stake: "/dashboard/stake",
  reward: "/dashboard/rewards",
  withdrawal: "/dashboard/withdrawals",
  rank: "/dashboard/ranks",
  referral: "/dashboard/referrals",
  announcement: "/dashboard/help",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const current = matchNav(pathname);
  const { setMobileOpen, setSearchOpen, notifications, unreadCount, markRead, displayName } = useDashboard();
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
  const name = displayName || demoMember.displayName;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenu(false);
      if (alertRef.current && !alertRef.current.contains(event.target)) setAlerts(false);
    };
    const onKey = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
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
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? undefined : { opacity: 0, y: 4 },
    transition: { duration: 0.2, ease },
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080B14]/75 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} />
        </button>
        <div className="min-w-36 flex-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-mist">
            <Link to="/dashboard" className="hover:text-snow">
              Dashboard
            </Link>
            <ChevronRight size={12} className="text-white/30" aria-hidden="true" />
            <span className="truncate text-snow/80">{current.label}</span>
          </nav>
          <h1 className="truncate text-lg font-semibold tracking-[-0.03em] sm:text-xl">{current.label}</h1>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card md:hidden"
          aria-label="Search or jump to a page"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={16} />
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-2 lg:flex" title="No wallet provider is connected to this preview">
          <span className="h-1.5 w-1.5 rounded-full bg-mist" aria-hidden="true" />
          <Wallet size={14} className="text-mist" aria-hidden="true" />
          <span className="text-xs text-mist">No wallet</span>
        </div>
        <div className="relative" ref={alertRef}>
          <button
            type="button"
            className="icon-btn relative"
            aria-expanded={alerts}
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
            onClick={() => {
              setAlerts((open) => !open);
              setMenu(false);
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 ? <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold" aria-hidden="true" /> : null}
          </button>
          <AnimatePresence>
            {alerts ? (
              <motion.div {...panelMotion} className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-3xl border border-line bg-card p-2 shadow-2xl">
                <p className="px-3 py-2 text-xs tracking-[0.14em] text-mist uppercase">Recent preview notices</p>
                <ul>
                  {notifications.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <Link
                        to={destinations[item.type] ?? "/dashboard/notifications"}
                        className="block rounded-2xl px-3 py-2.5 hover:bg-white/[0.04]"
                        onClick={() => {
                          markRead(item.id);
                          setAlerts(false);
                        }}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-snow">
                          {!item.read ? <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" /> : null}
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs text-mist">{formatDate(item.at, true)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard/notifications" className="block px-3 py-2 text-sm text-gold" onClick={() => setAlerts(false)}>
                  View notification center
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pr-3 pl-1 transition-colors hover:border-royal/40"
            aria-expanded={menu}
            aria-haspopup="menu"
            onClick={() => {
              setMenu((open) => !open);
              setAlerts(false);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-royal/25 text-[0.7rem] font-semibold text-snow ring-1 ring-gold/40">
              {initials || "DM"}
            </span>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{name}</span>
          </button>
          <AnimatePresence>
            {menu ? (
              <motion.div {...panelMotion} role="menu" className="absolute right-0 z-20 mt-2 w-60 rounded-3xl border border-line bg-card p-2 shadow-2xl">
                <p className="px-3 py-2 text-xs leading-relaxed text-mist">Preview profile. No account is signed in.</p>
                {[
                  ["/dashboard/profile", "Profile & Security"],
                  ["/dashboard/notifications", "Notifications"],
                  ["/dashboard/help", "Help & Support"],
                  ["/", "Back to the website"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    role="menuitem"
                    className="block rounded-2xl px-3 py-2.5 text-sm text-snow hover:bg-white/[0.04]"
                    onClick={() => setMenu(false)}
                  >
                    {label}
                  </Link>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
