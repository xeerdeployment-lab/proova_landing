import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, dataSource } from "../services/api";
import { DashboardContext } from "./dashboard-context";

const sidebarKey = "axora.dash.sidebar";
const prefsKey = "axora.dash.prefs";
const readsKey = "axora.dash.reads";
const pendingPollMs = 2_500;

const defaultPrefs = {
  rewards: true,
  withdrawals: true,
  team: true,
  announcements: true,
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Preferences are a convenience; the dashboard works without storage.
  }
}

/** True while the server still has something to settle, so the dashboard keeps checking. */
function hasPendingWork(account) {
  if (!account) return false;
  return Boolean(account.stake.pending) || account.balances.pendingWithdrawalCents > 0 || account.referrals.directs.some((d) => d.status === "pending");
}

export function DashboardProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => readJson(sidebarKey, false) === true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set(readJson(readsKey, [])));
  const [prefs, setPrefs] = useState(() => ({ ...defaultPrefs, ...readJson(prefsKey, {}) }));
  const [toasts, setToasts] = useState([]);
  const [load, setLoad] = useState({ status: dataSource === "offline" ? "offline" : "loading", account: null, error: null });
  const skew = useRef(0);

  const applyAccount = useCallback((account) => {
    if (!account) return;
    skew.current = new Date(account.serverTime).getTime() - Date.now();
    setLoad({ status: "ready", account, error: null });
  }, []);

  const refresh = useCallback(() => {
    if (dataSource === "offline") return Promise.resolve();
    return api.getAccount().then(applyAccount, (error) => {
      // A failed background refresh keeps the last good account on screen.
      setLoad((current) => (current.account ? current : { status: error.code === "offline" ? "offline" : "error", account: null, error }));
    });
  }, [applyAccount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = hasPendingWork(load.account);
  // Poll only while the tab is visible; a returning tab refreshes at once so it never shows a stale balance.
  useEffect(() => {
    if (!pending) return undefined;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      id = document.hidden ? 0 : window.setInterval(refresh, pendingPollMs);
    };
    const onVisibility = () => {
      if (!document.hidden) refresh();
      start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pending, refresh]);

  const retry = useCallback(() => {
    setLoad({ status: "loading", account: null, error: null });
    refresh();
  }, [refresh]);

  const serverNow = useCallback(() => Date.now() + skew.current, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      writeJson(sidebarKey, !current);
      return !current;
    });
  }, []);

  const markRead = useCallback((id) => {
    setReadIds((current) => {
      const next = new Set(current).add(id);
      writeJson(readsKey, [...next]);
      return next;
    });
  }, []);

  const allNotifications = load.account?.notifications;
  const markAllRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      (allNotifications ?? []).forEach((item) => next.add(item.id));
      writeJson(readsKey, [...next]);
      return next;
    });
  }, [allNotifications]);

  const updatePref = useCallback((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      writeJson(prefsKey, next);
      return next;
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone: "info", ...toast }]);
      window.setTimeout(() => dismissToast(id), 4800);
    },
    [dismissToast],
  );

  const notifications = useMemo(
    () => (allNotifications ?? []).map((item) => ({ ...item, read: readIds.has(item.id) })),
    [allNotifications, readIds],
  );

  const value = useMemo(
    () => ({
      source: dataSource,
      status: load.status,
      error: load.error,
      account: load.account,
      refresh,
      retry,
      applyAccount,
      serverNow,
      collapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      searchOpen,
      setSearchOpen,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markRead,
      markAllRead,
      prefs,
      updatePref,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      load,
      refresh,
      retry,
      applyAccount,
      serverNow,
      collapsed,
      toggleCollapsed,
      mobileOpen,
      searchOpen,
      notifications,
      markRead,
      markAllRead,
      prefs,
      updatePref,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
